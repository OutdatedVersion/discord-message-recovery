'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CRUDRouteDefinition = exports.RouteDefinition = undefined;

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RouteDefinition {
    constructor(path, method) {
        this._path = path;
        this._method = method;
    }

    get path() {
        return this._path;
    }

    get method() {
        return this._method;
    }

    async handle(context) {
        throw new Error('Failed to implement RouteHandler#handle');
    }

}

exports.RouteDefinition = RouteDefinition;
class CRUDRouteDefinition extends RouteDefinition {

    constructor(route) {
        super(route);
    }

}

exports.CRUDRouteDefinition = CRUDRouteDefinition;
class RouteRegistry extends _events.EventEmitter {

    constructor() {
        super();

        this._router = new _koaRouter2.default();
    }

    register(...definitions) {
        for (const definition of definitions) {
            if (definition instanceof CRUDRouteDefinition) {
                for (const method of ['get', 'post', 'put', 'delete']) {
                    if (definition[method] !== undefined) {
                        const redefined = new RouteDefinition(definition.path, method);

                        redefined.handle = definition[method];

                        this.register0(redefined);
                    }
                }

                continue;
            }

            this.register0(definition);
        }

        return this;
    }

    register0(definition) {
        const { path, handle, method } = definition;

        this._router.register(path, parseMethod(method), async context => {
            try {
                function extractBodyEntry(key) {
                    if (!context.request.body) {
                        context.body = _boom2.default.badRequest(`Missing/empty body`);
                        throw new Error('missing body item');
                    }

                    const item = context.request.body[key];

                    if (item === undefined) {
                        context.body = _boom2.default.badRequest(`Missing body member '${key}'`);
                        throw new Error('missing body item');
                    }

                    return item;
                }

                context.fromBody = (...keys) => keys.length > 1 ? keys.map(extractBodyEntry) : extractBodyEntry(keys);

                await handle.call(definition, context);
            } catch (error) {
                if (error.message !== 'missing body item') this.emit('error', error);
            }
        });

        this.emit('tracking', { method, path });
    }

    transferTo(app) {
        app.use(this._router.routes());
        app.use(this._router.allowedMethods());

        this.emit('transferred');
    }

}

exports.default = RouteRegistry;

function parseMethod(method) {
    return method ? typeof method === 'string' ? [method] : method : ['GET'];
}