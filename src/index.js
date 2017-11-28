import Discord from 'discord.js'
import log from './logging'
import { token } from '../config'
import { RemovedMessage } from './data'
import { distanceInWords } from 'date-fns'
import commandHandler from './command'


const client = new Discord.Client()

// setup command system
commandHandler(client)

client.on('ready', () => log.info(`Ready at ${client.user.tag}`))

client.on('command', async (message, command, args) => {
    // switch to registration based system
    if (command == 'cleanup')
    {
        const limit = parseInt(args[0])
        const { channel } = message

        const messages = await channel.fetchMessages({ limit })
        const deleted = await channel.bulkDelete(messages)

        message.reply(`cleaned up ${limit} messages`)
    }
})

client.on('command', async (message, command, args) => {
    if (command == 'deleted')
    {
        const limit = parseInt(args[0])

        if (!limit) {
            command.reply('you missed the history count')
            return
        }

        let results = await RemovedMessage.find()
                                          .limit(limit)
                                          .sort('-at')
                                          .exec()

        const { length } = results

        results = results.map(result => {
            const date = distanceInWords((new Date).getTime(), result.at, { addSuffix: true })

            return `:white_small_square: ${date} ${result.from} said '${result.content}'`
        }).join('\n')

        message.reply(`here are the previously ${length} removed message${length > 1 ? 's' : ''} for you:\n${results}`)
        message.delete()
    }
})

client.on('messageDelete', async message => {
    const { content, channel, author } = message

    // do not save messages from the bot
    // todo(ben): verify that it is an actual command, so this isn't an exploit
    if (author.id == client.user.id || content.startsWith('-'))
        return

    const from = formatName(author)

    await new RemovedMessage({
        content,
        from,
        sentIn: channel.id,
        at: (new Date).getTime()
    }).save()

    log.info(`saved message from ${from} - ${content}`)
})

client.login(token)


function formatName(user) {
    return `${user.username}#${user.discriminator}`
}