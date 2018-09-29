import { Message } from 'discord.js'
import discordClient from '../discord'
import { Command, hasCommand, registerCommand } from '../command'
import { saveRemovedMessage, RemovedMessage, fetchMessages } from './message'
import { saveMedia, fetchMediaBulk } from './media'
import { createDiscordMessage } from './format'

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

    const removedMessagePayload: RemovedMessage = {
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

    // If there is media associated with this message, let's save that too...

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

registerCommand(new Command(
    ['deleted'],
    async function run(message: Message, args: string[]) {
        const guildID = message.guild.id
        const limit = parseInt(args[0]) || 10
        
        const messages = await fetchMessages(guildID, limit)
        const media = await fetchMediaBulk(guildID, messages.map(message => message.id))

        const discordMessage = await createDiscordMessage(messages, media)

        await message.delete()

        await message.reply(discordMessage, {
            split: {
                prepend: 'continued\n'
            }
        })
    }
))