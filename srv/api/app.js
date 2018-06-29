var cube_set = require('/jroot/etc/ENV.json');

//Handle Redis server connection /////////////////////////////////////
var redis = require("redis");
var rs_client_sub = null
var rs_client_pub = null
if(cube_set.CACHE_SERVICE_URL && cube_set.CACHE_SERVICE_PORT){
	rs_client_sub = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
	rs_client_pub = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
}
else
	console.log("redis connection setting lost")

if(!rs_client_sub || !rs_client_pub){
	process.exit(1);
}

rs_client_sub.on("message", function (channel, message) {
	console.log("sub channel :" + channel + ", got a message:" + message);
});

rs_client_sub.subscribe("interface");

////////////////////////////////////////////////////////////

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
	if(rs_client_sub)
		ctx.body = 'Connected'
	else
		ctx.body = 'Disonnect'
}).get('/push', async ( ctx )=>{
	ctx.body = 'send page!'
	rs_client_pub.publish("interface", "EJ test");
})

let router = new Router()
router.use('/', home.routes(), home.allowedMethods())
router.use('/connect', page.routes(), page.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Cube Interface service starting at port 3000')
})


