import { getConnection } from 'typeorm'
import minio from '../storage/minio'

let readyStatus = false

/**
 * Verify that all necessary dependencies are in good health. This is
 * primarily to be used with Kubernetes health checks.
 * 
 * @returns {boolean} Whether or not this application is healthy
 */
export async function isHealthy(): Promise<boolean> {
    try {
        await getConnection().query('SELECT 1')
        await minio.listBuckets()

        return true
    }
    catch (error) {
        return false
    }
}

/**
 * Change the current "ready" status of this application.
 * 
 * @param to The status to set to
 */
export function updateReadyStatus(to: boolean) {
    readyStatus = to
}

/**
 * Check whether or not this application is ready.
 * 
 * @returns {boolean} Ready status
 */
export function isReady(): boolean {
    return readyStatus
}