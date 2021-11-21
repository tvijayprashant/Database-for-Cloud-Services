const { Client } = require("pg");

const root = new Client({
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "123",
	database: "cloud_management",
});

root.on("connect", () => {
	console.log("Connected to Cloud_Management");
});

root.on("end", () => {
	console.log("Connection close");
});

root.on("notice", (msg) => console.warn("notice:", msg.message));

const runtime_insert = new Client({
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "123",
	database: "cloud_management",
});

runtime_insert.on("connect", () => {
	console.log("Connected to Cloud_Management");
});

runtime_insert.on("end", () => {
	console.log("Connection close");
});

runtime_insert.on("notice", (msg) => console.warn("notice:", msg.message));

const sign_up = new Client({
	host: "localhost",
	port: 5432,
	user: "admin_user",
	password: "123",
	database: "cloud_management",
});

sign_up.on("connect", () => {
	console.log("Connected to Cloud_Management");
});

sign_up.on("end", () => {
	console.log("Connection close");
});

sign_up.on("notice", (msg) => console.warn("notice:", msg.message));

const login_user = new Client({
	host: "localhost",
	port: 5432,
	user: "login_user",
	password: "123",
	database: "cloud_management",
});

login_user.on("connect", () => {
	console.log("Connected to Cloud_Management");
});

login_user.on("end", () => {
	console.log("Connection close");
});

login_user.on("notice", (msg) => console.warn("notice:", msg.message));

const create_login_client = (username, passwd) => {
	console.log(username);
	console.log(passwd);
	const client = new Client({
		host: "localhost",
		port: 5432,
		user: username,
		password: passwd,
		database: "cloud_management",
	});
	client.on("connect", () => {
		console.log("Connected to Cloud_Management");
	});

	client.on("end", () => {
		console.log("Connection close");
	});

	client.on("notice", (msg) => console.warn("notice:", msg.message));

	return client;
};

exports.create_login_client = create_login_client;
exports.sign_up = sign_up;
exports.login_user = login_user;
