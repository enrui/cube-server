var Client = require('node-ssdp').Client
var client = new Client();

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

// And after 10 seconds, you want to stop
// setTimeout(function () {
//   client.stop()
// }, 10000)