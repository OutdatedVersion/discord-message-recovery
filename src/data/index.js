import mongoose from 'mongoose'
import log from '../logging'

mongoose.connect('mongodb://localhost/kratos', { useMongoClient: true })
mongoose.Promise = Promise


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