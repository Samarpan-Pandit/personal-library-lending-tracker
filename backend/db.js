const { Pool } = require("pg");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on("error", (error) => {
    console.error("Unexpected database error:", error);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
