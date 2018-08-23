import client from '../discord'
import log from '@kratos/logging'
import { formatName } from '../utility/user'
import { Command, hasCommand } from '../command'
import { distanceInWords } from 'date-fns'
import makeRequest, { Services } from '../request';

/**
 * A URL template at which media from messages may be found.
 */
// const STORAGE_URL_BASE = 'https://kratos.outdatedversion.com/storage/message-recovery-media'
const STORAGE_URL_BASE = 'http://kratos.local.dev.outdatedversion.com/storage/message-recovery-media'

client.on('messageDelete', async message => {
    const { cleanContent, channel, author } = message

    // do not save messages from the bot or command execution
    if (!message.guild || author.id == client.user.id || hasCommand(cleanContent))
        return

    const body = {
        content: cleanContent,
        discordChannelID: channel.id,
        discordMessageID: message.id,
        discordGuildID: message.guild.id,
        sentByDiscordID: author.id,
        sentAt: message.createdAt.getTime() / 1000,
        removedAt: Date.now()
    }

    const mediaURLs = [], { attachments } = message

    if (attachments)
        attachments.forEach(attachment => mediaURLs.push(attachment.proxyURL))

    if (mediaURLs.length)
        body.media = mediaURLs

    try {
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
        const limit = Math.min(50, parseInt(args[0]) || 5)

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
            const response = await makeRequest(Services.MESSAGE_RECOVERY, `message/${guildID}`, { limit })
            
            if (!response.success) {
                await notifyOfFailure()
                return
            }
            
            const text = await createDiscordMessage(response.result)

            await message.reply(text, {
                split: {
                    prepend: 'continued\n'
                }
            })
        }
        catch (error) {
            await notifyOfFailure()
        }

        await message.delete()
    }
)

async function createDiscordMessage(messages) {
    if (messages.length == 0) {
        return 'looks like there are no removed messages!'
    }

    let discordMessage = getStartingLine(messages)

    for (const removedMessage of messages) {
        let piece = '\n\n'

        const humanRemovedAt = distanceInWords(new Date(), removedMessage.removed_at, { addSuffix: true })
        const sentBy = await getUserName(removedMessage.sent_by_discord_id)

        piece += `:${removedMessage.content ? 'writing_hand' : 'camera'}: ${humanRemovedAt}, ${sentBy}`

        if (removedMessage.content)
            piece += '```' + removedMessage.content + '```'

        if (removedMessage.media)
            piece += getMediaMessage(removedMessage)

        discordMessage += piece
    }

    return discordMessage
}

function getMediaMessage(message) {
    let mediaMessage = ''

    for (const item of message.media) {
        const url = formatMediaURL(message.discord_channel_id, message.discord_message_id, item.name, item.type)

        // TODO(ben): have emoji dependant on media type
        mediaMessage += `     \n:${message.content ? 'frame_photo' : 'white_small_square'}: <${url}>`
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