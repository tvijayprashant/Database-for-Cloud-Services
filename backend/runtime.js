const { runtime_insert } = require("./database");

const Random_insert = function Random_insert(n) {
	runtime_insert.connect();
	runtime_insert.query(
		`select vm_id from VM where status<>'Stopped'`,
		(err, vms) => {
			if (!err) {
				for (let vm in vms.rows){
					let m_dates = new Date();
					let dates = new Date(m_dates.setMilliseconds(0));
					let new_date = new Date(dates.setSeconds(0));
					let new_min_date = new Date(new_date.setMinutes(0));
					let new_hour_date = new_min_date.setHours(
						new_min_date.getHours() + n
					);
					timestamp = `insert into runtime values ('${vms.rows[vm].vm_id}',to_timestamp(${new_hour_date}/1000.0),0.00,0.00,0.00,0.00,'00:00:00','00:00:00')`
					runtime_insert.query(timestamp, async (err, insert_runtime) => {
						if (err) {
							console.log(err);
						} else {
							// console.log(insert_runtime);
						}
					});
				}
				console.log("runtime update");
			}	
			else {
				console.log(err);
			}
		});
	runtime_insert.query(
		`select vm_id from VM where status='Stopped'`,
		(err, vms) => {
			if (!err) {
				// console.log(vms.rows[0].vm_id);
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
					runtime_insert.query(
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
								// console.log(gpu_count);

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
									// console.log(timestamp);
								} else {
									timestamp = `insert into runtime values ('${vms.rows[vm].vm_id}',to_timestamp(${new_hour_date}/1000.0),${disk_usage},${ram_usage},0.00,${cpu_usage},'00:00:00','01:00:00')`;
									// console.log(timestamp);
								}

								runtime_insert.query(
									`select cost from monitors where vm_id='${vms.rows[vm].vm_id}'`,
									(err, cost) => {
										if (err) console.log(err);
										else {
											console.log(cost.rows[0].cost);
											cost = cost.rows[0].cost
												.substring(1, cost.rows[0].cost.length - 1)
												.split(",")
												.map(function (item) {
													return parseFloat(item);
												});
											cost = cost[0] + cost[1];
											console.log(cost);
											runtime_insert.query(
												`select user_id from access where vm_id='${vms.rows[vm].vm_id}' limit 1`,
												(err, user) => {
													if (err) console.log(err);
													else {
														runtime_insert.query(
															`update USER_ set credits=credits-${cost} where user_id='${user.rows[0].user_id}'`,
															(err, credits) => {
																if (err) console.log(err);
																else {
																	console.log(
																		`${cost} has been cut from USER:'${user.rows[0].user_id}'`
																	);
																}
															}
														);
													}
												}
											);
										}
									}
								);
								runtime_insert.query(timestamp, async (err, insert_runtime) => {
									if (err) {
										console.log(err);
									} else {
										// console.log(insert_runtime);
									}
								});
							}
						}
					);
				}
			} else {
				console.log(err);
			}
		}
	);
};
module.exports = { Random_insert };
