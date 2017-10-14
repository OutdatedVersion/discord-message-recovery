const pino = require('pino')
const chalk = require('chalk')
const moment = require('moment')


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
const formattedDate = () =>
{
    return moment().format('MMM/D h:mm:ssa')
}

/**
 * A division of the logger that looks fairly decent
 */
const pretty = pino.pretty({
    formatter: data => {
        return `${formattedLevels[data.level]} ${chalk.gray(formattedDate())} ${data.name}: ${data.msg}`
    }
})

// write the pretty lines to the console
pretty.pipe(process.stdout)

/**
 * Primary logger
 */
const parent = pino({
    name: 'Kratos'
}, pretty)


module.exports = {
    parent,
    child: name => {
        return parent.child({ name })
    }
}