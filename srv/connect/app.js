#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var urlp = require('url');


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
	 ID and circle_ID
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

 Send a message to a connection by its connectionID
 function sendToConnectionId(connectionID, data) {
	var connection = connections[connectionID];
	if (connection && connection.connected) {
		console.log((new Date()) + "Send data to connection ID:"+connectionID);
		connection.send(data);
	}
}
        