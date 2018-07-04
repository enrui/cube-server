var onoff_gpio = require('onoff').Gpio;
var led_controller = require( './output/led.js' );
const WebSocket = require('ws');

var led_pin=2, led_sw=0;
var led = new onoff_gpio(led_pin, 'out');
var cube_set = require('/jroot/etc/ENV.json');
var id_set = require('/jroot/etc/ID.json');

if(cube_set.NOTIFY_SERVER_URL && cube_set.NOTIFY_SERVER_PORT)
        var ws = new WebSocket('ws://'+cube_set.NOTIFY_SERVER_URL+':'+cube_set.NOTIFY_SERVER_PORT+'?type=agent&id='+id_set.ID);
else
        console.log("ws connection setting lost")

var ws_con = null;

ws.on('open', function open() {
	console.log("open connection");
	//ws.send(1);         
});

ws.on('message', function incoming(data) {
	console.log(" client get message:"+data);
	if("got" == data){
		if(1==led_sw){
			led_sw=0
			led_controller.led_switch(led,1);
		}else{
			led_sw=1
			led_controller.led_switch(led,0);
		}
		
	}
});


