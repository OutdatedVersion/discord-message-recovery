import { Client } from 'minio'

// Create the client and expose it

const client = new Client({
    endPoint: process.env.MINIO_HOST,
    secure: false,
    port: parseInt(process.env.MINIO_PORT),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
})

export default client