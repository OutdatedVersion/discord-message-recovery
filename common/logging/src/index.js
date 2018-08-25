import pino from 'pino'
import chalk from 'chalk'
import { format } from 'date-fns'


/**
 * A relation of various logging level IDs to a
 * colored textual representation of that level.
 */
const formattedLevels = {
    60: chalk.bgRed('FATAL'),
    50: chalk.red('ERROR'),
    40: chalk.yellow('WARN'),
    30: chalk.green('INFO'),
    20: chalk.blue('DEBUG'),
    10: chalk.grey('TRACE')
}

/**
 * @returns {String} The current date and time in a human friendly format
 */
function formattedDate() {
    return format(new Date(), 'MMM/D h:mm:ssa')
}

let config = {
    name: 'Main'
}

if (process.env.NODE_ENV !== 'prod') {
    config = Object.assign(config, { 
        prettyPrint: true,
        prettifier: options => {
            return data => `${formattedLevels[data.level]} ${chalk.gray(formattedDate())} ${chalk.magenta(data.name)} ${chalk.white('::')} ${data.msg}\n`
        }
    })
}

// create our primary logger
const parent = pino(config)

export default parent
export const rename = newName => parent.name = newName
export const info = message => parent.info(message)
export const debug = message => parent.debug(message)
export const error = err => parent.error(err.message, err)
export const createLogger = name => parent.child({ name })
export const updateLoggingLevel = to => parent.level = to