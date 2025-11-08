// Migration script to add era details tables
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "tide.db");
const db = new Database(dbPath);

console.log("🔧 Starting era details migration...");

try {
  // Start transaction
  db.exec("BEGIN TRANSACTION");

  // 1. Extend eras table with new columns
  console.log("📋 Extending eras table...");
  
  const eraColumns = [
    "ALTER TABLE eras ADD COLUMN short_summary TEXT",
    "ALTER TABLE eras ADD COLUMN ongoing INTEGER DEFAULT 0",
    "ALTER TABLE eras ADD COLUMN start_month INTEGER",
    "ALTER TABLE eras ADD COLUMN start_day INTEGER",
    "ALTER TABLE eras ADD COLUMN end_month INTEGER",
    "ALTER TABLE eras ADD COLUMN end_day INTEGER",
    "ALTER TABLE eras ADD COLUMN tech_level TEXT",
    "ALTER TABLE eras ADD COLUMN magic_tide TEXT",
    "ALTER TABLE eras ADD COLUMN stability_conflict TEXT",
    "ALTER TABLE eras ADD COLUMN travel_safety INTEGER",
    "ALTER TABLE eras ADD COLUMN economy TEXT",
    "ALTER TABLE eras ADD COLUMN law_order TEXT",
    "ALTER TABLE eras ADD COLUMN religious_temperature TEXT",
    "ALTER TABLE eras ADD COLUMN rules_rest_recovery TEXT",
    "ALTER TABLE eras ADD COLUMN rules_difficulty_bias INTEGER",
    "ALTER TABLE eras ADD COLUMN transition_in TEXT",
    "ALTER TABLE eras ADD COLUMN transition_out TEXT",
    "ALTER TABLE eras ADD COLUMN friendly_label TEXT",
    "ALTER TABLE eras ADD COLUMN icon TEXT",
  ];

  for (const sql of eraColumns) {
    try {
      db.exec(sql);
    } catch (e: any) {
      if (!e.message.includes("duplicate column")) {
        throw e;
      }
    }
  }

  // 2. Create era_governments table
  console.log("📋 Creating era_governments table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_governments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      gov_type TEXT,
      territory_controlled TEXT,
      current_ruler TEXT,
      stability_status TEXT,
      military_strength TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE
    )
  `);

  // 3. Create era_trade_routes table
  console.log("📋 Creating era_trade_routes table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_trade_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      start_point TEXT,
      end_point TEXT,
      trade_goods TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE
    )
  `);

  // 4. Create era_economic_conditions table
  console.log("📋 Creating era_economic_conditions table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_economic_conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      condition_type TEXT NOT NULL,
      description TEXT,
      affected_regions TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE
    )
  `);

  // 5. Create era_catalysts table
  console.log("📋 Creating era_catalysts table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_catalysts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      catalyst_type TEXT NOT NULL,
      start_date_year INTEGER,
      start_date_month INTEGER,
      start_date_day INTEGER,
      end_date_year INTEGER,
      end_date_month INTEGER,
      end_date_day INTEGER,
      player_visible INTEGER DEFAULT 1,
      short_summary TEXT,
      full_notes TEXT,
      impacts TEXT,
      mechanical_tags TEXT,
      ripple_effects TEXT,
      anniversary_date TEXT,
      related_catalysts TEXT,
      settlement_reactions TEXT,
      attachment_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE
    )
  `);

  // 6. Create era_currencies table
  console.log("📋 Creating era_currencies table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      coin_name TEXT NOT NULL,
      value_in_credits REAL NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE
    )
  `);

  // 7. Create era_regions table
  console.log("📋 Creating era_regions table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      parent_govt TEXT,
      currency_rule TEXT NOT NULL,
      local_coins TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE
    )
  `);

  // 8. Create era_catalog_races table
  console.log("📋 Creating era_catalog_races table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_catalog_races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      race_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE,
      FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
      UNIQUE(era_id, race_id)
    )
  `);

  // 9. Create era_catalog_creatures table
  console.log("📋 Creating era_catalog_creatures table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_catalog_creatures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      creature_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      danger_index_shift INTEGER DEFAULT 0,
      migration_trend TEXT,
      seasonal_window TEXT,
      laws_protections TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE,
      FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE,
      UNIQUE(era_id, creature_id)
    )
  `);

  // 10. Create era_catalog_languages table
  console.log("📋 Creating era_catalog_languages table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_catalog_languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      language_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE,
      UNIQUE(era_id, language_name)
    )
  `);

  // 11. Create era_catalog_deities table
  console.log("📋 Creating era_catalog_deities table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_catalog_deities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      deity_name TEXT NOT NULL,
      influence TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE,
      UNIQUE(era_id, deity_name)
    )
  `);

  // 12. Create era_catalog_factions table
  console.log("📋 Creating era_catalog_factions table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_catalog_factions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      faction_name TEXT NOT NULL,
      faction_type TEXT,
      scope TEXT,
      posture TEXT,
      aim TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE,
      UNIQUE(era_id, faction_name)
    )
  `);

  // 13. Create era_catalog_organizations table
  console.log("📋 Creating era_catalog_organizations table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS era_catalog_organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      organization_name TEXT NOT NULL,
      status TEXT NOT NULL,
      activity_level TEXT,
      current_leadership TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id) ON DELETE CASCADE,
      UNIQUE(era_id, organization_name)
    )
  `);

  // Create indexes for performance
  console.log("📋 Creating indexes...");
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_era_governments_era ON era_governments(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_trade_routes_era ON era_trade_routes(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_economic_conditions_era ON era_economic_conditions(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_catalysts_era ON era_catalysts(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_currencies_era ON era_currencies(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_regions_era ON era_regions(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_catalog_races_era ON era_catalog_races(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_catalog_creatures_era ON era_catalog_creatures(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_catalog_languages_era ON era_catalog_languages(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_catalog_deities_era ON era_catalog_deities(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_catalog_factions_era ON era_catalog_factions(era_id)",
    "CREATE INDEX IF NOT EXISTS idx_era_catalog_organizations_era ON era_catalog_organizations(era_id)",
  ];

  for (const sql of indexes) {
    db.exec(sql);
  }

  // Commit transaction
  db.exec("COMMIT");

  console.log("✅ Era details migration completed successfully!");
  console.log("\n📊 Tables created:");
  console.log("  - Extended eras table with 18 new columns");
  console.log("  - era_governments (political entities)");
  console.log("  - era_trade_routes (economic connections)");
  console.log("  - era_economic_conditions (market states)");
  console.log("  - era_catalysts (major events)");
  console.log("  - era_currencies (coin standards)");
  console.log("  - era_regions (kingdoms/territories)");
  console.log("  - era_catalog_races (race availability)");
  console.log("  - era_catalog_creatures (creature status)");
  console.log("  - era_catalog_languages (active languages)");
  console.log("  - era_catalog_deities (deity influence)");
  console.log("  - era_catalog_factions (faction postures)");
  console.log("  - era_catalog_organizations (organization activity)");

} catch (error) {
  db.exec("ROLLBACK");
  console.error("❌ Migration failed:", error);
  process.exit(1);
} finally {
  db.close();
}
