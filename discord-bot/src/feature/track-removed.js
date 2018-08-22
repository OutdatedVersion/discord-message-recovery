import client from '../discord'
import log from '@kratos/logging'
import { formatName } from '../utility/user'
import { Command, hasCommand } from '../command'
import { distanceInWords } from 'date-fns'


client.on('messageDelete', async message => {
    const { content, channel, author } = message

    // do not save messages from the bot or command execution
    if (author.id == client.user.id || hasCommand(content))
        return

    const from = formatName(author)

    // 

    log.info(`saved message from ${from} - ${content}`)
})


export const command = new Command(
    'deleted',
    async (message, args) => {
        const limit = parseInt(args[0]) || 5

        // 

        const { length } = results

        results = results.map(result => {
            const date = distanceInWords((new Date).getTime(), result.at, { addSuffix: true })

            return `:white_small_square: ${date} ${result.from} said '${result.content}'`
        }).join('\n')

        await message.reply(`here is the **${length}** previously removed message${length > 1 ? 's' : ''} for you:\n${results}`)
        message.delete()
    }
) 