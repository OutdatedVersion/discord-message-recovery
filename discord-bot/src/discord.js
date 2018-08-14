import Discord from 'discord.js'
import { logging as log } from 'common'
import { games } from '../config'
import { setInterval } from 'timers'

const client = new Discord.Client()

client.on('ready', () => 
{
    setRandomGame()
    setInterval(setRandomGame, 600000) // every 10 mins

    log.info(`ready at ${client.user.tag}`)
})

function setRandomGame() 
{
    const game = games[Math.floor(Math.random() * games.length)]

    client.user.setGame(game)

    log.info(`updated game to '${game}'`)
}

export default client