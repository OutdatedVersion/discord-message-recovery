import { CRUDRouteDefinition } from '@kratos/routing'
import { captureClient } from '../database/postgres'
import minio from '../database/minio'
import { URL } from 'url'
import PostgresResponseCode from 'postgres-response-codes'
import Boom from 'boom'
import request from 'request-promise-native'
import uuid from 'uuid/v4'
import { createWriteStream, unlinkSync } from 'fs'
import { createLogger } from '@kratos/logging'
import reportError from '@kratos/error'

const log = createLogger('Route/Message')

/**
 * The name of the storage bucket where message media is stored
 */
const BUCKET_NAME = 'message-recovery-media'

// TODO(ben): handle errors in every stage of media upload process
// TODO(ben): create system to normalize responses
// TODO(ben): update discord bot to to use this service
// TODO(ben): setup kubernetes deployments for both the discord bot and this; the gateway needs to serve minio stuff too

export default class MessageRoute extends CRUDRouteDefinition {
    
    constructor() {
        super('/message/:guildID')
    }

    async get(context) {
        const guildID = parseInt(context.params.guildID)
        const limit = Math.min(50, context.query.limit) || 50
        const before = parseInt(context.query.before) || Date.now()

        if (isNaN(guildID)) {
            context.body = Boom.badRequest('Malformed Discord guild ID')
            return
        }

        const client = await captureClient()

        try {
            const { rows } = await client.query(`SELECT message.*, json_agg(json_build_object('name', message_media.name, 'type', message_media.type)) AS media FROM message LEFT JOIN message_media ON message.id = message_media.message_id WHERE message.discord_guild_id = ${guildID} AND message.removed_at < to_timestamp(${before}) GROUP BY message.id LIMIT ${limit};`)

            context.body = {
                success: true,
                result: rows.map(row => {
                    if (row.media[0].name === null)
                        delete row.media

                    return row
                })
            }
        }
        finally {
            client.release()
        }
    }

    // TODO(ben): At the moment if this fails everything is lost; there needs to be a requeue system of some sort

    async post(context) {
        const data = context.fromBody('content', 'discordChannelID', 'discordMessageID', 'discordGuildID', 'sentAt', 'removedAt', 'media?')

        // TODO(ben): Bake body validation into fromBody
        if (data.media && !Array.isArray(data.media)) {
            context.body = Boom.badRequest(`Malformed body member: 'media' must be an array`)
            return
        }

        const client = await captureClient()

        async function rollbackTransaction() {
            await client.query('ROLLBACK')
        }

        try {
            await client.query('BEGIN')

            const result = await client.query(
                'INSERT INTO message (discord_guild_id, discord_channel_id, discord_message_id, content, sent_at, removed_at) VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6)) RETURNING id;',
                [data.discordGuildID, data.discordChannelID, data.discordMessageID, data.content, data.sentAt, data.removedAt]
            )

            const { id } = result.rows[0]

            if (data.media) {
                let sql = 'INSERT INTO message_media (message_id, name, type) VALUES ', index = 1
                const parameters = []
                
                for (const url of data.media) {
                    const meta = extractURLInfo(url)

                    if (meta) {
                        // Upload media to Minio instance
                        
                        try {
                            await uploadRemoteFile(url, `${data.discordChannelID}/${data.discordMessageID}/${meta.full}`)

                            sql += `${parameters.length == 0 ? '' : ', '}($${index++}, $${index++}, $${index++})`
                            parameters.push(id, meta.name, meta.extension)
                        }
                        catch (error) {
                            await rollbackTransaction()

                            context.body = Boom.internal(`Failed to upload media ${url}`)

                            log.error(error.stack)
                            reportError(error)

                            return
                        }
                    }
                }

                await client.query(sql, parameters)
            }

            await client.query('COMMIT')

            context.body = {
                success: true
            }
        }
        catch (error) {
            await rollbackTransaction()

            if (error.code == PostgresResponseCode.UNIQUE_VIOLATION) {
                context.body = {
                    success: false,
                    error: "DUPLICATE_MESSAGE"
                }

                return
            }

            throw error
        }
        finally {
            client.release()
        }
    }

}

async function uploadRemoteFile(url, objectName) {
    const path = await downloadFile(url)
    
    await minio.fPutObject(BUCKET_NAME, objectName, path)
    unlinkSync(path)
}

function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const path = `/tmp/${uuid()}`

        const stream = createWriteStream(path)

        stream.on('finish', () => resolve(path))
        stream.on('error', reject)

        request(url).pipe(stream)
    })
}

function extractURLInfo(text) {
    try {
        const { pathname } = new URL(text)

        const extension = pathname.substring(pathname.lastIndexOf('.') + 1, pathname.length)
        const name = `${pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length - (extension.length + 1))}.${Math.floor(Math.random() * 1000)}`

        return {
            full: `${name}.${extension}`,
            name,
            extension
        }
    }
    catch (ignored) {

    }
}
