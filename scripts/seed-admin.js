const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

function readEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs.readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        if (separator === -1) return ["", ""];
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        return [key, value];
      })
      .filter(([key]) => key)
  );
}

const fileEnv = readEnvFile();
const connectionString = process.env.DATABASE_URL || fileEnv.DATABASE_URL;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in the environment or .env file.");
  process.exit(1);
}

if (!ADMIN_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL)) {
  console.error("Set a valid ADMIN_EMAIL environment variable before running this script.");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 128) {
  console.error("ADMIN_PASSWORD must be between 12 and 128 characters.");
  process.exit(1);
}

const client = new Client({ connectionString });

(async () => {
  try {
    await client.connect();
    console.log("Connected to database");

    const existing = await client.query(
      'SELECT id FROM "AdminUser" WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existing.rows.length > 0) {
      console.error("Admin already exists. No password or account changes were made.");
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await client.query(
      'INSERT INTO "AdminUser" (id, email, password, role) VALUES ($1, $2, $3, $4)',
      [randomUUID(), ADMIN_EMAIL, hashedPassword, "ADMIN"]
    );

    console.log("Admin account created successfully.");
    console.log("For security, credentials are not printed. Remove ADMIN_EMAIL and ADMIN_PASSWORD from your shell after use.");
  } catch (err) {
    console.error("Admin seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
})();
