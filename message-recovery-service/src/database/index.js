import { Pool } from 'pg'

const pool = new Pool()

/**
 * Grab a connection from the pool.
 * 
 * @returns {Promise} A pending connection
 */
export function captureConnection() {
    return pool.connect()
}

/**
 * Request that this pool closes. This will wait for
 * any active clients to finish up their task.
 */
export async function close() {
    await pool.end()
}
