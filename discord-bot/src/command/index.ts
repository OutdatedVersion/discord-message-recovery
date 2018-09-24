import { setTimeout } from 'timers'
import { Message, Client } from 'discord.js'
import discordClient from '../discord'

type CommandHandler = (message: Message) => void

declare module "discord.js" {
    export interface Message {
        timedReply?: (text: string) => void;
    }
}

/**
 * The character that commands start with.
 */
const PREFIX = '-'

/**
 * Represenation of a message based command.
 */
export class Command {
    executors: string[]

    constructor(executor: string | string[], public handler: CommandHandler) {
        this.executors = Array.isArray(executor) ? executor : [ executor ]
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
export function registerCommand(command: Command) {
    const { executors, handler } = command

    executors.forEach(executor => registeredCommands.set(executor.toLowerCase(), handler))
}

/**
 * Check if we have a command registered under the provided executor.
 * 
 * @param {string} executor The executor
 */
export function hasCommand(executor: string) {
    if (executor.startsWith(PREFIX))
        executor = executor.substring(PREFIX.length)

    if (executor.indexOf(' ') > -1)
        executor = executor.substring(0, executor.indexOf(' '))

    return registeredCommands.has(executor.toLowerCase())
}

/**
 * Begin parsing commands from messages.
 */
export function registerCommandHandler() {
    discordClient.on('message', message => {
        const split = message.content.split(' ')
    
        if (split && split[0].startsWith(PREFIX)) {
            const executor = split[0].substring(1).toLowerCase()
            const command = registeredCommands.get(executor)
            
            function timedReply(text: string) {
                message.reply(text).then(response => {
                    setTimeout(() => {
                        if (Array.isArray(response)) {
                            for (const piece of response)  {
                                piece.delete()
                            }
                        }
                        else {
                            response.delete()
                        }
                        
                        message.delete()
                    }, 5000)
                })
            }

            if (command) {
                message.timedReply = timedReply

                command(message, split.splice(1))
            }
            else timedReply('i have no command matching that..')
        }
    })
}