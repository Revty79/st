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

// --- CREATURES --------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS creatures (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by_id               TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at                  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at                  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  -- Core identity
  name                        TEXT NOT NULL UNIQUE,
  alt_names                   TEXT NULL,
  challenge_rating            TEXT NULL,
  encounter_scale             TEXT NULL,
  type                        TEXT NULL,
  role                        TEXT NULL,
  genre_tags                  TEXT NULL,
  description_short           TEXT NULL,

  -- Stats
  size                        TEXT NULL,
  strength                    INTEGER NULL,
  dexterity                   INTEGER NULL,
  constitution                INTEGER NULL,
  intelligence                INTEGER NULL,
  wisdom                      INTEGER NULL,
  charisma                    INTEGER NULL,

  hp_total                    INTEGER NULL,
  hp_by_location              TEXT NULL,
  initiative                  INTEGER NULL,
  armor_soak                  TEXT NULL,

  -- Combat
  attack_modes                TEXT NULL,
  damage                      TEXT NULL,
  range_text                  TEXT NULL,

  -- Abilities & behavior
  special_abilities           TEXT NULL,
  magic_resonance_interaction TEXT NULL,
  behavior_tactics            TEXT NULL,
  habitat                     TEXT NULL,
  diet                        TEXT NULL,
  variants                    TEXT NULL,
  loot_harvest                TEXT NULL,
  story_hooks                 TEXT NULL,
  notes                       TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_creatures_name          ON creatures(name);
CREATE INDEX IF NOT EXISTS idx_creatures_type          ON creatures(type);
CREATE INDEX IF NOT EXISTS idx_creatures_role          ON creatures(role);
CREATE INDEX IF NOT EXISTS idx_creatures_size          ON creatures(size);
CREATE INDEX IF NOT EXISTS idx_creatures_created_by    ON creatures(created_by_id);

CREATE TRIGGER IF NOT EXISTS trg_creatures_updated_at
AFTER UPDATE ON creatures
FOR EACH ROW
BEGIN
  UPDATE creatures SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;
`);

// --- RACES ------------------------------------------------------------------
db.exec(`
PRAGMA foreign_keys = ON;

BEGIN;

-- 🔥 Safe rebuild: drop old tables if they exist
DROP TABLE IF EXISTS racial_special_abilities;
DROP TABLE IF EXISTS racial_bonus_skills;
DROP TABLE IF EXISTS racial_attributes;
DROP TABLE IF EXISTS racial_definitions;
DROP TABLE IF EXISTS races;

