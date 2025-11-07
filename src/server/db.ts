// src/server/db.ts
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "tide.db");

// ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// open db
export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// create users table (id, username, email, pass hash, role)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  pass_hash     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free','admin','worldbuilder','developer','privileged')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);

CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id;
END;
`);

// --- SKILLS + BUILD TABLES (for Skillsets page) ---
db.exec(`
-- =========================
-- skills
-- =========================
CREATE TABLE IF NOT EXISTS skills (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by_id        TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  primary_attribute    TEXT NOT NULL CHECK (primary_attribute IN ('STR','DEX','CON','INT','WIS','CHA','NA')),
  secondary_attribute  TEXT NOT NULL CHECK (secondary_attribute IN ('STR','DEX','CON','INT','WIS','CHA','NA')),
  type                 TEXT NOT NULL CHECK (type IN (
    'standard','magic','sphere','discipline','resonance',
    'spell','psionic skill','reverberation','special ability'
  )),
  tier                 INTEGER NULL CHECK (tier IN (1,2,3) OR tier IS NULL),

  name                 TEXT NOT NULL UNIQUE,
  definition           TEXT NOT NULL DEFAULT '',

  parent_id            INTEGER NULL REFERENCES skills(id) ON DELETE SET NULL,
  parent2_id           INTEGER NULL REFERENCES skills(id) ON DELETE SET NULL,
  parent3_id           INTEGER NULL REFERENCES skills(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_skills_name               ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_type               ON skills(type);
CREATE INDEX IF NOT EXISTS idx_skills_tier               ON skills(tier);
CREATE INDEX IF NOT EXISTS idx_skills_primary_attr       ON skills(primary_attribute);
CREATE INDEX IF NOT EXISTS idx_skills_created_by         ON skills(created_by_id);
CREATE INDEX IF NOT EXISTS idx_skills_parents            ON skills(parent_id, parent2_id, parent3_id);

CREATE TRIGGER IF NOT EXISTS trg_skills_updated_at
AFTER UPDATE ON skills
FOR EACH ROW
BEGIN
  UPDATE skills SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- =========================
-- magic_builds (1:1 with a skill)
-- =========================
CREATE TABLE IF NOT EXISTS magic_builds (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id             INTEGER NOT NULL UNIQUE REFERENCES skills(id) ON DELETE CASCADE,

  -- classification
  tradition            TEXT NOT NULL CHECK (tradition IN ('spellcraft','psionics','bardic')),
  tier2_path           TEXT NULL,

  -- machine-friendly blobs
  containers_json      TEXT NOT NULL DEFAULT '[]',
  modifiers_json       TEXT NOT NULL DEFAULT '{}',

  -- computed summary
  mana_cost            INTEGER NOT NULL DEFAULT 0,
  casting_time         INTEGER NOT NULL DEFAULT 0,
  mastery_level        TEXT NOT NULL DEFAULT 'Apprentice',

  -- human-readable columns (export-friendly)
  range_text           TEXT NULL,
  shape_text           TEXT NULL,
  duration_text        TEXT NULL,
  effects_text         TEXT NULL,
  container_breakdown  TEXT NULL,
  addons_text          TEXT NULL,
  modifiers_text       TEXT NULL,
  notes                TEXT NULL,
  flavor_line          TEXT NULL,
  progressive_conditions TEXT NULL,

  saved_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_magic_builds_skill_id ON magic_builds(skill_id);
CREATE INDEX IF NOT EXISTS idx_magic_builds_saved_at ON magic_builds(saved_at);

-- =========================
-- special_ability_scaling (1:1 with a skill)
-- =========================
CREATE TABLE IF NOT EXISTS special_ability_scaling (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id         INTEGER NOT NULL UNIQUE REFERENCES skills(id) ON DELETE CASCADE,

  ability_type     TEXT NOT NULL CHECK (ability_type IN ('Utility','Combat','Magic/Psionic','Other')),
  prerequisites    TEXT NULL,
  scaling_method   TEXT NOT NULL CHECK (scaling_method IN ('Point-Based','Point & Roll-Based','Skill % Based','Point Multiplier Based','Other')),
  scaling_details  TEXT NOT NULL,

  saved_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- =========================
-- special_ability_requirements (1:1 with a skill)
-- =========================
CREATE TABLE IF NOT EXISTS special_ability_requirements (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id         INTEGER NOT NULL UNIQUE REFERENCES skills(id) ON DELETE CASCADE,

  -- Stage 1
  stage1_tag       TEXT NULL,
  stage1_desc      TEXT NULL,
  stage1_points    TEXT NULL,

  -- Stage 2
  stage2_tag       TEXT NULL,
  stage2_desc      TEXT NULL,
  stage2_points    TEXT NULL,

  -- Stage 3
  stage3_tag       TEXT NULL,
  stage3_desc      TEXT NULL,

  -- Stage 4
  stage4_tag       TEXT NULL,
  stage4_desc      TEXT NULL,

  -- Final
  final_tag        TEXT NULL,
  final_desc       TEXT NULL,

  -- Additional (up to 4)
  add1_tag         TEXT NULL,
  add1_desc        TEXT NULL,
  add2_tag         TEXT NULL,
  add2_desc        TEXT NULL,
  add3_tag         TEXT NULL,
  add3_desc        TEXT NULL,
  add4_tag         TEXT NULL,
  add4_desc        TEXT NULL,

  saved_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
`);

// --- INVENTORY TABLES: items, weapons, armors --------------------------------
db.exec(`
-- =========================
-- items (general)
-- =========================
CREATE TABLE IF NOT EXISTS items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by_id    TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name             TEXT NOT NULL UNIQUE,
  timeline_tag     TEXT NULL,
  cost_credits     INTEGER NULL,
  category         TEXT NULL,
  subtype          TEXT NULL,
  genre_tags       TEXT NULL,
  mechanical_effect TEXT NULL,
  weight           REAL NULL,
  narrative_notes  TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_name          ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_category      ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_created_by    ON items(created_by_id);

CREATE TRIGGER IF NOT EXISTS trg_items_updated_at
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
  UPDATE items SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- =========================
-- weapons
-- =========================
CREATE TABLE IF NOT EXISTS weapons (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by_id    TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name             TEXT NOT NULL UNIQUE,
  timeline_tag     TEXT NULL,
  cost_credits     INTEGER NULL,

  category         TEXT NULL,
  handedness       TEXT NULL,
  dtype            TEXT NULL,
  range_type       TEXT NULL,
  range_text       TEXT NULL,
  genre_tags       TEXT NULL,

  weight           REAL NULL,
  damage           INTEGER NULL,
  effect           TEXT NULL,
  narrative_notes  TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_weapons_name        ON weapons(name);
CREATE INDEX IF NOT EXISTS idx_weapons_category    ON weapons(category);
CREATE INDEX IF NOT EXISTS idx_weapons_handed      ON weapons(handedness);
CREATE INDEX IF NOT EXISTS idx_weapons_dtype       ON weapons(dtype);
CREATE INDEX IF NOT EXISTS idx_weapons_created_by  ON weapons(created_by_id);

CREATE TRIGGER IF NOT EXISTS trg_weapons_updated_at
AFTER UPDATE ON weapons
FOR EACH ROW
BEGIN
  UPDATE weapons SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- =========================
-- armors
-- =========================
CREATE TABLE IF NOT EXISTS armors (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by_id         TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name                  TEXT NOT NULL UNIQUE,
  timeline_tag          TEXT NULL,
  cost_credits          INTEGER NULL,

  area_covered          TEXT NULL,
  soak                  INTEGER NULL,
  category              TEXT NULL,
  atype                 TEXT NULL,
  genre_tags            TEXT NULL,

  weight                REAL NULL,
  encumbrance_penalty   INTEGER NULL,
  effect                TEXT NULL,
  narrative_notes       TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_armors_name         ON armors(name);
CREATE INDEX IF NOT EXISTS idx_armors_category     ON armors(category);
CREATE INDEX IF NOT EXISTS idx_armors_atype        ON armors(atype);
CREATE INDEX IF NOT EXISTS idx_armors_created_by   ON armors(created_by_id);

CREATE TRIGGER IF NOT EXISTS trg_armors_updated_at
AFTER UPDATE ON armors
FOR EACH ROW
BEGIN
  UPDATE armors SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;
`);
