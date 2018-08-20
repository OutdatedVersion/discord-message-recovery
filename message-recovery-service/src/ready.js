let isReady = false

/**
 * Return the current readiness state.
 * 
 * @returns {boolean} Whether or not this app is ready
 */
export default function isReady() {
    return isReady
}

/**
 * Indicate that this app is now ready to go
 */
export function ready() {
    isReady = true
}