import { Client } from 'minio'

// Create the client and expose it

const client = new Client({
    endPoint: 'localhost',
    // The 'secure' option is deprecated; it will alter the intended behavior of the application.
    // @ts-ignore
    useSSL: false,
    port: 9000,
    accessKey: 'minio',
    secretKey: 'minio123'
})

export default client