import { CRUDRouteDefinition } from 'common-routing'
import { captureConnection } from '../database'

export default class MessageRoute extends CRUDRouteDefinition {
    
    constructor() {
        super('/message/:guildID')
    }

    async get(context) {
        
    }

    async post(context) {
        const [
            content,
            discordChannelID,
            discordMessageID,
            media
        ] = context.fromBody('content', 'discordChannelID', 'discordMessageID', 'media')

        console.log(content)
        console.log(discordChannelID)
        console.log(discordMessageID)
        console.log(media)

        context.body = {
            
        }
    }

}