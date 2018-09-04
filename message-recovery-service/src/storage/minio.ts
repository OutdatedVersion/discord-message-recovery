import { Client } from 'minio'

// Create the client and expose it

const client = new Client({
    endPoint: 'localhost',
    secure: false,
    port: 9000,
    accessKey: 'minio',
    secretKey: 'minio123'
})

export default client