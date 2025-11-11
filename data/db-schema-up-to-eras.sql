-- Modern DB schema for ST project (up to eras, no settings)
-- Designed from actual program needs, not legacy tables
-- SQLite compatible, ready for better-sqlite3

-- USERS
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  pass_hash     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free','admin','worldbuilder','developer','privileged')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE TRIGGER trg_users_updated_at AFTER UPDATE ON users FOR EACH ROW BEGIN UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLDS
CREATE TABLE worlds (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL UNIQUE,
  description      TEXT,
  created_by_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_worlds_name ON worlds(name);
CREATE TRIGGER trg_worlds_updated_at AFTER UPDATE ON worlds FOR EACH ROW BEGIN UPDATE worlds SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLD DETAILS: Basic Info & Tags
CREATE TABLE world_basic_info (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,
  tags_json        TEXT NOT NULL DEFAULT '[]',
  style_guardrails_json TEXT NOT NULL DEFAULT '[]',
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_world_basic_info_world ON world_basic_info(world_id);
CREATE TRIGGER trg_world_basic_info_updated AFTER UPDATE ON world_basic_info FOR EACH ROW BEGIN UPDATE world_basic_info SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLD DETAILS: Calendar System
CREATE TABLE world_calendars (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id          INTEGER NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,
  day_hours         INTEGER NOT NULL DEFAULT 24,
  year_days         INTEGER NOT NULL DEFAULT 365,
  months_json       TEXT NOT NULL DEFAULT '[]',
  weekdays_json     TEXT NOT NULL DEFAULT '[]',
  season_bands_json TEXT NOT NULL DEFAULT '[]',
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_world_calendars_world ON world_calendars(world_id);
CREATE TRIGGER trg_world_calendars_updated AFTER UPDATE ON world_calendars FOR EACH ROW BEGIN UPDATE world_calendars SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLD DETAILS: Realms (Material, Shadow, Feywild, etc.)
CREATE TABLE world_realms (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  realm_id         TEXT NOT NULL,
  realm_name       TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (world_id, realm_id)
);
CREATE INDEX idx_world_realms_world ON world_realms(world_id);
CREATE INDEX idx_world_realms_world_order ON world_realms(world_id, order_index);

-- WORLD DETAILS: Continents (CASCADE SOURCE for Geography)
CREATE TABLE world_continents (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  character        TEXT NOT NULL DEFAULT '',
  order_index      INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  UNIQUE (world_id, name)
);
CREATE INDEX idx_world_continents_world ON world_continents(world_id);
CREATE INDEX idx_world_continents_world_order ON world_continents(world_id, order_index);
CREATE TRIGGER trg_world_continents_updated AFTER UPDATE ON world_continents FOR EACH ROW BEGIN UPDATE world_continents SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- CONTINENT GEOGRAPHY: Mountains
CREATE TABLE continent_mountains (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_mountains_continent ON continent_mountains(continent_id);

-- CONTINENT GEOGRAPHY: Rivers
CREATE TABLE continent_rivers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_rivers_continent ON continent_rivers(continent_id);

-- CONTINENT GEOGRAPHY: Lakes
CREATE TABLE continent_lakes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_lakes_continent ON continent_lakes(continent_id);

-- CONTINENT GEOGRAPHY: Coasts
CREATE TABLE continent_coasts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_coasts_continent ON continent_coasts(continent_id);

-- CONTINENT GEOGRAPHY: Resources
CREATE TABLE continent_resources (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_resources_continent ON continent_resources(continent_id);

-- CONTINENT GEOGRAPHY: Hazards
CREATE TABLE continent_hazards (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_hazards_continent ON continent_hazards(continent_id);

-- CONTINENT GEOGRAPHY: Trade Paths
CREATE TABLE continent_trade_paths (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_trade_paths_continent ON continent_trade_paths(continent_id);

-- CONTINENT GEOGRAPHY: Biomes
CREATE TABLE continent_biomes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  continent_id     INTEGER NOT NULL REFERENCES world_continents(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (continent_id, name)
);
CREATE INDEX idx_continent_biomes_continent ON continent_biomes(continent_id);

-- WORLD DETAILS: Astral Bodies (Suns)
CREATE TABLE world_astral_suns (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  color            TEXT,
  behavior         TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_astral_suns_world ON world_astral_suns(world_id);

-- WORLD DETAILS: Astral Bodies (Moons)
CREATE TABLE world_astral_moons (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  cycle_days       TEXT,
  effects          TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_astral_moons_world ON world_astral_moons(world_id);

-- WORLD DETAILS: Astral Bodies (Constellations)
CREATE TABLE world_astral_constellations (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  season           TEXT,
  myth             TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_astral_constellations_world ON world_astral_constellations(world_id);

-- WORLD DETAILS: Cosmic Events
CREATE TABLE world_cosmic_events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  frequency        TEXT,
  notes            TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_cosmic_events_world ON world_cosmic_events(world_id);

-- WORLD DETAILS: Technology Window
CREATE TABLE world_technology (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id                INTEGER NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,
  overall_level           TEXT,
  min_level               TEXT,
  max_level               TEXT,
  pacing_note             TEXT,
  disallowed_anachronisms TEXT,
  encouraged_wildcards    TEXT,
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_world_technology_world ON world_technology(world_id);
CREATE TRIGGER trg_world_technology_updated AFTER UPDATE ON world_technology FOR EACH ROW BEGIN UPDATE world_technology SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLD DETAILS: Tone & Canon
CREATE TABLE world_tone_canon (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id             INTEGER NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,
  overall_tone         TEXT,
  violence_level       TEXT,
  moral_complexity     TEXT,
  humor_level          TEXT,
  canon_strictness     TEXT,
  style_guardrails_json TEXT NOT NULL DEFAULT '[]',
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_world_tone_canon_world ON world_tone_canon(world_id);
CREATE TRIGGER trg_world_tone_canon_updated AFTER UPDATE ON world_tone_canon FOR EACH ROW BEGIN UPDATE world_tone_canon SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLD DETAILS: Magic Model

CREATE TABLE world_magic_model (
  id                         INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id                   INTEGER NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,
  source_statement           TEXT,
  corruption_level           TEXT DEFAULT 'Moderate',
  corruption_note            TEXT,
  magic_rarity               TEXT DEFAULT 'Uncommon',
  corruption_recovery_rate   TEXT,
  corruption_tables          TEXT,
  updated_at                 TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_world_magic_model_world ON world_magic_model(world_id);
CREATE TRIGGER trg_world_magic_model_updated AFTER UPDATE ON world_magic_model FOR EACH ROW BEGIN UPDATE world_magic_model SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLD DETAILS: Magic Systems
CREATE TABLE world_magic_systems (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  system_name      TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_magic_systems_world ON world_magic_systems(world_id);

-- WORLD DETAILS: Magic Customs
CREATE TABLE world_magic_customs (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  custom_text      TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_magic_customs_world ON world_magic_customs(world_id);

-- WORLD DETAILS: Unbreakable Magic Rules
CREATE TABLE world_magic_rules (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  rule_text        TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_magic_rules_world ON world_magic_rules(world_id);

-- WORLD DETAILS: Corruption Thresholds
CREATE TABLE world_corruption_thresholds (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  threshold_text   TEXT NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_world_corruption_thresholds_world ON world_corruption_thresholds(world_id);

-- WORLD DETAILS: Currency Anchor
CREATE TABLE world_currency_anchor (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id                INTEGER NOT NULL UNIQUE REFERENCES worlds(id) ON DELETE CASCADE,
  base_denomination_name  TEXT NOT NULL,
  base_unit_value         REAL NOT NULL DEFAULT 1.0,
  notes                   TEXT,
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_world_currency_anchor_world ON world_currency_anchor(world_id);
CREATE TRIGGER trg_world_currency_anchor_updated AFTER UPDATE ON world_currency_anchor FOR EACH ROW BEGIN UPDATE world_currency_anchor SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WORLD CATALOGS: Races available in this world
CREATE TABLE world_races (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  race_id          INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (world_id, race_id)
);
CREATE INDEX idx_world_races_world ON world_races(world_id);
CREATE INDEX idx_world_races_race ON world_races(race_id);

-- WORLD CATALOGS: Creatures available in this world
CREATE TABLE world_creatures (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  creature_id      INTEGER NOT NULL REFERENCES creatures(id) ON DELETE CASCADE,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (world_id, creature_id)
);
CREATE INDEX idx_world_creatures_world ON world_creatures(world_id);
CREATE INDEX idx_world_creatures_creature ON world_creatures(creature_id);

-- ============================================================================
-- ERAS
-- ============================================================================

-- ERAS
CREATE TABLE eras (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  start_year       INTEGER,
  end_year         INTEGER,
  color            TEXT DEFAULT '#8b5cf6',
  order_index      INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_eras_world ON eras(world_id);
CREATE INDEX idx_eras_world_order ON eras(world_id, order_index);
CREATE TRIGGER trg_eras_updated_at AFTER UPDATE ON eras FOR EACH ROW BEGIN UPDATE eras SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ERA DETAILS: Basic Info & Dates
CREATE TABLE era_basic_info (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id           INTEGER NOT NULL UNIQUE REFERENCES eras(id) ON DELETE CASCADE,
  short_summary    TEXT,
  ongoing          INTEGER NOT NULL DEFAULT 0,
  start_date_year  TEXT,
  start_date_month TEXT,
  start_date_day   TEXT,
  end_date_year    TEXT,
  end_date_month   TEXT,
  end_date_day     TEXT,
  transition_in    TEXT,
  transition_out   TEXT,
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_era_basic_info_era ON era_basic_info(era_id);
CREATE TRIGGER trg_era_basic_info_updated AFTER UPDATE ON era_basic_info FOR EACH ROW BEGIN UPDATE era_basic_info SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ERA DETAILS: Backdrop Defaults (inherited by Settings)
CREATE TABLE era_backdrop_defaults (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id                  INTEGER NOT NULL UNIQUE REFERENCES eras(id) ON DELETE CASCADE,
  active_realms_json      TEXT NOT NULL DEFAULT '[]',
  typical_tech_level      TEXT NOT NULL DEFAULT 'Medieval',
  magic_tide              TEXT NOT NULL DEFAULT 'Medium' CHECK (magic_tide IN ('Low','Medium','High','Extreme')),
  stability_conflict      TEXT NOT NULL DEFAULT 'Stable' CHECK (stability_conflict IN ('Stable','Tense','War','Collapse')),
  travel_safety           TEXT NOT NULL DEFAULT 'Moderate',
  economy                 TEXT NOT NULL DEFAULT 'Stable' CHECK (economy IN ('Depression','Recession','Stable','Boom')),
  law_order               TEXT NOT NULL DEFAULT 'Moderate',
  religious_temperature   TEXT NOT NULL DEFAULT 'Moderate',
  rules_style_nudges_json TEXT NOT NULL DEFAULT '{}',
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_era_backdrop_defaults_era ON era_backdrop_defaults(era_id);
CREATE TRIGGER trg_era_backdrop_defaults_updated AFTER UPDATE ON era_backdrop_defaults FOR EACH ROW BEGIN UPDATE era_backdrop_defaults SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ERA DETAILS: Governments (CASCADE SOURCE - assigned to Continents)
CREATE TABLE era_governments (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id           INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  continent_id     INTEGER REFERENCES world_continents(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'Monarchy',
  one_line_note    TEXT,
  territory_tags   TEXT,
  current_ruler    TEXT,
  stability        TEXT,
  military         TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  UNIQUE (era_id, name)
);
CREATE INDEX idx_era_governments_era ON era_governments(era_id);
CREATE INDEX idx_era_governments_continent ON era_governments(continent_id);
CREATE INDEX idx_era_governments_era_order ON era_governments(era_id, order_index);
CREATE TRIGGER trg_era_governments_updated AFTER UPDATE ON era_governments FOR EACH ROW BEGIN UPDATE era_governments SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ERA DETAILS: Regions/Kingdoms (belong to Governments, CASCADE TARGET for Settings)
CREATE TABLE era_regions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  government_id    INTEGER NOT NULL REFERENCES era_governments(id) ON DELETE CASCADE,
  parent_id        INTEGER REFERENCES era_regions(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  kind             TEXT NOT NULL DEFAULT 'Region' CHECK (kind IN ('Region','Kingdom','City-State','Territory')),
  order_index      INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  UNIQUE (government_id, name)
);
CREATE INDEX idx_era_regions_government ON era_regions(government_id);
CREATE INDEX idx_era_regions_parent ON era_regions(parent_id);
CREATE INDEX idx_era_regions_government_order ON era_regions(government_id, order_index);
CREATE TRIGGER trg_era_regions_updated AFTER UPDATE ON era_regions FOR EACH ROW BEGIN UPDATE era_regions SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ERA CATALOGS: Races (status in this Era)
CREATE TABLE era_races (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id           INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  race_name        TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'Present' CHECK (status IN ('Dominant','Present','Uncommon','Rare','Extinct','Hidden')),
  notes            TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (era_id, race_name)
);
CREATE INDEX idx_era_races_era ON era_races(era_id);

-- ERA CATALOGS: Creatures (status in this Era)
CREATE TABLE era_creatures (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id           INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  creature_name    TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'Present' CHECK (status IN ('Common','Present','Uncommon','Rare','Extinct','Legendary')),
  threat_level     TEXT,
  range_shift      TEXT,
  notes            TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (era_id, creature_name)
);
CREATE INDEX idx_era_creatures_era ON era_creatures(era_id);

-- ERA CATALOGS: Deities (influence in this Era)
CREATE TABLE era_deities (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id           INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  deity_name       TEXT NOT NULL,
  influence        TEXT NOT NULL DEFAULT 'Medium' CHECK (influence IN ('High','Medium','Low','Forgotten')),
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (era_id, deity_name)
);
CREATE INDEX idx_era_deities_era ON era_deities(era_id);

-- ERA CATALOGS: Factions (active in this Era)
CREATE TABLE era_factions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id           INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  faction_name     TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'Political',
  scope            TEXT NOT NULL DEFAULT 'Regional' CHECK (scope IN ('Local','Regional','National','Continental','Global')),
  posture          TEXT NOT NULL DEFAULT 'Neutral' CHECK (posture IN ('Growing','Stable','Declining','Aggressive','Defensive','Neutral')),
  one_line_aim     TEXT NOT NULL DEFAULT '',
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (era_id, faction_name)
);
CREATE INDEX idx_era_factions_era ON era_factions(era_id);
CREATE INDEX idx_era_factions_scope ON era_factions(scope);

-- ERA CATALOGS: Languages (active in this Era)
CREATE TABLE era_languages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id           INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  language_id      TEXT NOT NULL,
  language_name    TEXT NOT NULL,
  active           INTEGER NOT NULL DEFAULT 1,
  order_index      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (era_id, language_id)
);
CREATE INDEX idx_era_languages_era ON era_languages(era_id);

-- ERA DETAILS: Trade & Economics
CREATE TABLE era_trade_economics (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id               INTEGER NOT NULL UNIQUE REFERENCES eras(id) ON DELETE CASCADE,
  trade_routes         TEXT,
  major_trade_goods    TEXT,
  crises_boom          TEXT,
  embargos_sanctions   TEXT,
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_era_trade_economics_era ON era_trade_economics(era_id);
CREATE TRIGGER trg_era_trade_economics_updated AFTER UPDATE ON era_trade_economics FOR EACH ROW BEGIN UPDATE era_trade_economics SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ERA EVENTS: Catalyst Events (major world-shaping events)
CREATE TABLE era_catalyst_events (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  era_id                 INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  type                   TEXT NOT NULL DEFAULT 'War' CHECK (type IN ('War','Disaster','Magical','Political','Discovery','Cultural','Economic','Technological')),
  date_or_span           TEXT,
  player_visible         INTEGER NOT NULL DEFAULT 1,
  short_summary          TEXT,
  full_god_notes         TEXT,
  impacts                TEXT,
  mechanical_tags        TEXT,
  ripple_effects         TEXT,
  anniversaries          TEXT,
  related_catalysts_json TEXT,
  settlement_reactions_json TEXT,
  attachments_json       TEXT,
  order_index            INTEGER NOT NULL DEFAULT 0,
  created_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  UNIQUE (era_id, title)
);
CREATE INDEX idx_era_catalyst_events_era ON era_catalyst_events(era_id);
CREATE INDEX idx_era_catalyst_events_type ON era_catalyst_events(type);
CREATE INDEX idx_era_catalyst_events_visible ON era_catalyst_events(player_visible);
CREATE TRIGGER trg_era_catalyst_events_updated AFTER UPDATE ON era_catalyst_events FOR EACH ROW BEGIN UPDATE era_catalyst_events SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ERA CURRENCY: Region currency denominations
CREATE TABLE era_region_currency_denominations (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id               INTEGER NOT NULL REFERENCES era_regions(id) ON DELETE CASCADE,
  denomination_name       TEXT NOT NULL,
  value_in_world_anchor   REAL NOT NULL DEFAULT 1.0,
  order_index             INTEGER NOT NULL DEFAULT 0,
  UNIQUE (region_id, denomination_name)
);
CREATE INDEX idx_era_region_currency_region ON era_region_currency_denominations(region_id);
CREATE INDEX idx_era_region_currency_order ON era_region_currency_denominations(region_id, order_index);

-- MARKERS (timeline events)
CREATE TABLE markers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id         INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  era_id           INTEGER REFERENCES eras(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  year             INTEGER,
  type             TEXT CHECK (type IN ('political','military','magical','natural','cultural','economic')),
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_markers_world ON markers(world_id);
CREATE INDEX idx_markers_era ON markers(era_id);
CREATE INDEX idx_markers_year ON markers(year);
CREATE INDEX idx_markers_type ON markers(type);
CREATE TRIGGER trg_markers_updated_at AFTER UPDATE ON markers FOR EACH ROW BEGIN UPDATE markers SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SKILLS
CREATE TABLE skills (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  name                 TEXT NOT NULL UNIQUE,
  type                 TEXT NOT NULL CHECK (type IN ('standard','magic','sphere','discipline','resonance','spell','psionic skill','reverberation','special ability')),
  tier                 INTEGER CHECK (tier IN (1,2,3)),
  primary_attribute    TEXT NOT NULL CHECK (primary_attribute IN ('STR','DEX','CON','INT','WIS','CHA','NA')),
  secondary_attribute  TEXT NOT NULL CHECK (secondary_attribute IN ('STR','DEX','CON','INT','WIS','CHA','NA')),
  parent_id            INTEGER REFERENCES skills(id) ON DELETE SET NULL,
  parent2_id           INTEGER REFERENCES skills(id) ON DELETE SET NULL,
  parent3_id           INTEGER REFERENCES skills(id) ON DELETE SET NULL,
  definition           TEXT NOT NULL DEFAULT '',
  created_by_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_type ON skills(type);
CREATE INDEX idx_skills_tier ON skills(tier);
CREATE INDEX idx_skills_primary_attr ON skills(primary_attribute);
CREATE INDEX idx_skills_created_by ON skills(created_by_id);
CREATE INDEX idx_skills_parents ON skills(parent_id);
CREATE TRIGGER trg_skills_updated_at AFTER UPDATE ON skills FOR EACH ROW BEGIN UPDATE skills SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- MAGIC BUILDS (1:1 with skills)
CREATE TABLE magic_builds (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id             INTEGER NOT NULL UNIQUE REFERENCES skills(id) ON DELETE CASCADE,
  tradition            TEXT NOT NULL CHECK (tradition IN ('spellcraft','psionics','bardic')),
  tier2_path           TEXT,
  containers_json      TEXT NOT NULL DEFAULT '[]',
  modifiers_json       TEXT NOT NULL DEFAULT '{}',
  mana_cost            INTEGER NOT NULL DEFAULT 0,
  casting_time         INTEGER NOT NULL DEFAULT 0,
  mastery_level        TEXT NOT NULL DEFAULT 'Apprentice',
  range_text           TEXT,
  shape_text           TEXT,
  duration_text        TEXT,
  effects_text         TEXT,
  container_breakdown  TEXT,
  addons_text          TEXT,
  modifiers_text       TEXT,
  notes                TEXT,
  flavor_line          TEXT,
  progressive_conditions TEXT,
  saved_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_magic_builds_skill_id ON magic_builds(skill_id);
CREATE INDEX idx_magic_builds_saved_at ON magic_builds(saved_at);

-- SPECIAL ABILITY SCALING (1:1 with skills)
CREATE TABLE special_ability_scaling (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id         INTEGER NOT NULL UNIQUE REFERENCES skills(id) ON DELETE CASCADE,
  ability_type     TEXT NOT NULL CHECK (ability_type IN ('Utility','Combat','Magic/Psionic','Other')),
  scaling_method   TEXT NOT NULL CHECK (scaling_method IN ('Point-Based','Point & Roll-Based','Skill % Based','Point Multiplier Based','Other')),
  scaling_details  TEXT NOT NULL,
  prerequisites    TEXT,
  saved_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);

-- SPECIAL ABILITY REQUIREMENTS (1:1 with skills)
CREATE TABLE special_ability_requirements (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id         INTEGER NOT NULL UNIQUE REFERENCES skills(id) ON DELETE CASCADE,
  stage1_tag       TEXT,
  stage1_desc      TEXT,
  stage1_points    TEXT,
  stage2_tag       TEXT,
  stage2_desc      TEXT,
  stage2_points    TEXT,
  stage3_tag       TEXT,
  stage3_desc      TEXT,
  stage4_tag       TEXT,
  stage4_desc      TEXT,
  final_tag        TEXT,
  final_desc       TEXT,
  add1_tag         TEXT,
  add1_desc        TEXT,
  add2_tag         TEXT,
  add2_desc        TEXT,
  add3_tag         TEXT,
  add3_desc        TEXT,
  add4_tag         TEXT,
  add4_desc        TEXT,
  saved_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);

-- ITEMS
CREATE TABLE items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL UNIQUE,
  category         TEXT,
  subtype          TEXT,
  cost_credits     INTEGER,
  weight           REAL,
  mechanical_effect TEXT,
  narrative_notes  TEXT,
  timeline_tag     TEXT,
  genre_tags       TEXT,
  created_by_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_by ON items(created_by_id);
CREATE TRIGGER trg_items_updated_at AFTER UPDATE ON items FOR EACH ROW BEGIN UPDATE items SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- WEAPONS
CREATE TABLE weapons (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL UNIQUE,
  category         TEXT,
  handedness       TEXT,
  dtype            TEXT,
  range_type       TEXT,
  range_text       TEXT,
  damage           INTEGER,
  effect           TEXT,
  cost_credits     INTEGER,
  weight           REAL,
  genre_tags       TEXT,
  narrative_notes  TEXT,
  timeline_tag     TEXT,
  created_by_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_weapons_name ON weapons(name);
CREATE INDEX idx_weapons_category ON weapons(category);
CREATE INDEX idx_weapons_handed ON weapons(handedness);
CREATE INDEX idx_weapons_dtype ON weapons(dtype);
CREATE INDEX idx_weapons_created_by ON weapons(created_by_id);
CREATE TRIGGER trg_weapons_updated_at AFTER UPDATE ON weapons FOR EACH ROW BEGIN UPDATE weapons SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- ARMORS
CREATE TABLE armors (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL UNIQUE,
  category              TEXT,
  area_covered          TEXT,
  soak                  INTEGER,
  encumbrance_penalty   INTEGER,
  atype                 TEXT,
  cost_credits          INTEGER,
  weight                REAL,
  effect                TEXT,
  genre_tags            TEXT,
  narrative_notes       TEXT,
  timeline_tag          TEXT,
  created_by_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_armors_name ON armors(name);
CREATE INDEX idx_armors_category ON armors(category);
CREATE INDEX idx_armors_atype ON armors(atype);
CREATE INDEX idx_armors_created_by ON armors(created_by_id);
CREATE TRIGGER trg_armors_updated_at AFTER UPDATE ON armors FOR EACH ROW BEGIN UPDATE armors SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- CREATURES
CREATE TABLE creatures (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  name                        TEXT NOT NULL UNIQUE,
  type                        TEXT,
  role                        TEXT,
  size                        TEXT,
  description_short           TEXT,
  alt_names                   TEXT,
  challenge_rating            TEXT,
  encounter_scale             TEXT,
  genre_tags                  TEXT,
  strength                    INTEGER,
  dexterity                   INTEGER,
  constitution                INTEGER,
  intelligence                INTEGER,
  wisdom                      INTEGER,
  charisma                    INTEGER,
  hp_total                    INTEGER,
  hp_by_location              TEXT,
  initiative                  INTEGER,
  armor_soak                  TEXT,
  attack_modes                TEXT,
  damage                      TEXT,
  range_text                  TEXT,
  special_abilities           TEXT,
  magic_resonance_interaction TEXT,
  behavior_tactics            TEXT,
  habitat                     TEXT,
  diet                        TEXT,
  variants                    TEXT,
  loot_harvest                TEXT,
  story_hooks                 TEXT,
  notes                       TEXT,
  created_by_id               TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at                  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at                  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_creatures_name ON creatures(name);
CREATE INDEX idx_creatures_type ON creatures(type);
CREATE INDEX idx_creatures_role ON creatures(role);
CREATE INDEX idx_creatures_size ON creatures(size);
CREATE INDEX idx_creatures_created_by ON creatures(created_by_id);
CREATE TRIGGER trg_creatures_updated_at AFTER UPDATE ON creatures FOR EACH ROW BEGIN UPDATE creatures SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- RACES
CREATE TABLE races (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL UNIQUE,
  created_by_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_races_name ON races(name);
CREATE INDEX idx_races_created_by ON races(created_by_id);
CREATE TRIGGER trg_races_updated_at AFTER UPDATE ON races FOR EACH ROW BEGIN UPDATE races SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

CREATE TABLE racial_definitions (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id                     INTEGER NOT NULL UNIQUE REFERENCES races(id) ON DELETE CASCADE,
  legacy_description          TEXT,
  physical_characteristics    TEXT,
  physical_description        TEXT,
  racial_quirk                TEXT,
  quirk_success_effect        TEXT,
  quirk_failure_effect        TEXT,
  common_languages_known      TEXT,
  common_archetypes           TEXT,
  examples_by_genre           TEXT,
  cultural_mindset            TEXT,
  outlook_on_magic            TEXT
);
CREATE INDEX idx_racial_definitions_race_id ON racial_definitions(race_id);

CREATE TABLE racial_attributes (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id              INTEGER NOT NULL UNIQUE REFERENCES races(id) ON DELETE CASCADE,
  age_range            TEXT,
  size                 TEXT,
  strength_max         INTEGER,
  dexterity_max        INTEGER,
  constitution_max     INTEGER,
  intelligence_max     INTEGER,
  wisdom_max           INTEGER,
  charisma_max         INTEGER,
  base_magic           INTEGER,
  base_movement        INTEGER
);
CREATE INDEX idx_racial_attributes_race_id ON racial_attributes(race_id);

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

-- ============================================================================
-- SETTINGS TABLES (Campaign/Adventure Level)
-- ============================================================================

-- SETTINGS: Main table
CREATE TABLE settings (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id            INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  era_id              INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
  region_id           INTEGER REFERENCES era_regions(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  summary             TEXT,
  created_by_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
  UNIQUE (era_id, name)
);
CREATE INDEX idx_settings_world ON settings(world_id);
CREATE INDEX idx_settings_era ON settings(era_id);
CREATE INDEX idx_settings_region ON settings(region_id);
CREATE INDEX idx_settings_created_by ON settings(created_by_id);
CREATE TRIGGER trg_settings_updated_at AFTER UPDATE ON settings FOR EACH ROW BEGIN UPDATE settings SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Front Matter
CREATE TABLE setting_front_matter (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id           INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  tone_words_json      TEXT NOT NULL DEFAULT '[]',
  tags_json            TEXT NOT NULL DEFAULT '[]',
  active_realms_json   TEXT NOT NULL DEFAULT '[]',
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_front_matter_setting ON setting_front_matter(setting_id);
CREATE TRIGGER trg_setting_front_matter_updated AFTER UPDATE ON setting_front_matter FOR EACH ROW BEGIN UPDATE setting_front_matter SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Time & Place
CREATE TABLE setting_time_place (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id             INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  local_start_year       TEXT,
  local_start_month      TEXT,
  local_start_day        TEXT,
  local_end_year         TEXT,
  local_end_month        TEXT,
  local_end_day          TEXT,
  calendar_quirks_json   TEXT NOT NULL DEFAULT '[]',
  updated_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_time_place_setting ON setting_time_place(setting_id);
CREATE TRIGGER trg_setting_time_place_updated AFTER UPDATE ON setting_time_place FOR EACH ROW BEGIN UPDATE setting_time_place SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Region Overview
CREATE TABLE setting_region_overview (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id           INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  senses_json          TEXT NOT NULL DEFAULT '[]',
  local_values_json    TEXT NOT NULL DEFAULT '{"pride":[],"shame":[]}',
  why_now              TEXT,
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_region_overview_setting ON setting_region_overview(setting_id);
CREATE TRIGGER trg_setting_region_overview_updated AFTER UPDATE ON setting_region_overview FOR EACH ROW BEGIN UPDATE setting_region_overview SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Geography & Environment
CREATE TABLE setting_geography (
  id                         INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id                 INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  travel_tactics_json        TEXT NOT NULL DEFAULT '[]',
  resources_hazards_json     TEXT NOT NULL DEFAULT '[]',
  signature_features_json    TEXT NOT NULL DEFAULT '[]',
  updated_at                 TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_geography_setting ON setting_geography(setting_id);
CREATE TRIGGER trg_setting_geography_updated AFTER UPDATE ON setting_geography FOR EACH ROW BEGIN UPDATE setting_geography SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Built Environment / Infrastructure
CREATE TABLE setting_infrastructure (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id           INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  settlements_json     TEXT NOT NULL DEFAULT '[]',
  movement_json        TEXT NOT NULL DEFAULT '{"routes":[],"bottleneck":""}',
  utilities_json       TEXT NOT NULL DEFAULT '{"waterControl":"","powerControl":"","manaControl":"","failureModes":[]}',
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_infrastructure_setting ON setting_infrastructure(setting_id);
CREATE TRIGGER trg_setting_infrastructure_updated AFTER UPDATE ON setting_infrastructure FOR EACH ROW BEGIN UPDATE setting_infrastructure SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Power & Factions
CREATE TABLE setting_factions (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id               INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  active_factions_json     TEXT NOT NULL DEFAULT '[]',
  relationship_map_json    TEXT NOT NULL DEFAULT '{}',
  monthly_sway_json        TEXT NOT NULL DEFAULT '{}',
  updated_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_factions_setting ON setting_factions(setting_id);
CREATE TRIGGER trg_setting_factions_updated AFTER UPDATE ON setting_factions FOR EACH ROW BEGIN UPDATE setting_factions SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Places of Interest
CREATE TABLE setting_places (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id        INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  sites_json        TEXT NOT NULL DEFAULT '[]',
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_places_setting ON setting_places(setting_id);
CREATE TRIGGER trg_setting_places_updated AFTER UPDATE ON setting_places FOR EACH ROW BEGIN UPDATE setting_places SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS MVS: Campaign Seeds
CREATE TABLE setting_campaign_seeds (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id        INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  seeds_json        TEXT NOT NULL DEFAULT '[]',
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_campaign_seeds_setting ON setting_campaign_seeds(setting_id);
CREATE TRIGGER trg_setting_campaign_seeds_updated AFTER UPDATE ON setting_campaign_seeds FOR EACH ROW BEGIN UPDATE setting_campaign_seeds SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS ADVANCED: Magic Profile
CREATE TABLE setting_magic_profile (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id             INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  systems_in_use_json    TEXT NOT NULL DEFAULT '[]',
  availability_notes     TEXT,
  local_taboos_json      TEXT NOT NULL DEFAULT '[]',
  corruption_pace        TEXT,
  cosmic_event_hooks_json TEXT NOT NULL DEFAULT '[]',
  updated_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_magic_profile_setting ON setting_magic_profile(setting_id);
CREATE TRIGGER trg_setting_magic_profile_updated AFTER UPDATE ON setting_magic_profile FOR EACH ROW BEGIN UPDATE setting_magic_profile SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS ADVANCED: Races & Beings (local overrides of Era catalog)
CREATE TABLE setting_races (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id             INTEGER NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  race_id                INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  local_status           TEXT CHECK (local_status IN ('Dominant','Present','Uncommon','Rare','Extinct','Hidden')),
  notes                  TEXT,
  UNIQUE (setting_id, race_id)
);
CREATE INDEX idx_setting_races_setting ON setting_races(setting_id);
CREATE INDEX idx_setting_races_race ON setting_races(race_id);

-- SETTINGS ADVANCED: Creatures (local overrides of Era catalog)
CREATE TABLE setting_creatures (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id             INTEGER NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  creature_id            INTEGER NOT NULL REFERENCES creatures(id) ON DELETE CASCADE,
  local_status           TEXT CHECK (local_status IN ('Common','Present','Uncommon','Rare','Extinct','Legendary')),
  local_danger_shift     INTEGER DEFAULT 0,
  regional_area          TEXT,
  notes                  TEXT,
  UNIQUE (setting_id, creature_id)
);
CREATE INDEX idx_setting_creatures_setting ON setting_creatures(setting_id);
CREATE INDEX idx_setting_creatures_creature ON setting_creatures(creature_id);

-- SETTINGS ADVANCED: Deities & Belief
CREATE TABLE setting_deities (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id             INTEGER NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  deity_name             TEXT NOT NULL,
  local_influence        TEXT CHECK (local_influence IN ('High','Medium','Low','Forgotten')),
  teachings_worship      TEXT,
  UNIQUE (setting_id, deity_name)
);
CREATE INDEX idx_setting_deities_setting ON setting_deities(setting_id);

-- SETTINGS ADVANCED: Relations & Law
CREATE TABLE setting_governance (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id                INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  who_decides               TEXT,
  how_reaches_streets       TEXT,
  enforcement_style         TEXT,
  courts_json               TEXT NOT NULL DEFAULT '[]',
  fair_example              TEXT,
  unfair_example            TEXT,
  consequences_table_json   TEXT NOT NULL DEFAULT '{}',
  updated_at                TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_governance_setting ON setting_governance(setting_id);
CREATE TRIGGER trg_setting_governance_updated AFTER UPDATE ON setting_governance FOR EACH ROW BEGIN UPDATE setting_governance SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- SETTINGS ADVANCED: Currency
CREATE TABLE setting_currency (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_id                  INTEGER NOT NULL UNIQUE REFERENCES settings(id) ON DELETE CASCADE,
  resolved_denominations_json TEXT NOT NULL DEFAULT '{}',
  barter_quirks               TEXT,
  currency_slang_json         TEXT NOT NULL DEFAULT '{}',
  updated_at                  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ'))
);
CREATE INDEX idx_setting_currency_setting ON setting_currency(setting_id);
CREATE TRIGGER trg_setting_currency_updated AFTER UPDATE ON setting_currency FOR EACH ROW BEGIN UPDATE setting_currency SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = NEW.id; END;

-- END OF SCHEMA
