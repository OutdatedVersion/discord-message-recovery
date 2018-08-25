import Discord from 'discord.js'
import log from '@kratos/logging'
import { setInterval } from 'timers'
import exitHook from 'async-exit-hook'

const client = new Discord.Client()

/**
 * How often the Discord bot's status updates.
 * Default: 10 minutes
 */
const GAME_UPDATE_INTERVAL = 600000

/**
 * All of the possible Discord bot's statuses.
 */
const GAMES = [
    'node.js',
    'GKE',
    'kubernetes',
    'git',
    'microservices',
    'rest'
]


client.on('ready', () => {
    setRandomGame()
    setInterval(setRandomGame, GAME_UPDATE_INTERVAL)

    log.info(`ready at ${client.user.tag}`)
})

exitHook(done => client.destroy().then(done))

function setRandomGame() {
    const game = GAMES[Math.floor(Math.random() * GAMES.length)]

    client.user.setGame(game)
}

export default client