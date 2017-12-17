import pino from 'pino'
import chalk from 'chalk'
import moment from 'moment'


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
 * @returns {String} The current date and time in a human readable format
 */
function formattedDate() {
    return moment().format('MMM/D h:mm:ssa')
}

// create a stream that spits out nice lookin lines
const pretty = pino.pretty({
    formatter: data => {
        return `${formattedLevels[data.level]} ${chalk.gray(formattedDate())} ${chalk.magenta(data.name)} ${chalk.white('::')} ${data.msg}`
    }
})

// send those lines out to the console
pretty.pipe(process.stdout)


// create our primary logger
const parent = pino({
    name: 'Bot'
}, pretty)


export default parent
export const log = message => parent.info(message)
export const debug = message => parent.debug(message)
export const error = err => parent.error(err.message, err)
export const createLogger = name => parent.child({ name })
export const updateLoggingLevel = to => parent.level = to