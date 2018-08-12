import { Command } from '.'
import { execSync } from 'child_process'

export default new Command(
    ['v', 'version', 'information', 'info'],
    async (message, args) => {
        message.reply(`**kratos**\nRunning on container: ${containerID()}`)
    }
)

function containerID() {
    return execSync(`awk -F/ '{ print $NF }' /proc/1/cpuset`).toString().trim().substring(0, 12)
}
