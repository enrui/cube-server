
const WebSocket = require('ws');

var ws = new WebSocket('ws://192.168.11.107:8080');

var ws_con = null;

module.exports = function(){

	ws.on('open', function open() {
		 console.log("open");
		        ws.send("xxx");         
	});

	ws.on('message', function incoming(data) {
		          console.log(" client get message:"+data);
	});

	this.send_msg = function(msg){
		        ws.send(msg);
	}


}
