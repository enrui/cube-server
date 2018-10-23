var request_promise = require('request-promise');
var cube_set = require('/jroot/etc/ENV.json');

function get_token_data(did, key){
	return new Promise((resolve, reject) => {
		try {
			var options = {
				method: 'POST',
				uri: 'http://'+cube_set.INTERFACE_SERVER_URL+':'+cube_set.INTERFACE_SERVER_PORT+'/device/login',
				form: {
					id:did,
					auth_key:key
				},
				json: true // Automatically stringifies the body to JSON
			};

			request_promise(options)
				.then(function (parsedBody) {
					resolve(parsedBody.token)
				})
				.catch(function (err) {
					resolve("fail")
				});			 			
		} catch ( err ) {
			reject(err)
		}
	})
}

module.exports = {
	login : async function(id, key){
		tkn = await get_token_data(id, key);
		return tkn
	}
};
