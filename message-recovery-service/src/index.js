import Koa from 'koa'
import Router from 'koa-router'
import { logging as log } from 'common'
import { execSync } from 'child_process';

const koa = new Koa()
const router = new Router()

// For testing
const hostname = execSync("hostname").toString()

router.get("/message/:guildID", async (context) => {
    context.body = hostname
})

router.post("/message/:guildID", async (context) => {

})

koa.use(router.allowedMethods())
koa.use(router.routes())

koa.listen(2000, () => {
    log.info(`up and running at ...`)
})
