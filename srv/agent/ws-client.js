const WebSocket = require('ws');

var cube_set = require('/jroot/etc/ENV.json');

if(cube_set.NOTIFY_SERVER_URL && cube_set.NOTIFY_SERVER_PORT)
        var ws = new WebSocket('ws://'+cube_set.NOTIFY_SERVER_URL+':'+cube_set.NOTIFY_SERVER_PORT+'?type=agent&id=00000001');
else
        console.log("ws connection setting lost")

var ws_con = null;

module.exports = function(){

        ws.on('open', function open() {
                console.log("open connection");
                //ws.send(1);         
        });

        ws.on('message', function incoming(data) {
                console.log(" client get message:"+data);
        });

        this.send_msg = function(msg){
                ws.send(msg);
        }


}