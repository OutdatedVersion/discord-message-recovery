import Router from 'koa-router'
import { fetchMessagesByGuild, createMessage } from '../service/message'
import { BadRequest } from 'http-errors'

const MESSAGE_POST_REQUIRED_KEYS = ['discordChannelID', 'discordMessageID', 'sentByDiscordID', 'content', 'sentAt', 'removedAt']

const router = new Router()

router.use('/:guildID/*', async (context, next) => {
    const { guildID } = context.params

    if (!guildID.match(/\d/g)) {
        context.throw(400, 'Invalid guildID parameter')
    }

    await next()
})

router.get('/:guildID/messages', async context => {
    const { guildID } = context.params
    let { limit, before } = context.query
    
    if (limit && limit.match(/[^\d]/)) {
        throw new BadRequest(`Malformed query parameter: 'limit' must be a number`)
    }

    if (before && before.match(/[^\d]/)) {
        throw new BadRequest(`Malformed query parameter: 'before' should be UNIX time`)
    }

    context.body = await fetchMessagesByGuild(guildID, limit, before)
})

router.post('/:guildID/messages', async context => {
    const { guildID } = context.params
    const body = <any> context.request.body
    
    // We'll go ahead and validate the request body here
    for (const key of MESSAGE_POST_REQUIRED_KEYS) {
        if (body[key] === undefined) {
            context.throw(400, `Malformed body, missing member: ${key}`)
        }
    }

    const id = await createMessage(guildID, body)

    context.body = { id }
})

export default router
