#!/usr/bin/env node
var cube_set = require('/jroot/etc/ENV.json');
var WebSocketServer = require('websocket').server;
var http = require('http');
var urlp = require('url');

//Handle Redis server connection
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

rs_client_sub.on("subscribe", function (channel, count) {
	console.log("subscribed channel:"+channel+"")
	rs_client_pub.publish("interface", "I am sending a message.");
});

rs_client_sub.on("message", function (channel, message) {
	console.log("sub channel :" + channel + ", got a message:" + message);
});

rs_client_sub.subscribe("interface");

/* the other way to connect redis service
var redis = require('./redis-client.js');
var redis_connection = new redis();

//subscribe channel interface for communicate with interface server
redis_connection.subscribe("interface")
*/

var server = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8080, function() {
	console.log((new Date()) + ' Server is listening on port 8080');
});


wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

var connections = {};
var connections_circle = [];

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	var connection = request.accept(null, request.origin);
	var url_query =urlp.parse(request.resource,true);
	//ID and circle_ID
	var connection_id = url_query.query.id
	var circle_id = null
	if(url_query.query.circle)
		var circle_id = url_query.query.circle
	
	connections[url_query.query.id] = connection;
	console.log((new Date()) + ' Connection accepted.');


	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log((new Date()) + "ws server received Message:"+message.utf8Data);
			sendToConnectionId(message.utf8Data,"got");
		}
		else if (message.type === 'binary') {
			console.log((new Date()) + 'Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
	});
	
	connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});


function broadcast(data) {
	Object.keys(connections).forEach(function(key) {
	var connection = connections[key];
	if (connection.connected) {
		connection.send(data);
	}
	});
}

//Send a message to a connection by its connectionID
function sendToConnectionId(connectionID, data) {
	var connection = connections[connectionID];
	if (connection && connection.connected) {
		console.log((new Date()) + "Send data to connection ID:"+connectionID);
		connection.send(data);
	}
}
        