import * as Discord from 'discord.js'
// @ts-ignore
import exitHook from 'async-exit-hook'

/**
 * Defines how often the Discord bot's status updates.
 * Default: 10 minute delay
 */
const GAME_UPDATE_INTERVAL = 600000

/**
 * All of the possible statuses the bot may have.
 */
const GAMES = [
    'node.js',
    'GKE',
    'kubernetes',
    'git',
    'microservices',
    'rest'
]

const client = new Discord.Client()

client.on('ready', () => {
    setRandomGame()
    setInterval(setRandomGame, GAME_UPDATE_INTERVAL)
})

exitHook((done: any) => client.destroy().then(done))

function setRandomGame() {
    const game = GAMES[Math.floor(Math.random() * GAMES.length)]

    client.user.setActivity(game)
}

export default client