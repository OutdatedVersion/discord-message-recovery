import request from 'request-promise-native'

const DEFAULT_OPTIONS = {
    json: true
}

export const Service = {
    MESSAGE_RECOVERY: {
        local: 'http://localhost:2000',
        kubernetes: 'http://message-recovery-api'
    }
}

export default async function makeRequest(service, path = '', options = { }) {
    const uri = typeof service === 'string' ? service : service[process.env.POD_NAME ? 'kubernetes' : 'local']

    return request(Object.assign(DEFAULT_OPTIONS, options, { uri: `${uri}/${path}` }))
}