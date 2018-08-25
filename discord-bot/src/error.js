import bugsnag from 'bugsnag'
import { bugsnag as token } from '../config'
import log from '@kratos/logging'
import reportError from '@kratos/error'

/**
 * Let Bugsnag know of the provided error, and log it locally.
 * 
 * @param {Error} error The error
 */
export default function handleError(error) {
    reportError(error)
    log.error(error.stack)
}

for (const event of ['uncaughtException', 'unhandledRejection'])
    process.on(event, handleError)