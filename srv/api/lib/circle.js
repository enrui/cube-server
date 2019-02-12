
module.exports = {
	get_device_list : async function(db_con, cid, res){
		let sql_result;
		sql_result = await db_con.db_query("SELECT * FROM cube.cube_circle_device where ccd_cid = " + cid);
		if(sql_result == -1){
			res.result = "Fail"
			return;
		}
		res.device_list=[]
		sql_result.forEach(function(row) {
			let device_data={}
			device_data.device_id=row.ccd_did
			device_data.device_status=row.ccd_status
			res.device_list.push(device_data)
		});
	}
};
