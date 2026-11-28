const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  let client;
  let connected = false;

  try {
    if (process.env.ALLOW_DB_SCHEMA_SETUP !== "true") {
      throw new Error(
        "Refusing database schema setup. Verify DATABASE_URL and set ALLOW_DB_SCHEMA_SETUP=true only for an approved database.",
      );
    }

    const envPath = path.join(__dirname, "..", ".env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?\s*$/m);

    if (!match || !match[1].trim()) {
      throw new Error("DATABASE_URL is missing or empty in .env");
    }

    client = new Client({ connectionString: match[1].trim() });
    await client.connect();
    connected = true;
    console.log("Connected to database");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "RateLimit" (
        "key" TEXT PRIMARY KEY,
        "count" INTEGER NOT NULL DEFAULT 0,
        "resetAt" TIMESTAMP(3) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");
    `);
    console.log("RateLimit table is ready");
  } catch (err) {
    console.error("RateLimit table setup failed:", err.message);
    process.exitCode = 1;
  } finally {
    if (client && connected) {
      try {
        await client.end();
      } catch (err) {
        console.error("Failed to close database connection:", err.message);
        process.exitCode = 1;
      }
    }
  }
}

main().catch((err) => {
  console.error("Unexpected RateLimit setup failure:", err);
  process.exitCode = 1;
});
