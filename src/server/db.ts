// src/server/db.ts
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "tide.db");
const SCHEMA_PATH = path.join(DATA_DIR, "db-schema-up-to-eras.sql");

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Open database
export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize schema if database is empty
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

if (tables.length === 0) {
  console.log("Initializing fresh database schema...");
  
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
  }
  
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  
  console.log("✓ Database schema initialized successfully");
}


