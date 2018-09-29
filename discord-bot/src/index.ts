import discordClient from './discord'
import { listenForCommands } from './command'

async function start() {
    // Fail fast, we'll need this to start no matter what
    const token = process.env.DISCORD_TOKEN

    if (!token) {
        throw new Error('Missing Discord token')
    }

    listenForCommands()

    require('./message-recovery')
    require('./command/cleanup')
    require('./command/information')

    discordClient.login(token)
}

start().catch(error => {
    console.error('Failed to start\n', error.stack)
    process.exit(-1)
})
