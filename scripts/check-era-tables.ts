// Check era tables in database
import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "data", "tide.db");
const db = new Database(dbPath);

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name LIKE 'era_%'
  ORDER BY name
`).all();

console.log("📊 Era tables in database:");
tables.forEach((t: any) => console.log(`  - ${t.name}`));

// Check if era_currencies exists and its structure
try {
  const columns = db.prepare("PRAGMA table_info(era_currencies)").all();
  console.log("\n💰 era_currencies columns:");
  columns.forEach((c: any) => console.log(`  - ${c.name} (${c.type})`));
} catch (e) {
  console.log("\n⚠️  era_currencies table does not exist");
}

db.close();
