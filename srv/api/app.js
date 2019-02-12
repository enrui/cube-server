var cube_set = require('/jroot/etc/ENV.json');
var device_apis = require( './lib/device.js' );
var circle_apis = require( './lib/circle.js' );
var db = require( './mysql-client.js' );
var db_con = new db();

//Handle Redis server connection /////////////////////////////////////
var redis = require("redis");
var rs_client_sub = null
var rs_client_pub = null
if(cube_set.CACHE_SERVICE_URL && cube_set.CACHE_SERVICE_PORT){
	rs_client_sub = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
	rs_client_pub = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
	rs_client_data = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
}
else
	console.log("redis connection setting lost")

if(!rs_client_sub || !rs_client_pub){
	process.exit(1);
}

rs_client_sub.on("message", function (channel, message) {
	console.log("[api-server]sub channel :" + channel + ", got a message:" + message);
});

rs_client_sub.subscribe("interface");

////////////////////////////////////////////////////////////

// 解析上下文里node原生请求的POST参数
function parsePostData( ctx ) {
	return new Promise((resolve, reject) => {
		try {
			let postdata = "";
			ctx.req.addListener('data', (data) => {
				postdata += data
			})
			ctx.req.addListener("end",function(){
				let parseData = parseQueryStr( postdata )
				resolve( parseData )
			})
		} catch ( err ) {
			reject(err)
		}
	})
}

// 将POST请求参数字符串解析成JSON
function parseQueryStr( queryStr ) {
	let queryData = {}
	let queryStrList = queryStr.split('&')
	for (  let [ index, queryStr ] of queryStrList.entries()  ) {
		let itemList = queryStr.split('=')
		queryData[ itemList[0] ] = decodeURIComponent(itemList[1])
	}
	return queryData
}



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
}).post('/push', async ( ctx )=>{
	let postData_p = await parsePostData( ctx )
	if(postData_p.target_id && postData_p.push_message){
		ctx.body = 'send message!'
		rs_client_pub.publish("interface", JSON.stringify(postData_p));
	}else{
		ctx.body = 'content error!'
	}
})

// Handle device type API
let device_if = new Router()
device_if.post('/login', async ( ctx )=>{
	let postData = await parsePostData( ctx )
	let res_data = {}
	res_data.result = "Success"
	await device_apis.login(db_con,rs_client_data,postData.id,postData.auth_key,res_data)
	ctx.body = res_data
})

// Handle circle type API
let circle_if = new Router()
circle_if.get('/circle-device', async ( ctx )=>{
	let url = ctx.url
	let request = ctx.request
	let req_query = request.query
	let res_data = {}
	res_data.result = "Success"	
	if(req_query.cid){
		let circle_id=req_query.cid;
		await circle_apis.get_device_list(db_con,circle_id,res_data)
	}else{
		res_data.result = "Fail"
		res_data.message = "Invalid parameter"
	}
	
	
	ctx.body = res_data
})

let router = new Router()
router.use('/', home.routes(), home.allowedMethods())
router.use('/connect', page.routes(), page.allowedMethods())
router.use('/device', device_if.routes(), page.allowedMethods())
router.use('/circle', circle_if.routes(), page.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())

app.listen(cube_set.INTERFACE_SERVER_PORT, () => {
	console.log('Cube Interface service starting at port',cube_set.INTERFACE_SERVER_PORT)
})


