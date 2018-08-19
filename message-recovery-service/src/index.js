import Koa from 'koa'
import log, { createLogger } from 'common-logging'
import RouteRegistry from 'common-routing'
import { registerClient, koaHandler } from 'common-error'
import MessageRoute from './route/message'

const koa = new Koa()

// Error handling
registerClient(process.env.BUGSNAG_TOKEN, { })

function registerRoutes() {
    const routingLog = createLogger('Routing')
    const registry = new RouteRegistry()

    registry.on('tracking', data => routingLog.info(`Now tracking ${data.method} ${data.path}`))
    registry.on('error', error => {
        // encountered issue whilst handling request..
        // TODO(ben): Use third-party reporting solution
        
        log.error(error.stack)
    })

    registry.register(
        new MessageRoute()
    ).transferTo(koa)
}

registerRoutes()

koa.listen(2000, () => {
    log.info(`up and running at ...`)
})
