// This script resets the SQLite database to its initial state by copying a baseline backup file over the existing database file.
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const dbPath = process.env.DB_PATH
  ? path.resolve(root, process.env.DB_PATH)
  : path.resolve(root, "delivery.db");

const baselinePath = path.resolve(root, "delivery.backup.initial.db");

if (!fs.existsSync(baselinePath)) {
  console.error(`Baseline DB not found: ${baselinePath}`);
  process.exit(1);
}

fs.copyFileSync(baselinePath, dbPath);
console.log(`Database reset complete.
Source: ${baselinePath}
Target: ${dbPath}`);