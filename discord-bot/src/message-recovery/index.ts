import { Message } from 'discord.js'
import discordClient from '../discord'
import { Command, hasCommand } from '../command'
import { saveRemovedMessage, RemovedMessagePayload } from './message'
import { saveMedia } from './media';

// listen for removedMessage event
// use local request thingy to send out stuff

// this acts as a controller basically;
// all of the uploading guts will be held else where
// then a separate service for message creation

// ingest
discordClient.on('messageDelete', async message => {
    const { author, channel, cleanContent } = message

    // - Only save messages send in a guild text channel
    // - Do not save messages from this bot
    // - Do not save messages only containing a currently tracked command
    if (!message.guild 
        || author.id === discordClient.user.id 
        || hasCommand(cleanContent)) {
        return
    }

    const guildID = message.guild.id

    const removedMessagePayload: RemovedMessagePayload = {
        content: cleanContent,
        sentByDiscordID: author.id,
        discordChannelID: channel.id,
        discordMessageID: message.id,
        sentAt: message.createdAt.getTime() / 1000,
        removedAt: Date.now() / 1000
    }

    let messageID: number

    try {
        const { body } = await saveRemovedMessage(guildID, removedMessagePayload)

        // other error handling

        messageID = body.result.id
    }
    catch (error) {
        console.error('Encountered issue saving message', error.stack)
        return
    }

    // save media using ./media.ts service...
    const media = message.attachments.array()

    if (!media.length) {
        return
    }

    const mediaAddresses = media.map(attachment => attachment.proxyURL)

    try {
        await saveMedia(guildID, messageID, mediaAddresses)
    }
    catch (error) {
        console.error('Encountered issue uploading message media', error.stack)
    }
})
