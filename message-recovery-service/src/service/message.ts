import { getRepository, getManager } from 'typeorm'
import * as PostgresCode from '../database/codes'
import Message from '../database/entity/Message'
import { BadRequest, NotFound } from 'http-errors'

export class DuplicateMessageError extends BadRequest {

    constructor() {
        super('There is already a message under those keys')

        this.name = 'DuplicateMessageError'
        this.statusCode = 200
    }

}

export class NoSuchMessageError extends NotFound {

    constructor() {
        super('There is no message with that key')

        this.name = 'NoSuchMessageError'
        this.statusCode = 404
    }

}

/**
 * Retrieve a removed message from our datastore by its ID.
 * 
 * @param messageID The ID of the requested message
 * @returns {Promise<Message>}
 */
export function fetchMessageByID(messageID: number): Promise<Message> {
    const messageRepository = getRepository(Message)

    return messageRepository.findOne(messageID)
}

/**
 * Retrieve all messages for the provided guild.
 * 
 * @param guildID The guild from which messages should be retrieved
 * @param limit The amount of messages that may be retrieved at a single time
 * @param before _UNIX Epoch_ When we want to retrieve messages from
 * @returns {Promise<Message[]>}
 */
export function fetchMessagesByGuild(guildID: string, limit: number = 50, before?: number): Promise<Message[]> {
    const repository = getRepository(Message)

    // Limit the limit (haha)
    limit = Math.min(limit, 50)

    const query = repository.createQueryBuilder('message')
                            .where('message.discordGuildID = :guildID', { guildID })
                            .limit(limit)

    if (before !== undefined) {
        query.andWhere('message.removedAt < to_timestamp(:before)', { before })
    }

    return query.getMany()
}

/**
 * Insert a removed message into the datastore.
 * 
 * @param data Input data; it is expected to match a {@class Message}.
 */
export function createMessage(data: any) {
    const repository = getRepository(Message)
    const message = getManager().create(Message, data)

    message.removedAt = new Date(data.removedAt * 1000)
    message.sentAt = new Date(data.sentAt * 1000)

    return repository.createQueryBuilder()
                     .insert()
                     .into(Message)
                     .values([ message ])
                     .returning('id')
                     .execute()
                     .then(result => result.identifiers[0].id)
                     .catch(error => {
                        if (error.code == PostgresCode.UNIQUE_VIOLATION) {
                            throw new DuplicateMessageError()
                        }

                        throw error
                    })
}