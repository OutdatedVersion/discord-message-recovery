import Koa from 'koa'
import Router from 'koa-router'
import { logging as log } from 'common'

const koa = new Koa()
const router = new Router()

router.get("/message/:guildID", async (context) => {
    
})

router.post("/message/:guildID", async (context) => {

})

koa.use(router.allowedMethods())
koa.use(router.routes())

koa.listen(2000, () => {
    log.info(`up and running at ...`)
})
