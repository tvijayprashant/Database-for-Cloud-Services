const client = require("./database").rclient;
const Random_insert = function Random_insert(n) {
	client.query(`select vm_id from VM where status='Stopped'`, (err, vms) => {
		if (!err) {
			console.log(vms.rows[0].vm_id);
			for (let vm in vms.rows) {
				console.log(vms.rows[vm].vm_id);
				const disk_usage =
					Math.round((Math.random() + Number.EPSILON) * 100) / 100;
				const ram_usage =
					Math.round((Math.random() + Number.EPSILON) * 100) / 100;
				const cpu_usage =
					Math.round((Math.random() + Number.EPSILON) * 100) / 100;
				const gpu_usage =
					Math.round((Math.random() + Number.EPSILON) * 100) / 100;
				let gpu_count = 0;
				client.query(
					`select gpu from VM where vm_id='${vms.rows[vm].vm_id}'`,
					(err, gpu) => {
						if (err) {
							console.log(err);
						} else {
							// console.log(gpu.rows);
							let _gpu_ = gpu.rows[0].gpu;
							_gpu_ = _gpu_
								.substring(1, _gpu_.length - 1)
								.split(",")
								.map(function (item) {
									return parseInt(item);
								});
							gpu_count = Math.max.apply(null, _gpu_);
							console.log(gpu_count);

							let m_dates = new Date();
							let dates = new Date(m_dates.setMilliseconds(0));
							let new_date = new Date(dates.setSeconds(0));
							let new_min_date = new Date(new_date.setMinutes(0));
							let new_hour_date = new_min_date.setHours(
								new_min_date.getHours() + n
							);
							let timestamp = "";
							if (gpu_count >= 1) {
								// console.log(new_hour_date);
								// let timestamp = `${dates.getFullYear()}-${dates.getMonth()}-${dates.getDate()} ${dates.getHours()}:${dates.getMinutes()}:${dates.getSeconds()}`;

								timestamp = `insert into runtime values ('${vms.rows[vm].vm_id}',to_timestamp(${new_hour_date}/1000.0),${disk_usage},${ram_usage},${gpu_usage},${cpu_usage},'01:00:00','01:00:00')`;
								console.log(timestamp);
							} else {
								timestamp = `insert into runtime values ('${vms.rows[vm].vm_id}',to_timestamp(${new_hour_date}/1000.0),${disk_usage},${ram_usage},0.00,${cpu_usage},'00:00:00','01:00:00')`;
								console.log(timestamp);
							}
							client.query(timestamp, async (err, insert_runtime) => {
								if (err) {
									console.log(err);
								} else {
									console.log(insert_runtime);
								}
							});
						}
					}
				);
			}
		} else {
			console.log(err);
		}
	});
};
module.exports = { Random_insert };
