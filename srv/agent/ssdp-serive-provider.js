var Server = require('node-ssdp').Server
var server = new Server({ 
		location: {
		  port: 80,
		  path: '/xxxx.cgi'
		}
	});

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