import mongoose from 'mongoose'
import { createLogger } from 'common-logging'

const log = createLogger('Database')

const host = `${process.env.DOCKER_HOST_ADDRESS}:27017`

log.info(`connecting to mongo instance @ ${host}`)

mongoose.connect(`mongodb://${host}/kratos`, { useMongoClient: true })
mongoose.Promise = Promise

const { connection } = mongoose

connection.on('error', log.error.bind(log))
connection.once('open', () => log.info(`connected to mongo instance @ ${host}`))

process.on('cleanup', () =>
{
    log.info('closing out database connection(s)')
    mongoose.disconnect()
})


// Model Definition

export const RemovedMessage = mongoose.model('removed_message', {
    // user id
    from: String,
    // message
    content: String,
    // channel id
    sentIn: String,
    // unix epoch
    at: Number
})