import bugsnag from 'bugsnag'
import { bugsnag as token } from '../config'
import log from 'common-logging'

// setup client
bugsnag.register(token)

log.info('setup bugsnag reporting')

/**
 * Let Bugsnag know of the provided error, and log it locally.
 * 
 * @param {Error} error The error
 */
export default function handleError(error)
{
    bugsnag.notify(error)
    log.error(error)
}


for (let event of ['uncaughtException', 'unhandledRejection'])
    process.on(event, handleError)