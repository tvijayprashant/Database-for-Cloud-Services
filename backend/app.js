const express = require("express");
const bodyParser = require("body-parser");
const client = require("./database");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./"));

app.get("/", function (req, res) {
	res.send("Hollow Worlds!");
});

app.get("/login", function (req, res) {
	client.connect();
	req = {
		email: "jermy.lfb@gmail.com",
		password: "Financial Education",
	};
	client.query(
		`select count(*) from USER_ where EMAIL_ID='${req.email}'`,
		async (err, result) => {
			if (!err) {
				// console.log(result.rows[0].count);
				if (result.rows[0].count == 1) {
					console.log("Checking for Password");
					console.log(req);
					crypt = `crypt('${req.password}', PASSWD)`;
					await client.query(
						`select count(*) from USER_ where EMAIL_ID='${req.email}' and PASSWD=${crypt}`,
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
										authenticated: 1,
										message: "Failed to Authenticate due to invalid password.",
									});
								}
							} else {
								console.log(error);
							}
							await client.end();
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
				await client.end();
			}
		}
	);
});

app.get("/:projectID/create_vm", function (req, res) {
	client.connect();
	req = {
		userID: "USR000007",
		name: "chaii",
		boot_disk: "Ubuntu-20.04",
		preemptibility: false,
		internal_ip: "10.1.10.21",
		external_ip: null,
		host_name: "microsoft",
		network_tag: null,
		subnet: null,
		zone_name: "us-central-b",
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
			await client.end();
		}
	);
});

app.get("/:projectID/delete_vm", function (req, res) {
	client.connect();
	req = {
		vm: "VM_0000005",
		userID: "USR000007",
	};
	client.query(
		`select delete_vm('${req.vm}','${req.userID}')`,
		async (err, vm) => {
			if (!err) {
				if (vm.rows[0].delete_vm == 1) {
					res.json({
						message: "VM has been deleted!",
					});
				} else {
					res.json({
						message: "VM cannot be deleted due to unknow reason",
					});
				}
			} else {
				res.json({
					message: "VM cannot be deleted due to unknow reason",
				});
			}
			await client.end();
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
