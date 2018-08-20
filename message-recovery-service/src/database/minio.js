import { Client } from 'minio'

// Create the client and expose it

const client = new Client({
    // endPoint: 'play.minio.io',
    // port: 9000,
    // useSSL: true,
    // accessKey: 'Q3AM3UQ867SPQQA43P2F',
    // secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG'
    endPoint: process.env.MINIO_HOST,
    useSSL: false,
    port: parseInt(process.env.MINIO_PORT),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
})

export default client