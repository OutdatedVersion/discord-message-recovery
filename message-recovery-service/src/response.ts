import { Context } from 'koa'
import createError, { HttpError } from 'http-errors'

/**
 * Sent to the client if we're not really sure what went wrong
 * though we still need a response sent out.
 * 
 * @see https://httpstatuses.com/500
 */
const ERROR_INTERNAL = createError(500, `We're not sure what happened`)

/**
 * Normalize responses that indicate a failed request.
 * 
 * @param error Source error
 * @param context Target context
 */
function transferErrorToContext(error: HttpError, context: Context) {
    const body = {
        success: false,
        name: error.name,
        message: error.message
    }

    context.body = body
    context.status = error.statusCode
}

/**
 * Sits in front of all requests and catches any errors that are 
 * bubbling back up to Koa. We also normalize responses so that
 * the client is guaranteed a similar result every request.
 * 
 * @param context 
 * @param next 
 */
export async function koaInterceptor(context: Context, next: () => Promise<any>) {
    try {
        await next()

        if (context.body) {
            context.body = {
                success: true,
                result: context.body
            }
        }
    }
    catch (error) {
        transferErrorToContext(error.expose ? error : ERROR_INTERNAL, context)

        if (!error.expose)
            context.app.emit('error', error, context)
    }
}