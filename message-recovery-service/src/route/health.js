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

            context.status = 200
        }
        catch (error) {
            log.error(error.stack)
            
            context.status = 500
        }
        finally {
            client.release()
        }
    }
}

export class ReadyRoute extends RouteDefinition {
    constructor() {
        super('/_ready')
    }

    async handle(context) {
        context.status = isReady() ? 200 : 500

        log.info(`received ready probe, response: ${context.status}`)
    }
}