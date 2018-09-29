import { registerCommand, Command } from '.'
import version from '../version'

registerCommand(new Command(
    ['information', 'info', 'v', 'version'],
    async (message, args) => {
        await message.reply(`**Kratos** (${version})\n\nHey, did you know that Kratos is open-source? https://github.com/OutdatedVersion/kratos (:`)
    }
))