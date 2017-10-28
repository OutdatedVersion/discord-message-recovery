const Discord = require('discord.js')
const log = require('./logging')
const config = require('./config')


const client = new Discord.Client()

// drop our configuration into somewhere a bit more accessible
client.config = config


client.on('ready', () => 
{
    require('./feature')(client, log)


    log.info(`ready at ${client.user.tag}`)
})


client.login(config.token)
