// Migration to add region_id to era_currencies table
import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "data", "tide.db");
const db = new Database(dbPath);

console.log("🔧 Adding region_id to era_currencies table...");

try {
  db.exec("BEGIN TRANSACTION");

  // Check if column already exists
  const columns = db.prepare("PRAGMA table_info(era_currencies)").all() as any[];
  const hasRegionId = columns.some((col: any) => col.name === "region_id");

  if (!hasRegionId) {
    db.exec(`
      ALTER TABLE era_currencies 
      ADD COLUMN region_id INTEGER 
      REFERENCES era_regions(id) ON DELETE CASCADE
    `);
    console.log("✅ region_id column added to era_currencies");
  } else {
    console.log("ℹ️  region_id column already exists");
  }

  db.exec("COMMIT");
  console.log("✅ Migration completed successfully!");
} catch (error) {
  db.exec("ROLLBACK");
  console.error("❌ Migration failed:", error);
  process.exit(1);
}

db.close();
