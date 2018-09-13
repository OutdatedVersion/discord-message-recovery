import Router from 'koa-router'
import { isHealthy, isReady } from '../service/health'

const router = new Router()

router.get('_health', async context => {
    const healthStatus = await isHealthy()

    if (!healthStatus) {
        context.status = 500
    }
    else {
        context.body = 'ok'
    }
})

router.get('_ready', async context => {
    const readyStatus = isReady()

    if (!readyStatus) {
        context.status = 500
    }
    else {
        context.body = 'ready'
    }
})

export default router