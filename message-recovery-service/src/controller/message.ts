import Router from 'koa-router'
import { fetchMessagesForGuild, createMessage } from '../service/message'

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
    
    const messages = await fetchMessagesForGuild(guildID)

    context.body = messages
})

router.post('/:guildID/messages', async context => {
    const body = <any> context.request.body
    
    // We'll go ahead and validate the request body here
    for (const key of MESSAGE_POST_REQUIRED_KEYS) {
        if (body[key] === undefined) {
            context.throw(400, `Malformed body, missing member: ${key}`)
        }
    }

    const id = await createMessage(body)

    context.body = { id }
})

export default router