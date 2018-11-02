var sha1 = require('sha1');

function get_redis_data(rs_con, id){
	return new Promise((resolve, reject) => {
		try {
			rs_con.get(id+'_tkn', (error, result) => {
				if (!error && result) {
					resolve(result)
				}
				resolve("")
			});
		} catch ( err ) {
			reject(err)
		}
	})
}


module.exports = {
	login : async function(db_con, redis_con, id, key, res){
		let pw = "", auth_src = "", auth_token = "", sql = "";
		let sql_result;
		let redis_cache;
		sql_result = await db_con.db_query("SELECT * FROM cube_device where cd_id = '" + id + "' and cd_auth_key = '" + key + "'");
		if(sql_result == -1){
			res_data.result = "Fail"
			return;
		}
		
		redis_cache = await get_redis_data(redis_con, id);
		if(redis_cache){
			auth_token=redis_cache;
		}
		else{
			if( !sql_result.cd_auth_pw || "" == sql_result.cd_auth_pw ){
				pw = Math.random().toString(36).substring(2, 15);
				sql = "UPDATE cube_device SET cd_auth_pw = '"+ pw +"' WHERE cd_id = '"+id+"'";
				sql_result = await db_con.db_query(sql);
			}else{
				pw = sql_result.cd_auth_pw
			}
			
			auth_src = key + Math.random().toString(10).substring(2, 10) + pw;
			auth_token = sha1(auth_src);
			redis_con.set(id+'_tkn', auth_token, 'EX', 10);
		}		
		res.token=id+":"+auth_token;
	}
};
