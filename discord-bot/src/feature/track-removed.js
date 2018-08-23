import client from '../discord'
import log from '@kratos/logging'
import { formatName } from '../utility/user'
import { Command, hasCommand } from '../command'
import { distanceInWords } from 'date-fns'
import request from 'request-promise-native'

/**
 * A URL template at which media from messages may be found.
 */
// const STORAGE_URL_BASE = 'https://kratos.outdatedversion.com/storage/message-recovery-media'
const STORAGE_URL_BASE = 'http://kratos.local.dev.outdatedversion.com/storage/message-recovery-media'

const MAX_DISCORD_MESSAGE_SIZE = 2000

client.on('messageDelete', async message => {
    const { cleanContent, channel, author } = message

    // do not save messages from the bot or command execution
    if (!message.guild || author.id == client.user.id || hasCommand(cleanContent))
        return

    const from = formatName(author)

    const body = {
        content: cleanContent,
        discordChannelID: channel.id,
        discordMessageID: message.id,
        discordGuildID: message.guild.id,
        sentByDiscordID: author.id,
        sentAt: message.createdTimestamp,
        removedAt: Date.now()
    }

    const mediaURLs = [], { attachments } = message

    if (attachments)
        attachments.forEach(attachment => mediaURLs.push(attachment.proxyURL))

    if (mediaURLs.length)
        body.media = mediaURLs

    // console.log(body)
    // 161283779376316417
    // 161283779376316417
    // 161283779376316417

    try {
        // kratos.local.dev.outdatedversion.com/api/message-recovery
        await request({
            method: 'POST',
            uri: `http://localhost:2000/message/${body.discordGuildID}`,
            body,
            json: true
        })

        log.info(`saved message from ${author.id} -> ${cleanContent}`)
    }
    catch (error) {
        console.error('oh poop', error.stack)
    }
})


export const command = new Command(
    'deleted',
    async (message, args) => {
        // TODO(ben): make sure to use this limit; also handle if message is too large to send or something like that
        const limit = parseInt(args[0]) || 5

        const { guild } = message

        if (!guild) {
            await message.reply(`You must be in a guild when using that`)
            return
        }

        const guildID = guild.id

        async function notifyOfFailure() {
            await message.reply(`I had an issue grabbing the latest messages ):`)
        }

        try {
            // kubernetes: http://message-recovery-api/...
            // local k8s: kratos.local.dev.outdatedversion.com/api/message-recovery/

            const options = {
                uri: `http://localhost:2000/message/${guildID}`,
                qs: {
                    // limit: 1
                },  
                json: true
            }

            // console.log(`http://kratos.local.dev.outdatedversion.com/api/message-recovery/message/${guildID}`)
            const response = await request(options)

            // console.log(response)

            if (!response.success) {
                await notifyOfFailure()
                return
            }

            const text = await createDiscordMessage(response.result)

            for (let i = 0; i < text.length; i++) {
                if (i == 0)
                    await message.reply(text[i])
                else
                    await message.channel.send(text[i])
            }
        }
        catch (error) {
            await notifyOfFailure()
            console.error(error.stack)
        }

        await message.delete()
    }
)

async function createDiscordMessage(messages) {
    if (messages.length == 0) {
        return ['looks like there are no removed messages!']
    }

    const discordMessage = []
    let dirtyDiscordMessage = [getStartingLine(messages), '']
    let length = lengthOfAllArrayElements(dirtyDiscordMessage)

    dirtyDiscordMessage.push = (...items) => {
        length += lengthOfAllArrayElements(items)

        if (length > MAX_DISCORD_MESSAGE_SIZE) {
            discordMessage.push(dirtyDiscordMessage)
            
            const newArray = []
            newArray.push = dirtyDiscordMessage.push
            dirtyDiscordMessage = newArray
            length = 0
        }

        Array.prototype.push.call(dirtyDiscordMessage, ...items)
    }

    for (const removedMessage of messages) {
        const piece = []

        const humanRemovedAt = distanceInWords(new Date(), removedMessage.removed_at, { addSuffix: true })
        const sentBy = await getUserName(removedMessage.sent_by_discord_id)

        piece.push(`:${removedMessage.content ? 'writing_hand' : 'frame_photo'}: ${humanRemovedAt}, ${sentBy}`)

        if (removedMessage.content)
            piece.push('```' + removedMessage.content + '```')

        if (removedMessage.media)
            piece.push(...getMediaMessage(removedMessage))

        piece.push('')

        dirtyDiscordMessage.push(...piece)
    }

    return discordMessage.concat([dirtyDiscordMessage])
}

function getMediaMessage(message) {
    const mediaMessage = []

    for (const item of message.media) {
        const url = formatMediaURL(message.discord_channel_id, message.discord_message_id, item.name, item.type)

        // TODO(ben): have emoji dependant on media type
        mediaMessage.push(`     :${message.content ? 'frame_photo' : 'white_small_square'}: <${url}>`)
    }

    return mediaMessage
}

function getStartingLine(messages) {
    return messages.length > 1
           ? `here are the last ${messages.length} removed messages for you:`
           : 'here is the last removed message for you:'
}

function formatMediaURL(discordChannelID, discordMessageID, fileName, fileType) {
    return `${STORAGE_URL_BASE}/${discordChannelID}/${discordMessageID}/${fileName}.${fileType}`
}

async function getUserName(discordID) {
    try {
        const user = await client.fetchUser(discordID)

        return formatName(user)
    }
    catch (ignored) {
        return 'unknown'
    }
}

function lengthOfAllArrayElements(array) {
    return array.reduce((size, currentValue) => size + currentValue.length, 0)
}