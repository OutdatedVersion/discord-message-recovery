import httpClient from '../request/client'

export type RemovedMessagePayload = {
    content: string,
    sentByDiscordID: string,
    discordChannelID: string,
    discordMessageID: string,

    // The following are UNIX epoch timestamps
    sentAt: number,
    removedAt: number
}

/**
 * Send a removed message entity to our message recovery service for persistence.
 * 
 * @param guildID The Discord guild ID where the message was sent
 * @param message Request payload outlining the removed message
 */
export function saveRemovedMessage(guildID: string, message: RemovedMessagePayload) {
    return httpClient.post(`http://127.0.0.1:2000/guild/${guildID}/messages`, { body: message })
}
