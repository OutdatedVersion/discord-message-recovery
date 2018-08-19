import bugsnag from 'bugsnag'

/**
 * Relation of status code to an error creation handle.
 */
const StatusToError = {
    404(context) {
        return {
            statusCode: 404,
            error: 'Not Found',
            message: `No resource at ${context.path}`
        }
    },
    405(context) {
        return {
            statusCode: 405,
            error: 'Method Not Allowed',
            message: `You may not use '${context.method}' on ${context.path}`
        }
    },
    500(context) {
        return {
            statusCode: 500,
            error: 'Internal Server Error'
        }
    }
}

/**
 * Setup our Bugsnag instance for reporting.
 * 
 * @param {string} token Authorization token to use with the API
 * @param {object} options Additional configuration points for the client
 */
export function registerClient(token, options) {
    if (!token) {
        throw new Error('You must provide a token')
    }

    bugsnag.register(token, Object.assign({
        notifyReleaseStages: ['production']
    }, options))
}

/**
 * Let Bugsnag know of the provided error, and log it locally.
 *
 * @param {Error} error The error
 */
export default function reportError(error) {
    bugsnag.notify(error)
}

/**
 * Parse errors within the Koa request cycle. This makes use of
 * the "Boom" library.
 *
 * @param {Context} context
 * @param {Function} next
 */
export async function koaHandler(context, next) {
    console.log('fuck u')
    await next()

    console.log(context.body)

    if (context.body && context.body.isBoom)
    {
        const { output } = context.body

        context.status = output.statusCode
        context.body = output.payload
    }
    else if (context.status != 200)
    {
        context.body = StatusToError[context.status](context)
    }
}