import { Command } from '.'

export default new Command(
    'cleanup',
    async (message, args) => {
        const limit = parseInt(args[0])

        if (!limit) {
            message.reply('you did not provide a limit...')
            return
        }

        const { channel } = message

        const messages = await channel.fetchMessages({ limit })
        const deleted = await channel.bulkDelete(messages)

        message.reply(`cleaned up ${limit} messages`)
    }
)
