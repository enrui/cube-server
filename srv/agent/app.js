//var onoff_gpio = require('onoff').Gpio;
//var led_controller = require( './output/led.js' );
const WebSocket = require('ws');
const fs = require("fs");

var led_pin=2, led_sw=0;
//var led = new onoff_gpio(led_pin, 'out');
var auth = require( './lib/auth.js' );
var cube_set = require('/jroot/etc/ENV.json');
var id_set = require('/jroot/etc/ID.json');

var ws=null
var retry_connector = null

async function cube_login() {
	let cube_token = await auth.login(id_set.ID,id_set.KEY);
	
	clearTimeout(retry_connector)

	if(cube_token == "fail")
		process.exit(1);
	
	fs.writeFile( "../../tmp/.tk", cube_token, function( err ){
		if(err) 
			process.exit(1);
	} );
	
	if(cube_set.NOTIFY_SERVER_URL && cube_set.NOTIFY_SERVER_PORT)
		ws = new WebSocket('ws://'+cube_set.NOTIFY_SERVER_URL+':'+cube_set.NOTIFY_SERVER_PORT+'?type=agent&id='+id_set.ID);
	else
		console.log("ws connection setting lost")
	
	ws.on('open', function open() {
		console.log("open connection");
		//ws.send(1);         
	});
	
	ws.onerror = function(err) {
		console.log('Socket is error. Reconnect will be attempted in 1 second.');
                retry_connector = setTimeout(function() {
                        ws=null
			cube_login();
                }, 5000);
	}

	ws.on('message', function incoming(data) {
		console.log(" client get message:"+data);
		if("got" == data){
			if(1==led_sw){
				led_sw=0
				//led_controller.led_switch(led,1);
			}else{
				led_sw=1
				//led_controller.led_switch(led,0);
			}
			
		}
	});

}

cube_login()







