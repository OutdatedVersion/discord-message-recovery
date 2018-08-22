import client from '../discord'
import log from '@kratos/logging'
import { formatName } from '../utility/user'
import { Command, hasCommand } from '../command'
import { distanceInWords } from 'date-fns'
import request from 'request-promise-native'

/**
 * A URL template at which media from messages may be found.
 */
const STORAGE_URL_BASE = 'https://kratos.outdatedversion.com/storage/message-recovery-media'

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

    console.log(body)

    if (true)
        return

    try {
        await request({
            method: 'POST',
            uri: '',
            body,
            json: true
        })

        log.info(`saved message from ${from} - ${content}`)
    }
    catch (error) {
        console.error('oh poop', error.stack)
    }
})


export const command = new Command(
    'deleted',
    async (message, args) => {
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
            const response = JSON.parse(await request(`http://kratos.local.dev.outdatedversion.com/api/message-recovery/message/${guildID}`))

            if (!response.success) {
                await notifyOfFailure()
                return
            }

            await message.reply(await createDiscordMessage(response.result))
        }
        catch (error) {
            await notifyOfFailure()
            console.error(error)
        }

        await message.delete()
    }
)

async function createDiscordMessage(messages) {
    if (messages.length == 0) {
        return 'looks like there are no removed messages!'
    }

    const discordMessage = [getStartingLine(messages), '']

    for (const message of messages) {
        const humanRemovedAt = distanceInWords(new Date(), message.removed_at, { addSuffix: true })

        // WIP
        console.log(message.sent_by_discord_id)
        const sentBy = await client.fetchUser(message.sent_by_discord_id)
        // ${formatName(sentBy)}

        discordMessage.push(`:writing_hand: ${humanRemovedAt}, name`)

        if (message.content)
            discordMessage.push('```' + message.content + '```')

        if (message.media)
            discordMessage.push(getMediaMessage(message))

        discordMessage.push('')
    }

    return discordMessage.join('\n')
}

function getMediaMessage(message) {
    const mediaMessage = []

    for (const item of message.media) {
        const url = formatMediaURL(message.discord_channel_id, message.discord_message_id, item.name, item.type)

        // TODO(ben): have emoji dependant on media type
        mediaMessage.push(`   :frame_photo: <${url}>`)
    }

    return mediaMessage
}

function getStartingLine(messages) {
    return messages.length > 1
           ? `here are the ${messages.length} removed messages for you:`
           : 'here is the last removed message for you:'
}

function formatMediaURL(discordChannelID, discordMessageID, fileName, fileType) {
    return `${STORAGE_URL_BASE}/${discordChannelID}/${discordMessageID}/${fileName}.${fileType}`
}