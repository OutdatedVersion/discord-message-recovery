import Router from 'koa-router'
import { fetchMessagesByGuild, createMessage } from '../service/message'
import { attatchMediaToMessage, fetchMedia } from '../service/media'
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

    const messages = await fetchMessagesByGuild(guildID, limit, before)

    context.body = messages
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

// Sub-resource: media
router.use('/:guildID/messages/:messageID/*', async (context, next) => {
    const { messageID } = context.params

    if (!messageID.match(/\d/g)) {
        context.throw(400, 'Invalid messageID parameter')
    }

    await next()
})

router.get('/:guildID/messages/:messageID/media', async context => {
    const { messageID } = context.params

    const result = await fetchMedia(messageID)

    context.body = result
})

router.post('/:guildID/messages/:id/media', async context => {
    const { messageID } = context.params
    const body = <any> context.request.body

    if (!body.media || !body.media.length) {
        context.throw(400, 'Malformed body; Missing/empty member: media')
    }
    
    const result = await attatchMediaToMessage(messageID, body.media)

    context.body = result
})

export default router
