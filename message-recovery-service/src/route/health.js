import { RouteDefinition } from '@kratos/routing'
import { captureClient } from "../database/postgres"
import { createLogger } from '@kratos/logging'
import minio from "../database/minio"
import isReady from "../ready"

const log = createLogger('Health')

export class HealthRoute extends RouteDefinition {
    constructor() {
        super('/_health')
    }

    async handle(context) {
        const client = await captureClient()

        try {
            await client.query('SELECT 1')
            await minio.listBuckets()

            context.body = 'ok'
            context.status = 200
        }
        catch (error) {
            log.error('health probe failed', error.stack)

            context.body = `error: ${error.name}`
            context.status = 500
        }
        finally {
            client.release()
        }

        // log.info(`received health probe, ${context.status}`)
    }
}

export class ReadyRoute extends RouteDefinition {
    constructor() {
        super('/_ready')
    }

    async handle(context) {
        const ready = isReady()

        context.body = ready ? 'ready' : 'not ready'
        context.status = ready ? 200 : 500

        if (!ready)
            log.info(`received ready probe, not yet ready`)
    }
}