var Server = require('node-ssdp').Server
var cube_set = require('/jroot/etc/ENV.json');
var id_set = require('/jroot/etc/ID.json');
var Client = require('node-ssdp').Client
var client = new Client();

var server = new Server({ 
			location: {
			  port: 3000,
			  path: '/service.cgi'
			},
			udn:"cube-agent-id:"+id_set.ID
		});

module.exports = {
	
	push : function() {
		
		server.addUSN('urn:schemas-upnp-org:service:cube:agent');
  
		server.on('advertise-alive', function (headers) {
		  // Expire old devices from your cache.
		  // Register advertising device somewhere (as designated in http headers heads)
		});

		server.on('advertise-bye', function (headers) {
		  // Remove specified device from cache.
		});
		
		// start the server
		server.start();

		process.on('exit', function(){
		  server.stop() // advertise shutting down and stop listening
		})
	},
	
	listen : function() {
		client.on('notify', function (headers, statusCode, rinfo) {
		  console.log('Got a notification.')
		})

		client.on('response', function (headers, statusCode, rinfo) {
			  //console.log(headers.LOCATION)
			  console.log('Got a response to an m-search:\n%d\n%s\n%s', statusCode, JSON.stringify(headers, null, '  '), JSON.stringify(rinfo, null, '  '))
			});
			
		// Or maybe if you want to scour for everything after 5 seconds
		setInterval(function() {
		  client.search('urn:schemas-upnp-org:service:cube:agent')
		}, 5000)
	}
	
};

