var ws = require('./ws-client.js');
var ws_connection = new ws();

const koa = require('koa')
const app = new koa()


app.use( async(ctx)=>{
	ctx.body = "Hello EJ"
	ws_connection.send_msg("xxxxx");
})

app.listen(3000)
