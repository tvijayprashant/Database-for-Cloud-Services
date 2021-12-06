const express = require("express");
const bodyParser = require("body-parser");
// const client = require("./database");
const { Random_insert } = require("./runtime");
const { create_login_client, sign_up, login_user } = require("./database");
const app = express();
const cors = require('cors');
const { removeAllListeners } = require("nodemon");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./"));
app.use(cors({
    origin: '*'
}));

let rcount = 1;
setInterval(() => {
	Random_insert(rcount);
	rcount = rcount + 1;
}, 1000*1000);

app.get("/", async function (req, res) {
	// client = create_login_client("admin_user", "123");
	// client.connect();
	// client.query(`select * from project`, async (err, result) => {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		res.json({
	// 			vm: result.rows[0],
	// 		});
	// 	}
	// 	await client.end();
	// });

	res.send("hello world!");
});

app.post("/signup", async function (req, res) {
	// req = {
	// 	name: "Jawahar",
	// 	email: "jawahar@pes.edu",
	// 	password: "jawahar@123",
	// 	payment: "LOAN",
	// };
	req=req.body[0]
	sign_up.connect();
	let user_id = 0;
	sign_up.query(`select max(user_id) from user_`, (err, user) => {
		if (err) {
			console.log(err);
		} else {
			// console.log(user);
			let usr = user.rows[0].max;
			let inc_user_id = 0;
			inc_user_id = parseInt(usr.substring(3)) + 1;
			// console.log(inc_user_id);
			inc_user_id = inc_user_id.toString();
			// console.log(inc_user_id);
			user_id = "USR" + inc_user_id.padStart(6, "0");
			// await console.log("Hello : %s", user_id);
			let usr_password = "";
			sign_up.query(
				`select crypt('${req.password}',gen_salt('bf'))`,
				async (err, password) => {
					if (err) {
						console.log(err);
					} else {
						usr_password = password.rows[0].crypt;
					}
					await console.log(usr_password);
					sign_up.query(
						`CREATE USER "${req.email}" WITH PASSWORD '${req.password}'`,
						(err, db_usr) => {
							if (err) {
								console.log(err);
							} else {
								sign_up.query(
									`GRANT SELECT,UPDATE,DELETE ON USER_ TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,INSERT,UPDATE,DELETE ON PROJECT TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting PROJECT permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,INSERT,UPDATE,DELETE ON VM TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting VM permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,INSERT,UPDATE,DELETE ON WORKED_ON TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting VM permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,INSERT,UPDATE,DELETE ON ACCESS TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting VM permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,INSERT,UPDATE,DELETE ON MONITORS TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting VM permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,UPDATE ON HARDWARE TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting VM permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,UPDATE ON ZONE TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting VM permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`GRANT SELECT,INSERT,DELETE ON RUNTIME TO "${req.email}"`,
									(err, permission) => {
										if (err) {
											console.log(err);
										} else {
											console.log(
												`Setting VM permissions for user:"${req.email}"`
											);
										}
									}
								);

								sign_up.query(
									`insert into user_ values ($1,${1},$2,$3,$4,0,$5)`,
									[user_id.toString(),req.name.toString(), req.email.toString(),usr_password.toString(),req.payment.toString()],
									(err, insert) => {
										if (err) {
											console.log(err);
										} else {
											
											sign_up.end()
											res.json({
												authenticated: 1,
												message: "User has been created!",
											});
										}
									}
								);
							}
						}
					);
				}
			);
		}
	});
});

app.post("/login", function (req, res) {
	login_user.connect();
	// req = {
	// 	email: "jawahar@pes.edu",
	// 	password: "jawahar@123",
	// };
	req=req.body[0]
	// console.log(req.email)
	login_user.query(
		`select count(*) from USER_EMAILS where EMAIL_ID=$1`,[req.email.toString()],
		async (err, result) => {
			if (!err) {
				console.log(result.rows[0].count);
				if (result.rows[0].count == 1) {
					console.log("Checking for Password");
					// console.log(req);
					crypt = `crypt('${req.password}', passwd)`;
					const login = create_login_client(req.email, req.password);
					login.connect();
					login.query(
						`select count(email_id) from USER_ where EMAIL_ID=$1 and USER_.passwd=${crypt}`,[req.email],
						async (error, user) => {
							if (!error) {
								// console.log(user.rows);
								if (user.rows[0].count == 1) {
									console.log("User authenticated!");
									login.query(`select * from USER_ where email_id = $1`,[req.email],(err,resp)=>{
										if (err) console.log(err)
										else{
											// console.log(resp.rows[0]);
											login.end();
											// console.log(resp)
											res.json({
												authenticated: 1,
												admin : resp.rows[0].admin,
												message: "User Authenticated.",
												user: resp.rows[0]
											});
										}
									});
								} else {
									console.log("User Login failed!");
									res.json({
										authenticated: 0,
										message: "Failed to Authenticate due to invalid password.",
									});
								}
							}
							else{
								// console.log(error)
								console.log("2User Login failed!");
									res.json({
										authenticated: 0,
										message: "Failed to Authenticate due to invalid password.",
									});
							}
							// await login.end();
						}
					);
				} else {
					res.json({
						authenticated: 0,
						message: `Failed to Authenticate due to invalid email : ${req.email}.`,
					});
				}
			} else {
				console.log(err);
				res.json({
					authenticated: 0,
					message: `Failed to Authenticate due to invalid email : ${req.email}.`,
				});
				// await login_user.end();
			}
		}
	);
});

app.post("/project", (req,res) => {
	// console.log(req);
	// req = {
	// 	email: 'vp1@gmail.com',
	// 	password: 'a',
	// 	user_id:'USR000007'
	// }
	req = req.body[0];
	login = create_login_client(req.email,req.password);
	login.connect();
	login.query(`select project_id from worked_on where user_id = $1`,[req.user_id],(err,projects) => {
		if (err) {
			console.log(err);
			res.json({
				id:[],
				curr: null
			});
		}
		else{
			// console.log(projects)
			list = [];
			for (let row = projects.rows.length - 1; row >= 0; row--){
				// console.log(projects.rows[row])
				if(row == 0){
					list.push({'id':projects.rows[row].project_id})
					res.json({
						id: list,
						curr : projects.rows[row].project_id
					})
				}
				else{
					list.push({'id':projects.rows[row].project_id});
				}
			}
			
		}
		
	});
	// login.end();


});

app.post("/create_project", function (req, res) {
	// req = {
	// 	name: "cdsaml-12350",
	// 	email: "jawahar@pes.edu",
	// 	password: "jawahar@123",
	// 	userID: "USR000009",
	// };
	req = req.body[0];
	login = create_login_client(req.email, req.password);
	login.connect();
	login.query(
		`insert into project values ($1)`,[req.name],
		async (err, project) => {
			if (err) {
				console.log(err);
			} else {
				// console.log(req);
				// console.log(req.name);
				// console.log(req.user_id);
				login.query(
					`insert into worked_on values ($1,$2)`,[req.name,req.user_id],
					async (err, insert) => {
						if (err) {
							console.log(err);
							login.end();
							res.json({
								res:0,
								message: "project not created",
							});
						} else {
							login.end();
							res.json({
								res:1,
								message: "Successfully created project.",
							});
						}
					}
				);
			}
			// await login.end();
		}
	);
});

app.post("/status",function(req,res){
	// req = {
	// 	vm: 'VM_0000002',
	// 	status: "Running",
	// 	email: 'vp1@gmail.com',
	// 	password: 'a',
	// }
	req = req.body[0];
	// console.log(req)
	login = create_login_client(req.email,req.password);
	login.connect()
	login.query(`update vm set status=$1 where vm_id=$2`,[req.status,req.vmId],async (err,update)=>{
		if(err){
			console.log(err)
		}
		else{
			res.json({
				message: "Started VM"
			})
		}
		await login.end();
	});
})

app.post("/vm_metric", function (req, res) {
	req = req.body;
	// req={
	// 	email: 'vp1@gmail.com',
	// 	password: 'a',
	// 	vm:'VM_0000002'
	// }
	login = create_login_client(req.email,req.password);
	login.connect()
	metrics = {du:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],ru:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],gu:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cu:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],gr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};		
	// console.log(vms.rows[vm].name.toString());
	login.query(`select disk_usage, ram_usage, gpu_usage,cpu_usage, gpu_runtime, cpu_runtime from runtime where vm_id = $1 order by time limit 24`,[req.vm],async (err,metric) => {
		if(err) {console.log(err);
		res.json({metric:metrics});}
		else{
			for(row in metric.rows){
				metrics.du[row] = parseFloat(metric.rows[row].disk_usage);
				metrics.ru[row] = parseFloat(metric.rows[row].ram_usage);
				metrics.gu[row] = parseFloat(metric.rows[row].gpu_usage);
				metrics.cu[row] = parseFloat(metric.rows[row].cpu_usage);
				metrics.gr[row] = parseInt(metric.rows[row].gpu_runtime);
				metrics.cr[row] = parseInt(metric.rows[row].cpu_runtime);
			}
			// await mlist.push(metrics);
			// console.log(mlist);
			// console.log(metrics)
			res.json({metric:metrics});
		}
	})
	// let result = {vms:vms.rows, metric:metrics};
	// console.log(result);
	//
});

app.post("/project_metric",function(req,res){
	req={
		email: 'vp4@gmail.com',
		password: 'a',
		// user_id:'USR000007',
		project_id:'cdsaml-32445'
	}
	login = create_login_client(req.email,req.password);
	login.connect()
	metrics = {du:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],ru:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],gu:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cu:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],gr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
	login.query(`select sum(gpu_runtime) as gr, sum(cpu_runtime) as cr, sum(gpu_usage) as gu, sum(cpu_usage) as cu, sum(disk_usage) as du, sum(ram_usage) as ru from runtime natural join vm where project_id=$1 group by time order by time limit 24`,[req.project_id],async (err,metric) => {
		if(err) {console.log(err);
		res.json({metric:metrics});}
		else{
			for(row in metric.rows){
				metrics.du[row] = parseFloat(metric.rows[row].du);
				metrics.ru[row] = parseFloat(metric.rows[row].ru);
				metrics.gu[row] = parseFloat(metric.rows[row].gu);
				metrics.cu[row] = parseFloat(metric.rows[row].cu);
				metrics.gr[row] = parseInt(metric.rows[row].gr.hours);
				metrics.cr[row] = parseInt(metric.rows[row].cr.hours);
			}
			// await mlist.push(metrics);
			// console.log(mlist);
			// console.log(metrics)
			res.json({metric:metrics});
		}
	})
})

app.post("/zone_metric",function(req,res){
	// req={
	// 	email: 'vp1@gmail.com',
	// 	password: 'a',
	// 	// user_id:'USR000007',
	// 	zone:'us-central-b'
	// }
	req = req.body
	sign_up.connect()
	metrics = {du:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],ru:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],gu:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cu:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],cr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],gr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
	sign_up.query(`select sum(gpu_runtime) as gr, sum(cpu_runtime) as cr, sum(gpu_usage) as gu, sum(cpu_usage) as cu, sum(disk_usage) as du, sum(ram_usage) as ru from runtime natural join vm where zone_name=$1 group by time order by time limit 24`,[req.zone],async (err,metric) => {
		if(err) {console.log(err);
		res.json({metric:metrics});}
		else{
			for(row in metric.rows){
				metrics.du[row] = parseFloat(metric.rows[row].du);
				metrics.ru[row] = parseFloat(metric.rows[row].ru);
				metrics.gu[row] = parseFloat(metric.rows[row].gu);
				metrics.cu[row] = parseFloat(metric.rows[row].cu);
				metrics.gr[row] = parseInt(metric.rows[row].gr.hours);
				metrics.cr[row] = parseInt(metric.rows[row].cr.hours);
			}
			// await mlist.push(metrics);
			// console.log(mlist);
			// console.log(metrics)
			res.json({metric:metrics});
		}
	})
})



app.post("/project_vm", async function (req, res) {
	req = req.body[0]
	// req={
	// 	email: 'vp4@gmail.com',
	// 	password: 'a',
	// 	project_id:'cdsaml-32445',
	// }
	login = create_login_client(req.email,req.password);
	login.connect()
	await login.query(`select vm_id from vm where project_id=$1`,[req.project_id],async (err,proj) => {
		if(err){
			console.log(err);
			res.json({
				vms:"Error in SQL statement"
			});
		}
		else{
			console.log(proj);
			res.json({proj:proj.rows});
		}
		login.end();
	});
});

app.post("/vm", async function (req, res) {
	// req={
	// 	email: 'vp4@gmail.com',
	// 	password: 'a',
	// 	user_id:'USR000007',
	// 	projectID: 'cdsaml-32445' 
	// }
	// console.log(req.body);
	req = req.body;
	login = create_login_client(req.email,req.password);
	login.connect()
	await login.query(`select name,vm_id,zone_name,external_ip,internal_ip,status from worked_on natural join vm where project_id=$1 and user_id=$2`,[req.projectID, req.user_id],async (err,vms) => {
		if(err){
			console.log(err);
			res.json({
				vms:"Error in SQL statement"
			});
		}
		else{
			// console.log(vms.rows);
			res.json({vms:vms.rows});
		}
		login.end();
	});
});

app.post("/vm_cost",function(req,res){
	// const tableData = [{id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542}]},
    //                     {id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542},{name:"sdfsgdfsfva",cost:13}]},
    //                     {id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542}]}]
	// req={
	// 	email: 'vp4@gmail.com',
	// 	password: 'a',
	// 	user_id:'USR000007',
	// 	project_id: ['Anthe','Masrk','cdsaml-32445','Majestic'],
	// 	// vm:'VM_0000002'
	// }
	req = req.body
	// select cost,vm_id,sum(cpu_runtime) as cr, sum(gpu_runtime) as gr from vm natural join monitors natural join runtime where project_id = 'cdsaml-32445' group by vm_id,cost;
	login = create_login_client(req.email,req.password);
	login.connect()
	login.query(`select monitors.vm_id,sum(cpu_runtime) as cr,sum(gpu_runtime) as gr,cost,project_id from runtime natural join vm natural join worked_on join monitors on monitors.vm_id = vm.vm_id where user_id = $1 group by monitors.vm_id,cost,project_id`,[req.user_id],async (err,runtime) => {
		if(err) console.log(err);
		else{
			console.log(runtime.rows)
			list = []
			for (proj in req.project_id){
				list.push({id: req.project_id[proj], vm:[]})
			}
			for (row in runtime.rows){
				let cost = runtime.rows[row].cost
				.substring(1, runtime.rows[row].cost.length - 1)
				.split(",")
				.map(function (item) {
					return parseFloat(item);
				});
				// console.log(cost)
				console.log([runtime.rows[row].cr.hours *  cost[0], runtime.rows[row].gr.hours *  cost[1]])
				for (i in list)
				{
					if(list[i].id == runtime.rows[row].project_id)
					{
						list[i].vm.push({'name':runtime.rows[row].vm_id,cost:runtime.rows[row].cr.hours * cost[0] + runtime.rows[row].gr.hours * cost[1]})
					}
				}
			}
			res.json({
				 list:list
			})
		}
	})
	// console.log(clist)	
});


app.post("/create_vm", function (req, res) {
	// req = {
	// 	userID: "USR000007",
	// 	email: "jawahar@pes.edu",
	// 	password: "jawahar@123",
	// 	name: "chaii",
	// 	boot_disk: "Ubuntu-20.04",
	// 	preemptibility: false,
	// 	internal_ip: "10.1.10.21",
	// 	external_ip: null,
	// 	host_name: "microsoft",
	// 	network_tag: null,
	// 	subnet: null,
	// 	projectID:'pluck-rarity',
	// 	zone_name: "us-central-a",
	// 	ram: 32,
	// 	gpu: "(0,0,0,0,0)",
	// 	disk: "(1,0,0)",
	// 	machine: "EC2",
	// 	date: "2021-11-10 10:00:00",
	// };
	req = req.body;
	login = create_login_client(req.email, req.password);
	login.connect();

	login.query(
		`select create_vm($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
		[req.userID, req.name, req.boot_disk, req.preemptibility, req.internal_ip, req.external_ip, req.host_name, req.network_tag, req.subnet, req.zone_name, req.projectID, req.ram, req.gpu, req.disk, req.machine, req.date],
		async (err, vm) => {
			if (!err) {
				if (vm.rows[0].create_vm == "0000000000") {
					res.json({
						vm: 0,
						message:
							"VM could not be created due to some unknown reason. Good Luck!",
					});
				} else {
					res.json({
						vm: 1,
						message: "VM has been created successfully! Enjoy.",
					});
				}
			} else {
				console.log(err);
				res.json({
					vm: 0,
					message:
						"VM could not be created due to some unknown reason. Good Luck!",
				});
			}
			await login.end();
		}
	);
});

app.post("/delete_vm", function (req, res) {
	req = req.body;
	// req = {
	// 	email: "jawahar@pes.edu",
	// 	vm: "VM_0000006",
	// 	userID: "USR000009",
	// 	password: "jawahar@123",
	// };
	// console.log(req)
	login = create_login_client(req.email, req.password);
	login.connect();

	login.query(
		`select delete_vm('${req.vm}','${req.userID}')`,
		async (err, vm) => {
			if (!err) {
				if (vm.rows[0].delete_vm == 1) {
					console.log(vm.rows[0].delete_vm);
					res.json({
						result: 1,
						message: "VM has been deleted!",
					});
				} else {
					console.log(vm.rows[0].delete_vm);
					res.json({
						result:0,
						message: "VM cannot be deleted due to unknow reason",
					});
				}
			} else {
				console.log(err);
				res.json({
					result:0,
					message: "VM cannot be deleted due to unknow reason. SQL Error",
				});
			}
			await login.end();
		}
	);
});

app.post("/vm/details", function(req,res){
	req = req.body;
	console.log(req);
	login = create_login_client(req.email,req.password);
	login.connect();
	// console.log(req);
	login.query(`select * from VM where vm_id=$1`,[req.vm], async (err,details)=>{
		if(err){
			console.log(err);
		}
		else{
			res.send(details.rows[0]);
		}
		await login.end();
	});
})

app.post("/vm/quotas", function(req,resp){
	console.log(req.body);
	req = req.body;
	// req = {email: 'vp4@gmail.com', password: 'a', projectID:'cdsaml-32445'}
	login = create_login_client(req.email, req.password);
	login.connect();
	login.query(`select quotas from project where project_id=$1`,[req.projectID], async (err,quota)=>{
		if(err){
			console.log(err);
		}
		else{
			// console.log('hello')
			// const quotas = [{nvm:5, disk:[2,3,4], gpuP:[1,1,1,1,1], gpu:[1,1,1,1,1],mfP:[2,2,2,2,2], mf:[0,0,2,2,2]},
            //         {nvm:15, disk:[2,3,5], gpuP:[1,2,3,4,5], gpu:[1,1,2,1,1],mfP:[2,0,2,2,2], mf:[2,2,2,4,2]},
            //         {nvm:52, disk:[0,0,0], gpuP:[1,1,0,10,0], gpu:[1,2,1,1,1],mfP:[2,2,0,2,2], mf:[8,2,2,2,2]},
            //         {nvm:2, disk:[4,3,4], gpuP:[1,0,1,0,1], gpu:[1,1,11,3,1],mfP:[2,2,0,20,2], mf:[2,8,2,7,2]}]
			let quotas = quota.rows[0].quotas;
			console.log(quotas);
			quotas = quotas.substring(3, quotas.length - 4)
												.split('")","(')
												.map(function (item) {
													// console.log(item)
													res = []
													res.push( parseInt(item[0]))
													item.substring(4, item.length -1)
													.split('"",""')
													.map((i2) => {
														// console.log(i2)
														res2 = []
														i2 = i2.substring(1,i2.length - 1)
														.split(',')
														.map((i3)=>{
															
															return parseInt(i3)
														});
														// console.log(i2)
														res.push(i2)
													});
													// console.log(res)
													return {nvm:res[0],gpuP:res[1],gpu:res[2],disk:res[3],mfP:res[4],mf:res[5]};
												});

			console.log('sent quotas');
			// console.log(quotas);
			resp.json({quotas : quotas})
		}
		await login.end();
	})
})

app.post("/vm/edit_config", function (req, res) {
	client.connect();
	req = {
		vmID: "VM_0000005",
		userID: "USR000007",
		name: "chaii",
		boot_disk: "Ubuntu-20.04",
		preemptibility: false,
		internal_ip: "10.1.10.21",
		external_ip: null,
		host_name: "microsoft",
		network_tag: null,
		subnet: null,
		zone_name: "eu-east-a",
		projectID: "cdsaml-32445",
		ram: 32,
		gpu: "(0,0,0,0,0)",
		disk: "(1,0,0)",
		machine: "EC2",
		date: "2021-11-10 10:00:00",
	};
	client.query(
		`select create_vm('${req.userID}','${req.name}','${req.boot_disk}','${req.preemptibility}','${req.internal_ip}',${req.external_ip},'${req.host_name}',${req.network_tag},${req.subnet},'${req.zone_name}','${req.projectID}',${req.ram},'${req.gpu}','${req.disk}','${req.machine}','${req.date}')`,
		async (err, vm) => {
			if (!err) {
				if (vm.rows[0].create_vm != "0000000000") {
					console.log("VM was created. Preparing for Data Transfer.");
					client.query(
						`update VM set transfer_vm_id='${vm.rows[0].create_vm}' where VM_ID='${req.vmID}'`,
						async (error_transfer, transfer) => {
							if (!error_transfer) {
								console.log(
									"Data transfer completed successfully. Preparing to delete old VM."
								);
								client.query(
									`select delete_vm('${req.vmID}','${req.userID}')`,
									async (error_delete, delete_vm) => {
										if (!error_delete) {
											if (delete_vm.rows[0].delete_vm == 1) {
												console.log("Deletion of old VM successful. Exiting.");
												client.query(
													`update VM set VM_ID='${req.vmID}' where VM_ID='${vm.rows[0].create_vm}'`,
													async (error_done, done) => {
														if (!error_done) {
															res.json({
																message:
																	"VM has been updated to specified configuration.",
															});
														} else {
															console.log(error_done);
															res.json({
																message:
																	"VM could not be updated to specified configuration.",
															});
														}
														await client.end();
													}
												);
											} else {
												console.log("Could not delete VM");
											}
										} else {
											console.log(error_delete);
										}
									}
								);
							} else {
								console.log(error_transfer);
							}
						}
					);
				} else {
					console.log("Could not create VM");
				}
			} else {
				console.log(err);
			}
		}
	);
});

app.listen(8008, function () {
	console.log("Server running on port 8008!");
});
