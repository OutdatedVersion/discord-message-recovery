import { Client } from 'minio'

// Create the client and expose it

const client = new Client({
    endPoint: process.env.MINIO_HOST,
    // useSSL is the up-to-date flag though TypeScript believes 'secure' is still in use.
    // I submitted a PR to fix this; just waiting for it to propagate out.
    // @ts-ignore
    useSSL: false,
    port: parseInt(process.env.MINIO_PORT),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
})

export default client