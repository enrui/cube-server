#!/usr/bin/env node
var cube_set = require('/jroot/etc/ENV.json');
var WebSocketServer = require('websocket').server;
var http = require('http');
var urlp = require('url');

//Handle Redis server connection
var redis = require("redis");

//client subscriber/publisher is use to forward mwssage from interface server to device agent
var rs_client_sub = null
var rs_client_pub = null

//middle subcriber/publisher is use to forward device event message to subscriber who from web-app or thers
var rs_middle_sub = []
var rs_middle_pub = []
if(cube_set.CACHE_SERVICE_URL && cube_set.CACHE_SERVICE_PORT){
	rs_client_sub = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
	rs_client_pub = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
}
else{
	console.log("redis connection setting lost")
	process.exit(1);
}
	

if(!rs_client_sub || !rs_client_pub){
	process.exit(1);
}

rs_client_sub.on("subscribe", function (channel, count) {
	console.log("[connect-server]subscribed channel:"+channel+"")
	rs_client_pub.publish("interface", "I am sending a message.");
});

rs_client_sub.on("message", function (channel, message) {
	console.log("[connect-server]sub channel :" + channel + ", got a message:" + message);
	var message_obj = {}

	try {
        	message_obj = JSON.parse(message);
    	} catch (e) {
        	message_obj.target_id = null
    	}
	if(message_obj.target_id && message_obj.push_message)
		sendToConnectionId(JSON.parse(message).target_id,JSON.parse(message).push_message)
	
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

server.listen(cube_set.NOTIFY_SERVER_PORT, function() {
	console.log((new Date()) + ' Server is listening on port',cube_set.NOTIFY_SERVER_PORT);
});


wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

var connections = {};
var connections_event_subscriber = {};
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
	
	
	if(url_query.query.type == "agent"){
		if(!url_query.query.id)
			return;
		
		var connection_id = url_query.query.id
		connection.cube_device_id = connection_id
		var circle_id = null
		if(url_query.query.circle)
			var circle_id = url_query.query.circle
	
		connections[url_query.query.id] = connection;
		if(!connections_event_subscriber[url_query.query.id])
			connections_event_subscriber[url_query.query.id]={};
		
		console.log((new Date()) + ' Agent Connection accepted.');
		if(!rs_middle_pub[connection_id] && !rs_middle_sub[connection_id]){
			rs_middle_pub[connection_id] = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
			rs_middle_sub[connection_id] = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
			
			rs_middle_sub[connection_id].subscribe(connection_id+"_event_message");
			
			
			rs_middle_sub[connection_id].on("message", function (channel, message) {
				console.log("[Middle message]sub channel :" + channel + ", got a message:" + message);
				//Send message from agent to other event subscriber
				event_broadcast(connection_id, message)
				
			});
		}		
	}else if(url_query.query.type == "event_sub"){
		console.log((new Date()) + ' Connection accepted.');

		if(!connections_event_subscriber[url_query.query.target_id])
			connections_event_subscriber[url_query.query.target_id]={}
		
		connections_event_subscriber[url_query.query.target_id][url_query.query.sub_id] = connection;
	}
	
	
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log((new Date()) + "ws server received Message:"+message.utf8Data);
			/*
			handle something
			*/
			
			rs_middle_pub[connection_id].publish(this.cube_device_id+"_event_message", message.utf8Data);			
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


function event_broadcast(device_id, data) {
	if(!connections_event_subscriber[device_id])
		return;
	
	Object.keys(connections_event_subscriber[device_id]).forEach(function(key) {
		var connection = connections_event_subscriber[device_id][key];
		if (connection.connected) {
			connection.send(data);
		}
	});
}

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
        
