import Files from 'fs'
import Path from 'path'
import log from '../logging'
import { command as config } from '../../config'
import { traverseDirectory } from '../utility/folder'
import { setTimeout } from 'timers'

/**
 * Represenation of a message based command.
 */
export class Command
{
    constructor(executor, handler)
    {
        this.executors = Array.isArray(executor) ? executor : [ executor ]
        this.handler = handler
    }
}

/**
 * A relation of commands that we track.
 */
const registeredCommands = new Map()

/**
 * Begin tracking the provided command.
 * 
 * @param {Command} command Representation of the command
 */
export function registerCommand(command)
{
    const { executors, handler } = command

    executors.forEach(executor => registeredCommands.set(executor.toLowerCase(), handler))

    log.info(`registered command: ${executors}`)
}

/**
 * Check if we have a command registered under the provided executor.
 * 
 * @param {string} executor The executor
 */
export function hasCommand(executor)
{
    if (executor.startsWith(config.prefix))
        executor = executor.substring(config.prefix.length)

    if (executor.indexOf(' ') > -1)
        executor = executor.substring(0, executor.indexOf(' '))

    return registeredCommands.has(executor.toLowerCase())
}

/**
 * Begin parsing commands from messages.
 * 
 * @param {Client} client discord.js client
 */
export function setupHandler(client)
{
    traverseDirectory(__dirname, registerCommand)

    client.on('message', message =>
    {
        const split = message.content.split(' ')
    
        if (split && split[0].startsWith(config.prefix))
        {
            const executor = split[0].substring(1).toLowerCase()
            const command = registeredCommands.get(executor)
            const timedReply = text => message.reply(text).then(msg => setTimeout(() => msg.delete(), 5000))

            if (command)
            {
                message.timedReply = timedReply

                command(message, split.splice(1))
            }
            else timedReply('i have no command matching that..')
        }
    })
}
