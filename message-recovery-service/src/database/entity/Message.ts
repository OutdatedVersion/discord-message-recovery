import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, Index } from 'typeorm'
import MessageMedia from './MessageMedia';

@Entity ()
@Index (['discordGuildID', 'discordChannelID', 'discordMessageID'], { unique: true })
export default class Message {

    @PrimaryGeneratedColumn ()
    id: number

    @Column ('bigint')
    discordGuildID: string

    @Column ('bigint')
    discordChannelID: string

    @Column ('bigint')
    discordMessageID: string

    @Column ('bigint')
    sentByDiscordID: string

    @Column ('text')
    content: string

    @Column ()
    sentAt: Date

    @Column ()
    removedAt: Date

    @OneToMany (type => MessageMedia, media => media.message)
    @JoinColumn ()
    media: MessageMedia[]

}
