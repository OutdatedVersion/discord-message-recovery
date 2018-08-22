import Koa from 'koa'
import BodyParser from 'koa-bodyparser'
import log, { createLogger } from '@kratos/logging'
import RouteRegistry from '@kratos/routing'
import reportError, { registerClient, koaHandler } from '@kratos/error'
import { createSchemas } from './database/postgres'
import { ready } from './ready';
import RootRoute from './route/root'
import MessageRoute from './route/message'
import { HealthRoute, ReadyRoute } from './route/health'

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
        new MessageRoute(),
        new HealthRoute(),
        new ReadyRoute(),
        new RootRoute()
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
        ready()
        log.info(`up and running at ...`)
    })
}

start().catch(error => {
    console.error('Failed to start\n', error.stack)
    process.exit(-1)
})