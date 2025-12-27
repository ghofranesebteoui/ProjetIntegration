const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
    multipleStatements: true,
  });

  try {
    console.log("Connected to database");

    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      console.log(`\nRunning migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, "utf8");

      try {
        await connection.query(sql);
        console.log(`✓ ${file} completed`);
      } catch (err) {
        // Ignorer les erreurs de colonnes/tables déjà existantes
        if (
          err.code === "ER_DUP_FIELDNAME" ||
          err.code === "ER_TABLE_EXISTS_ERROR"
        ) {
          console.log(`⚠ ${file} skipped (already exists)`);
        } else {
          throw err;
        }
      }
    }

    console.log("\n✓ All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
