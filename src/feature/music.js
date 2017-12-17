import { Command } from '../command'
import log from '../logging'
// import YouTube from 'ytdl-core'
import { setTimeout } from 'timers'

export const command = new Command(
    'music',
    async (message, args) =>
    {
        const { member } = message

        if (member.voiceChannel)
        {
            log.debug('in a channel !!!!!!!')
            member.voiceChannel.join()
            
            setTimeout(() => member.voiceChannel.leave(), 10000)
        }
    }
)
