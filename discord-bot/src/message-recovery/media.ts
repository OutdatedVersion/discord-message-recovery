import { Response } from 'got'
import httpClient from '../request/client'

export interface MessageMedia {
    id: number
    fileName: string
    fileType: string
    uploadIndex: number
}

export interface BulkMessageMedia {
    [messageID: number]: MessageMedia[]
}

/**
 * Fetch the media associated with a message that has the ID provided.
 * 
 * @param guildID The Discord guild ID
 * @param messageID The ID of the message we're looking at
 * @returns {Promise<MessageMedia>} If the message has media associated with it, an array 
 *                                  of {@name MessageMedia}; if not, an empty {@name Array}.
 */
export function fetchMedia(guildID: string, messageID: number): Promise<MessageMedia> {
    const address = `http://127.0.0.1:2000/guild/${guildID}/messages/${messageID}/media`

    return httpClient.get(address)
                     .then((response: Response<any>) => response.body.result)
}

/**
 * Fetch the media associated with the messages we're looking at. This
 * will make multiple requests in parallel to fetch the data we need.
 * 
 * @param guildID The Discord guild ID
 * @param messageIDs The IDs of the message we're looking at
 * @returns {Promise<BulkMessageMedia>} A relation of message ID to the {@name MessageMedia}
 *                                      associated with it; which may be empty.
 */
export function fetchMediaBulk(guildID: string, messageIDs: number[]): Promise<BulkMessageMedia> {
    const requests = []

    for (const id of messageIDs) {
        const request = fetchMedia(guildID, id).then((result: any) => ({ id, result }))

        requests.push(request)
    }

    // Ideally, we want a relation of message ID to the media...
    // So I'll go ahead and map this accordingly

    return Promise.all(requests).then(result => 
        result.reduce((obj: any, value: any) => {
            obj[value.id] = value.result

            return obj
        }, { })
    )
}

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