-- =========================
-- races (core)
-- =========================
CREATE TABLE races (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by_id    TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name             TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_races_name        ON races(name);
CREATE INDEX idx_races_created_by  ON races(created_by_id);

CREATE TRIGGER trg_races_updated_at
AFTER UPDATE ON races
FOR EACH ROW
BEGIN
  UPDATE races
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
  WHERE id = NEW.id;
END;

-- =========================
-- racial_definitions (1:1 with races)
-- (🚫 age_range/size REMOVED here)
-- =========================
CREATE TABLE racial_definitions (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id                     INTEGER NOT NULL UNIQUE REFERENCES races(id) ON DELETE CASCADE,

  legacy_description          TEXT NULL,
  physical_characteristics    TEXT NULL,
  physical_description        TEXT NULL,
  racial_quirk                TEXT NULL,
  quirk_success_effect        TEXT NULL,
  quirk_failure_effect        TEXT NULL,
  common_languages_known      TEXT NULL,
  common_archetypes           TEXT NULL,
  examples_by_genre           TEXT NULL,
  cultural_mindset            TEXT NULL,
  outlook_on_magic            TEXT NULL
);

CREATE INDEX idx_racial_definitions_race_id ON racial_definitions(race_id);

-- =========================
-- racial_attributes (1:1 with races)
-- (✅ keep age_range/size here)
-- =========================
CREATE TABLE racial_attributes (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id              INTEGER NOT NULL UNIQUE REFERENCES races(id) ON DELETE CASCADE,

  age_range            TEXT NULL,
  size                 TEXT NULL,

  strength_max         INTEGER NULL,
  dexterity_max        INTEGER NULL,
  constitution_max     INTEGER NULL,
  intelligence_max     INTEGER NULL,
  wisdom_max           INTEGER NULL,
  charisma_max         INTEGER NULL,

  base_magic           INTEGER NULL,
  base_movement        INTEGER NULL
);

CREATE INDEX idx_racial_attributes_race_id ON racial_attributes(race_id);

-- =========================
-- racial_bonus_skills
-- =========================
CREATE TABLE racial_bonus_skills (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id    INTEGER NOT NULL REFERENCES races(id)   ON DELETE CASCADE,
  skill_id   INTEGER NOT NULL REFERENCES skills(id)  ON DELETE CASCADE,
  points     INTEGER NOT NULL DEFAULT 0,
  slot_idx   INTEGER NOT NULL DEFAULT 0,

  UNIQUE (race_id, slot_idx),
  UNIQUE (race_id, skill_id)
);

CREATE INDEX idx_rbs_race_id    ON racial_bonus_skills(race_id);
CREATE INDEX idx_rbs_skill_id   ON racial_bonus_skills(skill_id);
CREATE INDEX idx_rbs_slot       ON racial_bonus_skills(slot_idx);

-- =========================
-- racial_special_abilities
-- =========================
CREATE TABLE racial_special_abilities (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id    INTEGER NOT NULL REFERENCES races(id)   ON DELETE CASCADE,
  skill_id   INTEGER NOT NULL REFERENCES skills(id)  ON DELETE CASCADE,
  points     INTEGER NOT NULL DEFAULT 0,
  slot_idx   INTEGER NOT NULL DEFAULT 0,

  UNIQUE (race_id, slot_idx),
  UNIQUE (race_id, skill_id)
);

CREATE INDEX idx_rsa_race_id    ON racial_special_abilities(race_id);
CREATE INDEX idx_rsa_skill_id   ON racial_special_abilities(skill_id);
CREATE INDEX idx_rsa_slot       ON racial_special_abilities(slot_idx);

COMMIT;
`);

// --- WORLDBUILDER -----------------------------------------------------------
db.exec(`
PRAGMA foreign_keys = ON;

BEGIN;

-- =========================
-- worlds
-- =========================
CREATE TABLE IF NOT EXISTS worlds (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by_id    TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name             TEXT NOT NULL UNIQUE,
  description      TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_worlds_name        ON worlds(name);
CREATE INDEX IF NOT EXISTS idx_worlds_created_by  ON worlds(created_by_id);

CREATE TRIGGER IF NOT EXISTS trg_worlds_updated_at
AFTER UPDATE ON worlds
FOR EACH ROW
BEGIN
  UPDATE worlds SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- =========================
-- eras (child of worlds)
-- =========================
CREATE TABLE IF NOT EXISTS eras (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name             TEXT NOT NULL,
  description      TEXT NULL,
  start_year       INTEGER NULL,
  end_year         INTEGER NULL,
  color            TEXT NULL DEFAULT '#8b5cf6',

  order_index      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_eras_world           ON eras(world_id);
CREATE INDEX IF NOT EXISTS idx_eras_world_order     ON eras(world_id, order_index);

CREATE TRIGGER IF NOT EXISTS trg_eras_updated_at
AFTER UPDATE ON eras
FOR EACH ROW
BEGIN
  UPDATE eras SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- =========================
-- settings (child of worlds, optionally linked to an era)
-- NOTE: era_id is NULLABLE to match UI behavior when removing an era
-- =========================
CREATE TABLE IF NOT EXISTS settings (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  era_id           INTEGER NULL REFERENCES eras(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name             TEXT NOT NULL,
  description      TEXT NULL,
  start_year       INTEGER NULL,
  end_year         INTEGER NULL
);

CREATE INDEX IF NOT EXISTS idx_settings_world     ON settings(world_id);
CREATE INDEX IF NOT EXISTS idx_settings_era       ON settings(era_id);
CREATE INDEX IF NOT EXISTS idx_settings_name      ON settings(name);

CREATE TRIGGER IF NOT EXISTS trg_settings_updated_at
AFTER UPDATE ON settings
FOR EACH ROW
BEGIN
  UPDATE settings SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- Guard: settings.era_id must reference an era in the same world (when era_id is not null)
CREATE TRIGGER IF NOT EXISTS trg_settings_world_guard
BEFORE INSERT ON settings
FOR EACH ROW
WHEN NEW.era_id IS NOT NULL
BEGIN
  SELECT
    CASE
      WHEN (SELECT world_id FROM eras WHERE id = NEW.era_id) != NEW.world_id
      THEN RAISE(ABORT, 'settings.era_id must belong to the same world')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_settings_world_guard_upd
BEFORE UPDATE OF era_id, world_id ON settings
FOR EACH ROW
WHEN NEW.era_id IS NOT NULL
BEGIN
  SELECT
    CASE
      WHEN (SELECT world_id FROM eras WHERE id = NEW.era_id) != NEW.world_id
      THEN RAISE(ABORT, 'settings.era_id must belong to the same world')
    END;
END;

-- =========================
-- markers (child of worlds, optionally linked to an era)
-- =========================
CREATE TABLE IF NOT EXISTS markers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  era_id           INTEGER NULL REFERENCES eras(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  name             TEXT NOT NULL,
  description      TEXT NULL,
  year             INTEGER NULL
);

CREATE INDEX IF NOT EXISTS idx_markers_world      ON markers(world_id);
CREATE INDEX IF NOT EXISTS idx_markers_era        ON markers(era_id);
CREATE INDEX IF NOT EXISTS idx_markers_year       ON markers(year);
CREATE INDEX IF NOT EXISTS idx_markers_name       ON markers(name);

CREATE TRIGGER IF NOT EXISTS trg_markers_updated_at
AFTER UPDATE ON markers
FOR EACH ROW
BEGIN
  UPDATE markers SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
END;

-- Guard: markers.era_id must reference an era in the same world (when era_id is not null)
CREATE TRIGGER IF NOT EXISTS trg_markers_world_guard
BEFORE INSERT ON markers
FOR EACH ROW
WHEN NEW.era_id IS NOT NULL
BEGIN
  SELECT
    CASE
      WHEN (SELECT world_id FROM eras WHERE id = NEW.era_id) != NEW.world_id
      THEN RAISE(ABORT, 'markers.era_id must belong to the same world')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_markers_world_guard_upd
BEFORE UPDATE OF era_id, world_id ON markers
FOR EACH ROW
WHEN NEW.era_id IS NOT NULL
BEGIN
  SELECT
    CASE
      WHEN (SELECT world_id FROM eras WHERE id = NEW.era_id) != NEW.world_id
      THEN RAISE(ABORT, 'markers.era_id must belong to the same world')
    END;
END;

COMMIT;
`);

// --- WORLD DETAILS (for WorldDetailsPage) -----------------------------------
db.exec(`
PRAGMA foreign_keys = ON;

BEGIN;

-- =========================================================
-- world_details (1:1 with worlds) - UPDATED FOR NEW OUTLINE
-- =========================================================
CREATE TABLE IF NOT EXISTS world_details (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id                INTEGER NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,

  -- Basic info (Player-Facing)
  pitch                   TEXT NULL,           -- Short Pitch (≤200 chars)

  -- Astral bodies (Player summary; G.O.D details)
  suns_count              INTEGER NOT NULL DEFAULT 1 CHECK (suns_count BETWEEN 0 AND 5),

  -- Time & calendar (Player-Facing)
  day_hours               REAL    NULL CHECK (day_hours IS NULL OR (day_hours >= 1 AND day_hours <= 100)),
  year_days               INTEGER NULL CHECK (year_days IS NULL OR (year_days >= 30 AND year_days <= 1000)),
  leap_rule               TEXT NULL,

  -- Planet profile (Player summary; details collapsed)
  planet_type             TEXT NOT NULL DEFAULT 'Terrestrial'
                          CHECK (planet_type IN ('Terrestrial','Oceanic','Tidally Locked','Ringworld','Custom')),
  planet_type_note        TEXT NULL,           -- only used when planet_type = 'Custom'
  size_class              TEXT NULL,           -- free text like "Earth-like", "Radius ~6,400 km"
  gravity_vs_earth        REAL NULL CHECK (gravity_vs_earth IS NULL OR (gravity_vs_earth >= 0.1 AND gravity_vs_earth <= 5.0)),
  water_pct               INTEGER NULL CHECK (water_pct IS NULL OR (water_pct BETWEEN 0 AND 100)),
  tectonics               TEXT NOT NULL DEFAULT 'Medium'
                          CHECK (tectonics IN ('None','Low','Medium','High')),

  -- Magic model (Global Rules) - Player summary + G.O.D rules
  source_statement        TEXT NULL,           -- ≤240 in UI; DB allows longer
  corruption_level        TEXT NOT NULL DEFAULT 'Moderate'
                          CHECK (corruption_level IN ('None','Mild','Moderate','Severe','Custom')),
  corruption_note         TEXT NULL,           -- only used when corruption_level = 'Custom'
  magic_rarity            TEXT NOT NULL DEFAULT 'Uncommon'
                          CHECK (magic_rarity IN ('Commonplace','Uncommon','Rare','Legendary')),

  -- Technology window (Global Bounds) - Player-Facing
  tech_from               TEXT NOT NULL DEFAULT 'Iron'
                          CHECK (tech_from IN ('Stone','Bronze','Iron','Medieval','Renaissance','Industrial','Diesel','Atomic','Digital','Cyber','Interstellar')),
  tech_to                 TEXT NOT NULL DEFAULT 'Industrial'
                          CHECK (tech_to   IN ('Stone','Bronze','Iron','Medieval','Renaissance','Industrial','Diesel','Atomic','Digital','Cyber','Interstellar')),

  -- Cosmology & Realms - interaction rules
  realm_travel_allowed    INTEGER NOT NULL DEFAULT 1 CHECK (realm_travel_allowed IN (0,1)),
  realm_cycles            TEXT NULL,           -- description of cycles
  realm_costs             TEXT NULL,           -- description of costs

  -- Player-safe export toggle
  player_safe_summary_on  INTEGER NOT NULL DEFAULT 1 CHECK (player_safe_summary_on IN (0,1)),

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_world_details_world ON world_details(world_id);

CREATE TRIGGER IF NOT EXISTS trg_world_details_updated_at
AFTER UPDATE ON world_details
FOR EACH ROW
BEGIN
  UPDATE world_details
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
  WHERE id = NEW.id;
END;

-- =========================================================
-- Genre/Tone tags (free list)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_tags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value      TEXT NOT NULL,
  UNIQUE(world_id, value)
);
CREATE INDEX IF NOT EXISTS idx_world_tags_world ON world_tags(world_id);

-- =========================================================
-- Moons (ordered)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_moons (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,                   -- ≤40 in UI
  cycle_days   INTEGER NULL CHECK (cycle_days IS NULL OR (cycle_days BETWEEN 1 AND 999)),
  omen         TEXT NULL,                       -- ≤120 in UI
  order_index  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(world_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_world_moons_world ON world_moons(world_id);

-- =========================================================
-- Months (ordered)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_months (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,                   -- ≤30 in UI
  days         INTEGER NOT NULL CHECK (days BETWEEN 1 AND 60),
  order_index  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(world_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_world_months_world ON world_months(world_id);

-- =========================================================
-- Weekdays (ordered, UI constrains 2–14)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_weekdays (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value        TEXT NOT NULL,                   -- ≤20 in UI
  order_index  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(world_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_world_weekdays_world ON world_weekdays(world_id);

-- =========================================================
-- Climate bands (free list)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_climates (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value      TEXT NOT NULL,
  UNIQUE(world_id, value)
);
CREATE INDEX IF NOT EXISTS idx_world_climates_world ON world_climates(world_id);

-- =========================================================
-- Magic systems (built-ins) — the checkboxed ones
-- =========================================================
CREATE TABLE IF NOT EXISTS world_magic_systems (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  system     TEXT NOT NULL
             CHECK (system IN ('Spellcraft','Talisman-making','Faith-based miracles','Psionics','Bardic arts')),
  UNIQUE(world_id, system)
);
CREATE INDEX IF NOT EXISTS idx_world_magic_systems_world ON world_magic_systems(world_id);

-- Custom magic system names (when "Custom(+name)" checked)
CREATE TABLE IF NOT EXISTS world_magic_customs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_magic_customs_world ON world_magic_customs(world_id);

-- =========================================================
-- Unbreakable rules (ordered bullets)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_unbreakables (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value        TEXT NOT NULL,       -- ≤120 in UI
  order_index  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_world_unbreakables_world ON world_unbreakables(world_id);

-- =========================================================
-- Ban list (Does Not Exist)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_bans (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value      TEXT NOT NULL,
  UNIQUE(world_id, value)
);
CREATE INDEX IF NOT EXISTS idx_world_bans_world ON world_bans(world_id);

-- =========================================================
-- Tone flags (checkboxed) - UPDATED
-- =========================================================
CREATE TABLE IF NOT EXISTS world_tone_flags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  flag       TEXT NOT NULL CHECK (flag IN ('Heroic','Grim','Pulp','Mythic','Weird','Cosmic')),
  UNIQUE(world_id, flag)
);
CREATE INDEX IF NOT EXISTS idx_world_tone_flags_world ON world_tone_flags(world_id);

-- =========================================================
-- Realms (ordered rows with short fields)
-- =========================================================
CREATE TABLE IF NOT EXISTS world_realms (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,         -- ≤40 in UI
  type         TEXT NULL,             -- ≤40 in UI
  traits       TEXT NULL,             -- ≤80 in UI
  travel       TEXT NULL,             -- ≤80 in UI
  bleed        TEXT NULL,             -- ≤80 in UI
  order_index  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_world_realms_world ON world_realms(world_id);

-- =========================================================
-- Master catalog picks
-- =========================================================

-- Chosen races (from races table)
CREATE TABLE IF NOT EXISTS world_race_catalog (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  race_id    INTEGER NOT NULL REFERENCES races(id)  ON DELETE CASCADE,
  UNIQUE(world_id, race_id)
);
CREATE INDEX IF NOT EXISTS idx_world_race_catalog_world ON world_race_catalog(world_id);
CREATE INDEX IF NOT EXISTS idx_world_race_catalog_race  ON world_race_catalog(race_id);

-- Chosen creatures (from creatures table)
CREATE TABLE IF NOT EXISTS world_creature_catalog (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  creature_id  INTEGER NOT NULL REFERENCES creatures(id) ON DELETE CASCADE,
  UNIQUE(world_id, creature_id)
);
CREATE INDEX IF NOT EXISTS idx_world_creature_catalog_world ON world_creature_catalog(world_id);
CREATE INDEX IF NOT EXISTS idx_world_creature_catalog_creature ON world_creature_catalog(creature_id);

-- Languages, Deities, Factions (free lists)
CREATE TABLE IF NOT EXISTS world_languages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value      TEXT NOT NULL,
  UNIQUE(world_id, value)
);
CREATE INDEX IF NOT EXISTS idx_world_languages_world ON world_languages(world_id);

CREATE TABLE IF NOT EXISTS world_deities (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value      TEXT NOT NULL,
  UNIQUE(world_id, value)
);
CREATE INDEX IF NOT EXISTS idx_world_deities_world ON world_deities(world_id);

CREATE TABLE IF NOT EXISTS world_factions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value      TEXT NOT NULL,
  UNIQUE(world_id, value)
);
CREATE INDEX IF NOT EXISTS idx_world_factions_world ON world_factions(world_id);

-- =========================================================
-- NEW TABLES FOR EXTENDED WORLD OUTLINE
-- =========================================================

-- Geography Foundation
CREATE TABLE IF NOT EXISTS world_continents (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_continents_world ON world_continents(world_id);

CREATE TABLE IF NOT EXISTS world_geographical_features (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,       -- mountain range, sea, river, etc.
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_geo_features_world ON world_geographical_features(world_id);

CREATE TABLE IF NOT EXISTS world_climate_zones (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_climate_zones_world ON world_climate_zones(world_id);

CREATE TABLE IF NOT EXISTS world_natural_resources (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  rarity     TEXT NULL,
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_resources_world ON world_natural_resources(world_id);

-- Magic Model Extensions
CREATE TABLE IF NOT EXISTS world_magical_materials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NULL,           -- component, focus, rare metal
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_magic_materials_world ON world_magical_materials(world_id);

CREATE TABLE IF NOT EXISTS world_planar_connections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  realm_name TEXT NOT NULL,
  accessible INTEGER NOT NULL DEFAULT 1 CHECK (accessible IN (0,1)),
  notes      TEXT NULL,
  UNIQUE(world_id, realm_name)
);
CREATE INDEX IF NOT EXISTS idx_world_planar_world ON world_planar_connections(world_id);

-- Tone & Canon
CREATE TABLE IF NOT EXISTS world_unchanging_truths (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  value        TEXT NOT NULL,       -- ≤120 in UI
  order_index  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_world_truths_world ON world_unchanging_truths(world_id);

-- Master Catalogs - New Organizations
CREATE TABLE IF NOT EXISTS world_organizations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NULL,           -- Merchant Guild, Spy Network, etc.
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_orgs_world ON world_organizations(world_id);

CREATE TABLE IF NOT EXISTS world_noble_houses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_houses_world ON world_noble_houses(world_id);

CREATE TABLE IF NOT EXISTS world_trade_goods (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  base_value INTEGER NULL,       -- in credits
  rarity     TEXT NULL,
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_trade_world ON world_trade_goods(world_id);

CREATE TABLE IF NOT EXISTS world_natural_disasters (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id   INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NULL,           -- earthquake, storm, etc.
  description TEXT NULL,
  UNIQUE(world_id, name)
);
CREATE INDEX IF NOT EXISTS idx_world_disasters_world ON world_natural_disasters(world_id);

-- World Timeline (Vertebrae) - High-level eras
CREATE TABLE IF NOT EXISTS world_timeline_vertebrae (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT NULL,
  start_year   INTEGER NULL,
  end_year     INTEGER NULL,
  is_pivot     INTEGER NOT NULL DEFAULT 0 CHECK (is_pivot IN (0,1)),
  order_index  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_world_timeline_world ON world_timeline_vertebrae(world_id);

-- =========================================================
-- EXTENDED FORM DATA - NEW TABLES FOR ALL FORM COMPONENTS
-- =========================================================

-- Geography Foundation - Extended
CREATE TABLE IF NOT EXISTS world_geography_regions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NULL,           -- Kingdom, Province, Territory, etc.
  population   INTEGER NULL,
  governance   TEXT NULL,          -- Democracy, Monarchy, etc.
  description  TEXT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_geography_biomes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  climate      TEXT NULL,
  flora        TEXT NULL,
  fauna        TEXT NULL,
  description  TEXT NULL,
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_geography_landmarks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NULL,           -- Natural, Artificial, Mystical, etc.
  significance TEXT NULL,
  location     TEXT NULL,
  description  TEXT NULL,
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_geography_trade_routes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  from_location TEXT NULL,
  to_location   TEXT NULL,
  goods         TEXT NULL,          -- JSON or comma-separated
  dangers       TEXT NULL,
  travel_time   TEXT NULL,
  description   TEXT NULL,
  UNIQUE(world_id, name)
);

-- Technology Window - Extended
CREATE TABLE IF NOT EXISTS world_technology_categories (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  level        TEXT NULL,          -- Stone Age, Industrial, etc.
  description  TEXT NULL,
  restrictions TEXT NULL,
  UNIQUE(world_id, category)
);

CREATE TABLE IF NOT EXISTS world_technology_innovations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT NULL,
  era          TEXT NULL,
  description  TEXT NULL,
  impact       TEXT NULL,
  requirements TEXT NULL,
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_technology_restrictions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  restriction  TEXT NOT NULL,
  reason       TEXT NULL,
  scope        TEXT NULL,          -- Global, Regional, Cultural
  exceptions   TEXT NULL,
  UNIQUE(world_id, restriction)
);

-- Tone & Canon - Extended
CREATE TABLE IF NOT EXISTS world_tone_content_warnings (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  warning      TEXT NOT NULL,
  severity     TEXT NULL,          -- Mild, Moderate, Severe
  description  TEXT NULL,
  UNIQUE(world_id, warning)
);

CREATE TABLE IF NOT EXISTS world_tone_narrative_styles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  style        TEXT NOT NULL,
  description  TEXT NULL,
  UNIQUE(world_id, style)
);

CREATE TABLE IF NOT EXISTS world_tone_thematic_elements (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  element      TEXT NOT NULL,
  prominence   TEXT NULL,          -- Primary, Secondary, Background
  description  TEXT NULL,
  UNIQUE(world_id, element)
);

CREATE TABLE IF NOT EXISTS world_tone_canonical_rules (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  rule         TEXT NOT NULL,
  type         TEXT NULL,          -- Character, Plot, Setting, etc.
  enforcement  TEXT NULL,          -- Strict, Flexible, Guideline
  exceptions   TEXT NULL,
  description  TEXT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0
);

-- Cosmology & Realms - Extended
CREATE TABLE IF NOT EXISTS world_cosmology_planes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id       INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  plane_type     TEXT NULL,       -- Material, Elemental, Divine, etc.
  description    TEXT NULL,
  inhabitants    TEXT NULL,
  access_method  TEXT NULL,
  dangers        TEXT NULL,
  alignment      TEXT NULL,
  order_index    INTEGER NOT NULL DEFAULT 0,
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_cosmology_dimensional_rules (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  rule         TEXT NOT NULL,
  scope        TEXT NULL,          -- Universal, Planar, Regional, etc.
  effects      TEXT NULL,
  exceptions   TEXT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS world_cosmology_deities (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  domain       TEXT NULL,
  alignment    TEXT NULL,
  power_level  TEXT NULL,          -- Greater, Intermediate, Lesser, etc.
  description  TEXT NULL,
  followers    TEXT NULL,
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_cosmology_afterlife_realms (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  criteria     TEXT NULL,          -- Who goes here
  description  TEXT NULL,
  duration     TEXT NULL,          -- Eternal, Temporary, etc.
  order_index  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(world_id, name)
);

-- Master Catalogs - Extended
CREATE TABLE IF NOT EXISTS world_catalog_language_families (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id       INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT NULL,
  languages      TEXT NULL,        -- JSON array or comma-separated
  writing_system TEXT NULL,
  speakers       TEXT NULL,
  status         TEXT NULL,        -- Thriving, Declining, Dead, etc.
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_catalog_currency_systems (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id       INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  currency_type  TEXT NULL,        -- Metal Coins, Paper, Barter, etc.
  denominations  TEXT NULL,        -- JSON array or comma-separated
  exchange_rates TEXT NULL,
  regions        TEXT NULL,        -- JSON array or comma-separated
  backing        TEXT NULL,        -- Gold standard, government, etc.
  notes          TEXT NULL,
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_catalog_organizations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  org_type     TEXT NULL,          -- Guild, Religious Order, Military, etc.
  scope        TEXT NULL,          -- Local, Regional, Global, etc.
  alignment    TEXT NULL,
  goals        TEXT NULL,
  structure    TEXT NULL,
  membership   TEXT NULL,
  resources    TEXT NULL,
  reputation   TEXT NULL,
  rivals       TEXT NULL,          -- JSON array or comma-separated
  allies       TEXT NULL,          -- JSON array or comma-separated
  UNIQUE(world_id, name)
);

CREATE TABLE IF NOT EXISTS world_catalog_common_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT NULL,
  rarity       TEXT NULL,
  value        TEXT NULL,
  description  TEXT NULL,
  availability TEXT NULL,
  regions      TEXT NULL,          -- JSON array or comma-separated
  uses         TEXT NULL,          -- JSON array or comma-separated
  UNIQUE(world_id, name)
);

-- Meta configuration tables for custom categories
CREATE TABLE IF NOT EXISTS world_catalog_organization_types (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  type_name    TEXT NOT NULL,
  UNIQUE(world_id, type_name)
);

CREATE TABLE IF NOT EXISTS world_catalog_item_categories (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  UNIQUE(world_id, category_name)
);

CREATE TABLE IF NOT EXISTS world_catalog_rarity_levels (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id     INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  rarity_name  TEXT NOT NULL,
  UNIQUE(world_id, rarity_name)
);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_world_geography_regions_world ON world_geography_regions(world_id);
CREATE INDEX IF NOT EXISTS idx_world_geography_biomes_world ON world_geography_biomes(world_id);
CREATE INDEX IF NOT EXISTS idx_world_geography_landmarks_world ON world_geography_landmarks(world_id);
CREATE INDEX IF NOT EXISTS idx_world_geography_trade_routes_world ON world_geography_trade_routes(world_id);
CREATE INDEX IF NOT EXISTS idx_world_technology_categories_world ON world_technology_categories(world_id);
CREATE INDEX IF NOT EXISTS idx_world_technology_innovations_world ON world_technology_innovations(world_id);
CREATE INDEX IF NOT EXISTS idx_world_technology_restrictions_world ON world_technology_restrictions(world_id);
CREATE INDEX IF NOT EXISTS idx_world_tone_warnings_world ON world_tone_content_warnings(world_id);
CREATE INDEX IF NOT EXISTS idx_world_tone_styles_world ON world_tone_narrative_styles(world_id);
CREATE INDEX IF NOT EXISTS idx_world_tone_elements_world ON world_tone_thematic_elements(world_id);
CREATE INDEX IF NOT EXISTS idx_world_tone_rules_world ON world_tone_canonical_rules(world_id);
CREATE INDEX IF NOT EXISTS idx_world_cosmology_planes_world ON world_cosmology_planes(world_id);
CREATE INDEX IF NOT EXISTS idx_world_cosmology_rules_world ON world_cosmology_dimensional_rules(world_id);
CREATE INDEX IF NOT EXISTS idx_world_cosmology_deities_world ON world_cosmology_deities(world_id);
CREATE INDEX IF NOT EXISTS idx_world_cosmology_afterlife_world ON world_cosmology_afterlife_realms(world_id);
CREATE INDEX IF NOT EXISTS idx_world_catalog_languages_world ON world_catalog_language_families(world_id);
CREATE INDEX IF NOT EXISTS idx_world_catalog_currencies_world ON world_catalog_currency_systems(world_id);
CREATE INDEX IF NOT EXISTS idx_world_catalog_orgs_world ON world_catalog_organizations(world_id);
CREATE INDEX IF NOT EXISTS idx_world_catalog_items_world ON world_catalog_common_items(world_id);
CREATE INDEX IF NOT EXISTS idx_world_catalog_org_types_world ON world_catalog_organization_types(world_id);
CREATE INDEX IF NOT EXISTS idx_world_catalog_item_cats_world ON world_catalog_item_categories(world_id);
CREATE INDEX IF NOT EXISTS idx_world_catalog_rarities_world ON world_catalog_rarity_levels(world_id);

COMMIT;
`);
