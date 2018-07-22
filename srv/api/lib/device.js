module.exports = {
	login : async function(con, id, key, res){
		console.log(id)
		console.log(key)
		device_data = await con.db_query("SELECT * FROM cube_device where cd_id ="+id);
		if(device_data == -1){
			return 0;
		}
		//console.log(device_data.cd_platform_id)
		res.token="x=hf2309f2hS21sd";
	}
};