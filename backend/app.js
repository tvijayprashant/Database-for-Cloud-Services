const express = require("express");
const bodyParser = require("body-parser");
// const client = require("./database");
const { Random_insert } = require("./runtime");
const { create_login_client, sign_up, login_user } = require("./database");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./"));

let rcount = 1;
setInterval(() => {
	Random_insert(rcount);
	rcount = rcount + 1;
}, 10 * 1000);

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

app.get("/signup", async function (req, res) {
	req = {
		name: "Jawahar",
		email: "jawahar@pes.edu",
		password: "jawahar@123",
		payment: "LOAN",
	};

	sign_up.connect();
	let user_id = 0;
	sign_up.query(`select max(user_id) from user_`, (err, user) => {
		if (err) {
			console.log(err);
		} else {
			console.log(user);
			let usr = user.rows[0].max;
			let inc_user_id = 0;
			inc_user_id = parseInt(usr.substring(3)) + 1;
			console.log(inc_user_id);
			inc_user_id = inc_user_id.toString();
			console.log(inc_user_id);
			user_id = "USR" + inc_user_id.padStart(6, "0");
			// await console.log("Hello : %s", user_id);
			let usr_password = "";
			sign_up.query(
				`select crypt('${req.password}',gen_salt('bf'))`,
				async (err, passwd) => {
					if (err) {
						console.log(err);
					} else {
						usr_password = passwd.rows[0].crypt;
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
									`insert into user_ values ('${user_id}',${1},'${req.name}','${
										req.email
									}','${usr_password}',0,'${req.payment}')`,
									(err, insert) => {
										if (err) {
											console.log(err);
										} else {
										}
									}
								);
								res.send("User has been created!");
							}
						}
					);
				}
			);
		}
	});
});

app.get("/login", function (req, res) {
	login_user.connect();
	req = {
		email: "jawahar@pes.edu",
		password: "jawahar@123",
	};
	login_user.query(
		`select count(*) from USER_EMAILS where EMAIL_ID='${req.email}'`,
		async (err, result) => {
			if (!err) {
				// console.log(result.rows[0].count);
				if (result.rows[0].count == 1) {
					console.log("Checking for Password");
					console.log(req);
					crypt = `crypt('${req.password}', PASSWD)`;
					const login = create_login_client(req.email, req.password);
					login.connect();
					await login.query(
						`select count(email_id) from USER_ where EMAIL_ID='${req.email}' and PASSWD=${crypt}`,
						async (error, user) => {
							if (!error) {
								console.log(user.rows);
								if (user.rows[0].count == 1) {
									console.log("User authenticated!");
									res.json({
										authenticated: 1,
										message: "User Authenticated.",
									});
								} else {
									console.log("User Login failed!");
									res.json({
										authenticated: 0,
										message: "Failed to Authenticate due to invalid password.",
									});
								}
							}
						}
					);
				} else {
					console.log(err);
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

app.get("/project", function (req, res) {
	req = {
		name: "cdsaml-12350",
		email: "jawahar@pes.edu",
		password: "jawahar@123",
		userID: "USR000009",
	};
	login = create_login_client(req.email, req.password);
	login.connect();
	login.query(
		`insert into project values ('${req.name}')`,
		async (err, project) => {
			if (err) {
				console.log(err);
			} else {
				login.query(
					`insert into worked_on values ('${req.name}','${req.userID}')`,
					async (err, insert) => {
						if (err) {
							console.log(err);
						} else {
							res.json({
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

app.get("/:projectID/create_vm", function (request, res) {
	req = {
		userID: "USR000009",
		email: "jawahar@pes.edu",
		password: "jawahar@123",
		name: "chaii",
		boot_disk: "Ubuntu-20.04",
		preemptibility: false,
		internal_ip: "10.1.10.21",
		external_ip: null,
		host_name: "microsoft",
		network_tag: null,
		subnet: null,
		zone_name: "eu-east-a",
		projectID: request.params.projectID,
		ram: 32,
		gpu: "(0,0,0,0,0)",
		disk: "(1,0,0)",
		machine: "EC2",
		date: "2021-11-10 10:00:00",
	};

	login = create_login_client(req.email, req.password);
	login.connect();

	login.query(
		`select create_vm('${req.userID}','${req.name}','${req.boot_disk}','${req.preemptibility}','${req.internal_ip}',${req.external_ip},'${req.host_name}',${req.network_tag},${req.subnet},'${req.zone_name}','${req.projectID}',${req.ram},'${req.gpu}','${req.disk}','${req.machine}','${req.date}')`,
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

app.get("/:projectID/delete_vm", function (req, res) {
	req = {
		email: "jawahar@pes.edu",
		vm: "VM_0000006",
		userID: "USR000009",
		password: "jawahar@123",
	};
	login = create_login_client(req.email, req.password);
	login.connect();

	login.query(
		`select delete_vm('${req.vm}','${req.userID}')`,
		async (err, vm) => {
			if (!err) {
				if (vm.rows[0].delete_vm == 1) {
					res.json({
						message: "VM has been deleted!",
					});
				} else {
					console.log(vm.rows[0].delete_vm);
					res.json({
						message: "VM cannot be deleted due to unknow reason",
					});
				}
			} else {
				console.log(err);
				res.json({
					message: "VM cannot be deleted due to unknow reason",
				});
			}
			await login.end();
		}
	);
});

app.get("/:projectID/vm/edit_config", function (req, res) {
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
