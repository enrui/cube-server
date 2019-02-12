var mysql = require('mysql');
var cube_set = require('/jroot/etc/ENV.json');

var con = mysql.createConnection({
	  host: cube_set.DB_URL,
	  user: cube_set.DB_USER,
	  password: cube_set.DB_PW,
	  database: cube_set.DB_MAIN
});

module.exports = function(){
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	});

	this.db_query = function(sql_query){
		return new Promise((resolve, reject) => {
			try {
				con.query(sql_query, function (err, result) {
					if (err) return -1;
					resolve( result )
				});
			} catch ( err ) {
			  reject(err)
			}
		})
	}
}
