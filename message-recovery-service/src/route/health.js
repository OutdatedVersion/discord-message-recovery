import { RouteDefinition } from "common-routing"
import { captureClient } from "../database/postgres"
import minio from "../database/minio"
import isReady from "../ready"

export class HealthRoute extends RouteDefinition {
    constructor() {
        super('/_health')
    }

    async handle(context) {
        const client = captureClient()

        try {
            await client.query('SELECT 1')
            await minio.listBuckets()

            context.status = 200
        }
        catch {
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
    }
}