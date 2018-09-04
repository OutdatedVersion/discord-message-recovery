import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import Message from './Message'

@Entity ()
export default class MessageMedia {

    @PrimaryGeneratedColumn ()
    id: number

    @Column ('text')
    fileName: string

    @Column ('text')
    fileType: string

    @Column ({
        nullable: true
    })
    duplicateNumber: number

    @ManyToOne (type => Message, message => message.media)
    message: Message

}
