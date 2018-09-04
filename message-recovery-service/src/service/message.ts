import { getRepository, getManager } from 'typeorm'
import * as PostgresCode from '../database/codes'
import Message from '../database/entity/Message'
import { BadRequest } from 'http-errors'

export class DuplicateMessageError extends BadRequest {
    constructor() {
        super('There is already a message under those keys')

        this.name = 'DuplicateMessageError'
        this.statusCode = 200
    }
}

export function fetchMessagesForGuild(guildID: string, limit?: number, after?: number) {
    const repository = getRepository(Message)

    return repository.find({ discordGuildID: guildID })
}

export function createMessage(data: any) {
    const repository = getRepository(Message)
    const message = getManager().create(Message, data)

    message.removedAt = new Date(data.removedAt * 1000)
    message.sentAt = new Date(data.sentAt * 1000)

    // console.log(message)

    // Insert/upload media

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