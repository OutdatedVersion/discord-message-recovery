import client from '../discord'
import { RemovedMessage } from '../data'
import { Command } from '../command'
import { distanceInWords } from 'date-fns'


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


export const command = new Command(
    'deleted',
    async (message, args) => {
        console.log('why')
        const limit = parseInt(args[0])
        
        if (!limit) {
            message.reply('you missed the history count')
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
    }
) 
