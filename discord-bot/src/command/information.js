import { Command } from '.'
import version from '../version'

export default new Command(
    ['v', 'version', 'information', 'info'],
    async (message, args) => {
        await message.reply(`**Kratos** (git-${version})\n\nHey, did you know that Kratos is open-source? https://github.com/OutdatedVersion/kratos (:`)
    }
)
