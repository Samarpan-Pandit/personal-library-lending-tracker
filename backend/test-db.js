const db = require("./db");

async function testConnection() {
    try {
        const result = await db.query(
            "SELECT current_database() AS database_name, current_user AS user_name"
        );

        console.log("Database connected successfully!");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Database connection failed:", error.message);

    } finally {
        await db.pool.end();
    }
}

testConnection();