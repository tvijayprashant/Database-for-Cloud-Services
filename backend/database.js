const { Client } = require("pg");

const client = new Client({
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "123",
	database: "cloud_management",
});

client.on("connect", () => {
	console.log("Connected to Cloud_Management");
});

client.on("end", () => {
	console.log("Connection close");
});

client.on("notice", (msg) => console.warn("notice:", msg.message));

module.exports = client;
