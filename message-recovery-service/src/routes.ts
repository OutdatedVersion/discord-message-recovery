import Router, { IMiddleware } from 'koa-router'
import MessageRouter from './controller/message'

class RouteDefinition {
    constructor(public basePath: string, public router: Router) { }
}

export default [
    new RouteDefinition('/guild', MessageRouter)
]