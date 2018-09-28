import httpClient from '../request/client'

/**
 * Instruct our recovery service to attatch the following media to a "removed message" entity.
 * 
 * @param guildID The Discord guild ID
 * @param messageID The (numerical) ID of the message we're attaching media to
 * @param mediaAddresses The addresses of the media to upload
 */
export function saveMedia(guildID: string, messageID: number, mediaAddresses: string[]) {
    const payload = {
        media: mediaAddresses
    }

    return httpClient.post(`http://127.0.0.1:2000/guild/${guildID}/messages/${messageID}/media`, { body: payload })
}