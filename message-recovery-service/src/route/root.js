import { RouteDefinition } from '@kratos/routing'
import version from '../version.json'

export default class HealthRoute extends RouteDefinition {
    constructor() {
        super('/')
    }

    async handle(context) {
        context.body = {
            version,
            pod: process.env.POD_NAME || 'local'
        }
    }
}
