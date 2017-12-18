import client from '../discord'
import log  from '../logging'
import { formatName } from '../utility/user'
import { RemovedMessage } from '../data'
import { Command, hasCommand } from '../command'
import { distanceInWords } from 'date-fns'


client.on('messageDelete', async message => {
    const { content, channel, author } = message

    // do not save messages from the bot or command execution
    if (author.id == client.user.id || hasCommand(content))
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


export const command = new Command(
    'deleted',
    async (message, args) => {
        const limit = parseInt(args[0]) || 5

        let results = await RemovedMessage.find()
                                          .limit(limit > 25 ? 25 : limit)
                                          .sort('-at')
                                          .exec()

        const { length } = results

        results = results.map(result => {
            const date = distanceInWords((new Date).getTime(), result.at, { addSuffix: true })

            return `:white_small_square: ${date} ${result.from} said '${result.content}'`
        }).join('\n')

        await message.reply(`here are the **${length}** previously removed message${length > 1 ? 's' : ''} for you:\n${results}`)
        message.delete()
    }
) 
