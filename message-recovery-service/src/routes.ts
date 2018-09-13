import Router from 'koa-router'
import HealthRouter from './controller/health'
import MessageRouter from './controller/message'

class RouteDefinition {
    constructor(public basePath: string, public router: Router) { }
}

export default [
    new RouteDefinition('/', HealthRouter),
    new RouteDefinition('/guild', MessageRouter)
]