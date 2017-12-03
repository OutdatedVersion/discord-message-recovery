import Files from 'fs'
import Path from 'path'
import log from '../logging'
import { command as config } from '../../config'
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

    executors.forEach(executor => registeredCommands.set(executor, handler))

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

    return registeredCommands.has(executor)
}

/**
 * Take the provided export in a file, and extract the commands out of it.
 * 
 * @param {object} entry The export entry
 */
function parseDefintion(entry)
{
    if (!entry.default)
    {
        for (let key in entry)
            parseDefintion({ default: entry[key] })

        return
    }
    else entry = entry.default
    
    if (!entry)
        throw new Error('Missing command definition')

    registerCommand(entry.executor, entry.handler)
}