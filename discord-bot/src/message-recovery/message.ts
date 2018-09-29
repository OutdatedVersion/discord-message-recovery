import httpClient from '../request/client'
import { Response } from 'got'

export interface RemovedMessage {
    content: string,
    sentByDiscordID: string,
    discordChannelID: string,
    discordMessageID: string,

    // The following are UNIX epoch timestamps
    sentAt: number,
    removedAt: number
}

export interface RemovedMessageResponse extends RemovedMessage {
    id: number
}

/**
 * Send a removed message entity to our message recovery service for persistence.
 * 
 * @param guildID The Discord guild ID where the message was sent
 * @param message Request payload outlining the removed message
 */
export function saveRemovedMessage(guildID: string, message: RemovedMessage) {
    return httpClient.post(`http://127.0.0.1:2000/guild/${guildID}/messages`, { body: message })
}

/**
 * Fetch removed messages from the message recovery service.
 * 
 * @param guildID The ID of the Discord we're looking for messages in
 * @param limit The maximum number of entities to fetch
 * @returns {Promise<RemovedMessageResponse[]>} A list of removed messages
 */
export function fetchMessages(guildID: string, limit: number): Promise<RemovedMessageResponse[]> {
    const address = `http://127.0.0.1:2000/guild/${guildID}/messages?limit=${limit}`

    // Add in handling for failed responses. 
    // - An error will be thrown if something actually goes wrong;
    // - In the current context the conditions for the API will always be true

    return httpClient.get(address)
                     .then((response: Response<any>) => response.body.result)
}