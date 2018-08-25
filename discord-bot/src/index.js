import client from './discord'
import { setupHandler } from './command'
import { setup } from './feature'
import { writeFileSync } from 'fs'
import { registerClient } from '@kratos/error'

async function start() {
    // Setup error reporting
    registerClient(process.env.BUGSNAG_TOKEN)
    
    // Setup command handling
    setupHandler(client)

    // Setup feature set
    setup(client)

    // Login..
    const token = process.env.DISCORD_TOKEN

    if (!token)
        throw new Error('Missing Discord token')

    client.login(token)
}

start().then(writeProbeFiles).catch(error => {
    console.error('Failed to start\n', error.stack)
    process.exit(-1)
})

function writeProbeFiles() {
    writeFileSync('/tmp/ready', '')
    writeFileSync('/tmp/health', '')
}
