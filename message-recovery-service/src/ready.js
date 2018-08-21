let state = false

/**
 * Return the current readiness state.
 * 
 * @returns {boolean} Whether or not this app is ready
 */
export default function isReady() {
    return state
}

/**
 * Indicate that this app is now ready to go
 */
export function ready() {
    state = true
}