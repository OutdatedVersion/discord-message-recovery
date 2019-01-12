import Router from 'koa-router'
import { fetchMedia, attatchMediaToMessage } from '../service/media'

const router = new Router()

router.use('*', async (context, next) => {
    const { messageID } = context.params

    if (!messageID.match(/\d/g)) {
        context.throw(400, 'Invalid messageID parameter')
    }

    await next()
})

router.get('/media', async context => {
    const { messageID } = context.params

    context.body = await fetchMedia(messageID)
})

router.post('/media', async context => {
    const { messageID } = context.params
    const body = <any> context.request.body

    if (!body.media || !body.media.length) {
        context.throw(400, 'Malformed body; Missing/empty member: media')
    }
    
    context.body = await attatchMediaToMessage(messageID, body.media)
})

export default router