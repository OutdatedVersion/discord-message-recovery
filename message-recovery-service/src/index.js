import Koa from 'koa'
import BodyParser from 'koa-bodyparser'
import log, { createLogger } from 'common-logging'
import RouteRegistry from 'common-routing'
import reportError, { registerClient, koaHandler } from 'common-error'
import MessageRoute from './route/message'
import { createSchemas } from './database/postgres'

const app = new Koa()

function registerRoutes() {
    const routingLog = createLogger('Routing')
    const registry = new RouteRegistry()

    registry.on('tracking', data => routingLog.info(`Registered ${data.method} on ${data.path}`))
    registry.on('error', error => {
        reportError(error)
        log.error(error.stack)
    })

    registry.register(
        new MessageRoute()
    ).transferTo(app)
}

async function start() {
    // Error handling
    registerClient(process.env.BUGSNAG_TOKEN, { })

    app.use(BodyParser())
    app.use(koaHandler)

    registerRoutes()
    await createSchemas()

    app.listen(2000, () => {
        log.info(`up and running at ...`)
    })
}

start().catch(error => {
    console.error('Failed to start\n', error.stack)
    process.exit(-1)
})