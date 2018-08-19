'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.registerClient = registerClient;
exports.default = reportError;
exports.koaHandler = koaHandler;

var _bugsnag = require('bugsnag');

var _bugsnag2 = _interopRequireDefault(_bugsnag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const StatusToError = {
    404(context) {
        return {
            statusCode: 404,
            error: 'Not Found',
            message: `No resource at ${context.path}`
        };
    },
    405(context) {
        return {
            statusCode: 405,
            error: 'Method Not Allowed',
            message: `You may not use '${context.method}' on ${context.path}`
        };
    },
    500(context) {
        return {
            statusCode: 500,
            error: 'Internal Server Error'
        };
    }
};

function registerClient(token, options) {
    if (!token) {
        throw new Error('You must provide a token');
    }

    _bugsnag2.default.register(token, Object.assign({
        notifyReleaseStages: ['production']
    }, options));
}

function reportError(error) {
    _bugsnag2.default.notify(error);
}

async function koaHandler(context, next) {
    console.log('fuck u');
    await next();

    console.log(context.body);

    if (context.body && context.body.isBoom) {
        const { output } = context.body;

        context.status = output.statusCode;
        context.body = output.payload;
    } else if (context.status != 200) {
        context.body = StatusToError[context.status](context);
    }
}