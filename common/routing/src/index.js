import Router from 'koa-router'
import Boom from 'boom'
import { EventEmitter } from 'events'

export class RouteDefinition {
    
    /**
     * Represents a route that will perform some benefactory action for the API.
     *
     * @param {string} path The path that this route may be accessed at
     * @param {string|...string} method The HTTP method(s) that may be used with this route
     */
    constructor(path, method)
    {
        this._path = path
        this._method = method
    }

    get path()
    {
        return this._path
    }

    get method()
    {
        return this._method
    }

    /**
     * Handle a request to this route.
     *
     * @param {Context} context Koa context item
     */
    async handle(context)
    {
        throw new Error('Failed to implement RouteHandler#handle')
    }

}

export class CRUDRouteDefinition extends RouteDefinition {

    constructor(route) {
        super(route)
    }

    // POST, GET, PUT, DELETE

}

export default class RouteRegistry extends EventEmitter {

    constructor()
    {
        super()

        this._router = new Router()
    }

    register(...definitions)
    {
        for (const definition of definitions) {
            if (definition instanceof CRUDRouteDefinition) {
                for (const method of ['get', 'post', 'put', 'delete']) {
                    if (definition[method] !== undefined) {
                        const redefined = new RouteDefinition(definition.path, method)
    
                        redefined.handle = definition[method]
    
                        this.register0(redefined)
                    }
                }
    
                continue
            }
    
            this.register0(definition)
        }

        return this
    }

    register0(definition)
    {
        const { path, handle, method } = definition

        this._router.register(path, parseMethod(method), async context => {
            try {
                function extractBodyEntry(key) {
                    const absoluteKey = key.replace(/\?$/, '')

                    if (!context.request.body) {
                        context.body = Boom.badRequest(`Missing/empty body`)
                        throw new Error('missing body item')
                    }

                    const value = context.request.body[absoluteKey]

                    if (value === undefined && !key.endsWith('?')) {
                        context.body = Boom.badRequest(`Missing body member '${absoluteKey}'`)
                        throw new Error('missing body item')
                    }

                    return {
                        key: absoluteKey,
                        value
                    }
                }

                function toObject(keys) {
                    return keys.reduce((object, value) => {
                        const entry = extractBodyEntry(value)

                        object[entry.key] = entry.value

                        return object
                    }, { })
                }

                context.fromBody = (...keys) => keys.length > 1 ? toObject(keys) : extractBodyEntry(keys).value

                await handle.call(definition, context)
            }
            catch (error) {
                if (error.message !== 'missing body item') {
                    context.body = Boom.internal()
                    this.emit('error', error)
                }
            }
        })

        this.emit('tracking', { method, path })
    }

    transferTo(app)
    {
        app.use(this._router.routes())
        app.use(this._router.allowedMethods())

        this.emit('transferred')
    }

}

/**
 * Parse the HTTP method for Koa from our route definition.
 *
 * @param {string|...string} method The method(s)
 */
function parseMethod(method) {
    return method ? (typeof method === 'string' ? [method] : method) : ['GET']
}