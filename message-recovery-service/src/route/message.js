import { CRUDRouteDefinition } from 'common-routing'
import { captureClient } from '../database/postgres'
import minio from '../database/minio'
import { URL } from 'url'
import PostgresResponseCode from 'postgres-response-codes'
import Boom from 'boom'
import request from 'request-promise-native'
import uuid from 'uuid/v4'
import { createWriteStream, unlinkSync } from 'fs'

/**
 * The name of the storage bucket where message media is stored
 */
const BUCKET_NAME = 'message-recovery-media'

// TODO(ben): put some random thing in a file's name (maybe store that seperate?) in case their are duplicates - like lots of youtube thumbnails or somethin
// TODO(ben): probably break this up some so that it appears a bit cleaner
// TODO(ben): handle errors in every stage of media upload process
// TODO(ben): create system to normalize responses
// TODO(ben): break into proper kubernetes pods / update discord bot to to use this service

export default class MessageRoute extends CRUDRouteDefinition {
    
    constructor() {
        super('/message/:guildID')
    }

    async get(context) {
        const client = await captureClient()

        try {
            const { rows } = await client.query(`SELECT message.*, json_agg(json_build_object('name', message_media.name, 'type', message_media.type)) AS media FROM message LEFT JOIN message_media ON message.id = message_media.message_id GROUP BY message.id;`)

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

    async post(context) {
        const [
            content,
            discordChannelID,
            discordMessageID,
            discordGuildID,
            sentAt,
            removedAt
        ] = context.fromBody('content', 'discordChannelID', 'discordMessageID', 'discordGuildID', 'sentAt', 'removedAt')

        const { media } = context.request.body

        if (media && !Array.isArray(media)) {
            context.body = Boom.badRequest(`Malformed body member: 'media' must be an array`)
            return
        }

        const client = await captureClient()

        try {
            await client.query('BEGIN')

            const result = await client.query(
                'INSERT INTO message (discord_guild_id, discord_channel_id, discord_message_id, content, sent_at, removed_at) VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6)) RETURNING id;',
                [discordGuildID, discordChannelID, discordMessageID, content, sentAt, removedAt]
            )

            const { id } = result.rows[0]

            if (media) {
                let sql = 'INSERT INTO message_media (message_id, name, type) VALUES ', index = 1
                const parameters = []
                
                for (const url of media) {
                    const meta = extractURLInfo(url)

                    if (meta) {
                        // Upload media to Minio instance
                        await uploadRemoteFile(url, `${discordChannelID}/${discordMessageID}/${meta.full}`).catch(error => console.error(error.stack))

                        sql += `${parameters.length == 0 ? '' : ', '}($${index++}, $${index++}, $${index++})`
                        parameters.push(id, meta.name, meta.extension)
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
            await client.query('ROLLBACK')

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
    const path = await downloadFile(url).catch(error => console.error('download'))
    
    await minio.fPutObject(BUCKET_NAME, objectName, path).catch(error => console.error('minio', error))
    unlinkSync(path)
}

function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const path = `/tmp/a/${uuid()}`

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
        const name = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length - (extension.length + 1))

        return {
            full: `${name}.${extension}`,
            name,
            extension
        }
    }
    catch (ignored) {

    }
}
