import Router from 'koa-router'
import HealthRouter from './controller/health'
import MessageRouter from './controller/message'
import MediaController from './controller/media'

class RouteDefinition {
    constructor(public basePath: string, public router: Router) { }
}

export default [
    new RouteDefinition('/', HealthRouter),
    new RouteDefinition('/guild', MessageRouter),
    new RouteDefinition('/guild/:guildID/messages/:messageID', MediaController)
]