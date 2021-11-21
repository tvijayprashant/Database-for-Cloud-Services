const client = require("./database");

client.connect();
	client.query(
		`select `,
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