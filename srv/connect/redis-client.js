#!/usr/bin/env node
var cube_set = require('/jroot/etc/ENV.json');
var redis = require("redis");
var client = null
var client_pub = null
if(cube_set.CACHE_SERVICE_URL && cube_set.CACHE_SERVICE_PORT){
	client = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
	client_pub = redis.createClient(cube_set.CACHE_SERVICE_PORT,cube_set.CACHE_SERVICE_URL);
}
else
	console.log("redis connection setting lost")

if(!client || !client_pub){
	process.exit(1);
}

module.exports = function(){
	client.on("subscribe", function (channel, count) {
		console.log("subscribed channel:"+channel+"")
		client_pub.publish("interface", "I am sending a message.");
	});

	client.on("message", function (channel, message) {
		console.log("sub channel :" + channel + ", got a message:" + message);
	});
	
	this.subscribe = function(channel){
		console.log(channel)
		client.subscribe(channel);
	}
	
	this.publish = function(channel, message){
		console.log(message)
		client_pub.publish("interface", "I am sending a message.");
	}
}