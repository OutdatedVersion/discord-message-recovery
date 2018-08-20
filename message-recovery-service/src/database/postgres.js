import { Pool } from 'pg'
import { readFile as readFileOriginal } from 'fs'
import { promisify } from 'util'
import { createLogger } from 'common-logging'

const readFile = promisify(readFileOriginal)

const log = createLogger('Database')
const pool = new Pool()

/**
 * Run the startup SQL file. Any issue that occurs
 * when doing so will bubble back to the calling scope.
 */
export async function createSchemas() {
    log.info('Creating schemas')

    const sql = await readFile('sql/startup.sql').then(buffer => buffer.toString())
    const client = await captureClient()

    try {
        await client.query(sql)
        log.info('Created schemas')
    }
    finally {
        client.release()
    }
}

/**
 * Grab a connection from the pool.
 * 
 * @returns {Promise} A pending connection
 */
export function captureClient() {
    return pool.connect()
}

/**
 * Request that this pool closes. This will wait for
 * any active clients to finish up their task.
 */
export async function close() {
    await pool.end()
}
