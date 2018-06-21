var cube_set = require('/jroot/etc/ENV.json');

var ws = require('./ws-client.js');
var ws_connection = new ws();

const koa = require('koa')
const Router = require('koa-router')
const app = new koa()


let home = new Router()

home.get('/', async ( ctx )=>{
  let html = `
    <H1> Cube System Interface </H1>
  `
  ctx.body = html
})

let page = new Router()
page.get('/status', async ( ctx )=>{
	if(ws_connection)
		ctx.body = 'Connected'
	else
		ctx.body = 'Disonnect'
}).get('/push', async ( ctx )=>{
	ctx.body = 'send page!'
	ws_connection.send_msg("xxxxx");
})

let router = new Router()
router.use('/', home.routes(), home.allowedMethods())
router.use('/connect', page.routes(), page.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Cube Interface service starting at port 3000')
})


