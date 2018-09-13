import 'reflect-metadata'
import Koa from 'koa'
import Router from 'koa-router'
import BodyParser from 'koa-bodyparser'
import Routes from './routes'
import { createConnection } from 'typeorm'
import { koaInterceptor } from './response'

// registerClient(process.env.BUGSNAG_TOKEN)

createConnection().then(async connection => {
    const app = new Koa()
    const router = new Router()

    app.use(koaInterceptor)
    app.use(BodyParser())
    
    Routes.forEach(route => router.use(route.basePath, route.router.routes(), route.router.allowedMethods()))
    
    app.use(router.routes())
    app.use(router.allowedMethods())
    
    app.listen(2000)
}).catch(error => {
    console.error('Failed to start:', error.stack)
    process.exit(-1)
})