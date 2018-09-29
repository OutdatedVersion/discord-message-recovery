import discordClient from '../discord'
import { RemovedMessage, RemovedMessageResponse } from './message'
import { distanceInWords } from 'date-fns'
import { BulkMessageMedia, MessageMedia } from './media'

const MEDIA_BASE_URL = 'http://localhost:9000/message-recovery-media'

/**
 * Create a Discord message that will display the provided removed messages.
 * 
 * @param messages The messages to use
 * @param messageMedia The media for the messages
 */
export async function createDiscordMessage(messages: RemovedMessageResponse[], messageMedia: BulkMessageMedia): Promise<string> {
    if (messages.length == 0) {
        return 'looks like there are no removed messages!'
    }

    let discordMessage = getStartingLine(messages)

    for (const removedMessage of messages) {
        let piece = '\n\n'

        const friendlyRemovedAt = distanceInWords(new Date(), removedMessage.removedAt, { addSuffix: true })
        const sentBy = await fetchUserName(removedMessage.sentByDiscordID)

        piece += `:${removedMessage.content ? 'writing_hand' : 'camera'}: ${friendlyRemovedAt}, ${sentBy}`

        if (removedMessage.content) {
            piece += '```' + removedMessage.content + '```'
        }

        const media = messageMedia[removedMessage.id]

        if (media.length) {
            piece += createMediaMessage(removedMessage.id, media)
        }

        discordMessage += piece
    }

    return discordMessage
}

/**
 * Create the media related portion of a message.
 * 
 * @param messageID The owning message's ID
 * @param media The media
 */
function createMediaMessage(messageID: number, media: MessageMedia[]) {
    let mediaMessage = ''

    for (const item of media) {
        const url = `${MEDIA_BASE_URL}/${messageID}/${item.fileName}.${item.uploadIndex}.${item.fileType}`

        // TODO(ben): have emoji dependant on media type
        mediaMessage += `     \n:frame_photo: <${url}>`
    }

    return mediaMessage
}

/**
 * Grab the first line of the Discord message.
 * 
 * @param messages The messages
 */
function getStartingLine(messages: RemovedMessage[]): string {
    return messages.length > 1
           ? `here are the last ${messages.length} removed messages for you:`
           : 'here is the last removed message for you:'
}

/**
 * Fetch a user's Discord name, or returns {@code unknown}.
 * 
 * @param discordUserID The ID of the user
 * @returns {string} The user's name or {@code unknown}.
 */
async function fetchUserName(discordUserID: string) {
    try {
        const user = await discordClient.fetchUser(discordUserID)

        return `${user.username}#${user.discriminator}`
    }
    catch (ignored) {
        return 'unknown'
    }
}