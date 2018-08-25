import { Command } from '.'
import { execSync } from 'child_process'
import version from '../version'

export default new Command(
    ['v', 'version', 'information', 'info'],
    async (message, args) => {
        await message.reply(`**Kratos** (v${version})\n\nHey, did you know that Kratos is open-source? https://github.com/OutdatedVersion/kratos (:`)
    }
)
