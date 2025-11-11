# Database Schema Guide - Cascade System Support

## Overview

The database schema is designed to support the **three-tier cascade system**:
```
World (Continents) → Era (Governments/Regions) → Settings (Campaign)
```

All tables use SQLite with `better-sqlite3` and include:
- Proper foreign key constraints with CASCADE delete
- Timestamps (created_at, updated_at) with triggers
- Indexes for performance
- JSON columns for complex nested data

---

## Architecture Layers

### Layer 1: World (Foundation)
**Purpose**: Define the planet, its continents, geography, calendar, and realms.

**Core Tables**:
- `worlds` - Main world record
- `world_basic_info` - Tags and metadata
- `world_calendars` - Calendar system (months, days, seasons)
- `world_realms` - Realms (Material, Shadow, Feywild, etc.)
- `world_continents` - Continent definitions

**Geography Tables** (CASCADE SOURCE):
- `continent_mountains` - Mountain ranges per continent
- `continent_rivers` - Rivers per continent
- `continent_lakes` - Lakes per continent
- `continent_coasts` - Coastal features per continent
- `continent_resources` - Resources per continent
- `continent_hazards` - Hazards per continent
- `continent_trade_paths` - Trade routes per continent

**Key Relationships**:
```
worlds 1→N world_continents 1→N continent_mountains/rivers/lakes/etc.
```

---

### Layer 2: Era (Time Period)
**Purpose**: Define time periods within a World, with governments assigned to continents and subdivided into regions.

**Core Tables**:
- `eras` - Main era record
- `era_basic_info` - Start/end dates
- `era_backdrop_defaults` - Tech level, magic tide, economy, etc.

**Government Tables** (CASCADE BRIDGE):
- `era_governments` - Governments assigned to continents
- `era_regions` - Regions/Kingdoms within governments (CASCADE TARGET for Settings)

**Catalog Tables** (Available for Settings to adopt):
- `era_races` - Race status in this era
- `era_creatures` - Creature status in this era
- `era_deities` - Deity influence in this era
- `era_factions` - Active factions in this era

**Key Relationships**:
```
eras 1→N era_governments
     ↓                 ↓
     N→1              N→1
world_continents      era_regions
```

**Cascade Flow**:
```
Setting selects era_regions.id
  ↓
era_regions.government_id → era_governments
  ↓
era_governments.continent_id → world_continents
  ↓
world_continents.id → continent_mountains/rivers/lakes/etc.
```

---

### Layer 3: Settings (Campaign)
**Purpose**: Define individual campaigns/adventures with inherited data from World and Era.

**Core Table**:
- `settings` - Main setting record with foreign keys to world, era, and **region**

**MVS Tables** (Minimum Viable Setting - required for publish):
- `setting_front_matter` - Name, tone, tags, realms
- `setting_time_place` - Local date span, calendar quirks
- `setting_region_overview` - Senses, local values, "why now"
- `setting_geography` - Travel tactics, resources/hazards, signature features
- `setting_infrastructure` - Settlements, trade routes, utilities
- `setting_factions` - Active factions, relationships, sway
- `setting_places` - Places of interest
- `setting_campaign_seeds` - Story hooks

**Advanced Tables** (Optional, enhance detail):
- `setting_magic_profile` - Magic systems, taboos, corruption
- `setting_races` - Local race status overrides
- `setting_creatures` - Local creature status/danger overrides
- `setting_deities` - Local deity influence
- `setting_governance` - Laws, courts, consequences
- `setting_currency` - Denominations, barter, slang

**Key Relationships**:
```
settings.region_id → era_regions (CASCADE TRIGGER)
settings.era_id → eras (inheritance)
settings.world_id → worlds (inheritance)
```

---

## Cascade Resolution (How It Works)

### Step 1: Setting Selects Region
```sql
UPDATE settings 
SET region_id = 42 
WHERE id = 1;
```

### Step 2: Find Government & Continent
```sql
SELECT 
  g.continent_id,
  c.name as continent_name,
  c.character as continent_character
FROM settings s
JOIN era_regions r ON s.region_id = r.id
JOIN era_governments g ON r.government_id = g.id
JOIN world_continents c ON g.continent_id = c.id
WHERE s.id = 1;
```

### Step 3: Fetch All Continent Geography
```sql
-- Mountains
SELECT name FROM continent_mountains 
WHERE continent_id = (SELECT continent_id FROM ...) 
ORDER BY order_index;

-- Rivers
SELECT name FROM continent_rivers 
WHERE continent_id = (SELECT continent_id FROM ...) 
ORDER BY order_index;

-- Lakes, coasts, resources, hazards, trade paths (same pattern)
```

### Step 4: Application Uses Data
- Geography form shows all continent features
- User clicks to adopt into `setting_geography.signature_features_json`
- Infrastructure form shows continent trade paths
- User clicks to adopt into `setting_infrastructure.movement_json.routes`

---

## JSON Column Formats

### world_calendars.months_json
```json
[
  {"name": "Frostmarch", "days": 31},
  {"name": "Raincall", "days": 30},
  ...
]
```

### world_calendars.weekdays_json
```json
["Moonday", "Tideday", "Firesday", "Earthday", "Starday", "Sunrest"]
```

### world_calendars.season_bands_json
```json
[
  {"name": "Winter", "startDay": 1, "endDay": 90},
  {"name": "Spring", "startDay": 91, "endDay": 180},
  ...
]
```

### era_backdrop_defaults.active_realms_json
```json
["Material", "Shadow", "Feywild"]
```

### setting_geography.travel_tactics_json
```json
[
  "Thick forest canopy blocks flying; dense undergrowth forces single-file travel",
  "Tidal caves accessible only 6 hours per day",
  ...
]
```

### setting_geography.resources_hazards_json
```json
[
  {"resource": "Iron ore deposits", "hazard": "Unstable mine shafts"},
  {"resource": "Ancient oak forests", "hazard": "Territorial fey"},
  ...
]
```

### setting_geography.signature_features_json
```json
["Ironspine Mountains", "Lake Mirrowen", "Old Imperial Road"]
```

### setting_infrastructure.settlements_json
```json
[
  {"name": "Ironhaven", "type": "City", "population": "Large"},
  {"name": "Millbrook", "type": "Village", "population": "Small"},
  ...
]
```

### setting_infrastructure.movement_json
```json
{
  "routes": ["Old Imperial Road", "Silkway Caravan Route"],
  "bottleneck": "Single bridge over River Vey controls all north-south traffic"
}
```

### setting_factions.active_factions_json
```json
["Merchants Guild", "Steel Legion", "Shadow Covenant"]
```

### setting_factions.relationship_map_json
```json
{
  "Merchants Guild": {
    "Steel Legion": "Allied",
    "Shadow Covenant": "Opposed"
  },
  ...
}
```

---

## Data Migration Strategy

### Phase 1: World Setup
1. Create world record
2. Add basic info (tags)
3. Add calendar system
4. Add realms
5. Create continents
6. Populate continent geography (mountains, rivers, lakes, etc.)

### Phase 2: Era Setup
1. Create era record
2. Add basic info (dates)
3. Add backdrop defaults
4. Create governments and assign to continents
5. Add regions/kingdoms to governments
6. Populate era catalogs (races, creatures, deities, factions)

### Phase 3: Settings Creation
1. Create setting record (linked to world, era, and region)
2. Create MVS table records (front matter, time/place, geography, etc.)
3. User adopts from cascade:
   - Geography: Copy from continent_mountains, continent_rivers, etc.
   - Infrastructure: Copy from continent_trade_paths
   - Factions: Copy from era_factions
   - Races: Copy from era_races with local overrides
   - Creatures: Copy from era_creatures with local overrides

---

## Query Examples

### Get All Data for a Setting (with cascade)
```sql
-- Setting basic info
SELECT s.*, w.name as world_name, e.name as era_name, r.name as region_name
FROM settings s
JOIN worlds w ON s.world_id = w.id
JOIN eras e ON s.era_id = e.id
LEFT JOIN era_regions r ON s.region_id = r.id
WHERE s.id = ?;

-- Resolved continent
SELECT c.*
FROM settings s
JOIN era_regions r ON s.region_id = r.id
JOIN era_governments g ON r.government_id = g.id
JOIN world_continents c ON g.continent_id = c.id
WHERE s.id = ?;

-- Continent geography (all types)
SELECT 
  'mountain' as type, m.name
FROM continent_mountains m
WHERE m.continent_id = (/* subquery for continent_id */)
UNION ALL
SELECT 
  'river' as type, r.name
FROM continent_rivers r
WHERE r.continent_id = (/* subquery for continent_id */)
-- ... repeat for lakes, coasts, resources, hazards, trade_paths
ORDER BY type, name;

-- Era factions available for adoption
SELECT * FROM era_factions
WHERE era_id = (SELECT era_id FROM settings WHERE id = ?)
ORDER BY scope, order_index;

-- Era races available for adoption
SELECT r.*, er.status
FROM era_races er
JOIN races r ON er.race_id = r.id
WHERE er.era_id = (SELECT era_id FROM settings WHERE id = ?)
ORDER BY er.order_index;
```

### Insert Continent with All Geography
```sql
BEGIN TRANSACTION;

-- 1. Create continent
INSERT INTO world_continents (world_id, name, character, order_index)
VALUES (1, 'Aurelia', 'Verdant and temperate', 0);

-- Get the new continent_id
-- In better-sqlite3: const { lastInsertRowid } = db.prepare(...).run()
-- For example: lastInsertRowid = 5

-- 2. Add mountains
INSERT INTO continent_mountains (continent_id, name, order_index) VALUES
(5, 'Ironspine Mountains', 0),
(5, 'Frostpeak Range', 1),
(5, 'Skyreach Peaks', 2);

-- 3. Add rivers
INSERT INTO continent_rivers (continent_id, name, order_index) VALUES
(5, 'River Vey', 0),
(5, 'Serpent''s Run', 1),
(5, 'Goldstream', 2);

-- 4. Add lakes
INSERT INTO continent_lakes (continent_id, name, order_index) VALUES
(5, 'Lake Mirrowen', 0),
(5, 'Silvermere', 1),
(5, 'The Deepwell', 2);

-- 5-7. Add coasts, resources, hazards, trade_paths (same pattern)

COMMIT;
```

### Insert Government with Regions
```sql
BEGIN TRANSACTION;

-- 1. Create government
INSERT INTO era_governments (era_id, continent_id, name, type, order_index)
VALUES (3, 5, 'Valerian Empire', 'Constitutional Monarchy', 0);

-- Get government_id (e.g., 12)

-- 2. Add regions
INSERT INTO era_regions (government_id, name, kind, order_index) VALUES
(12, 'Northern Provinces', 'Region', 0),
(12, 'Coastal Territories', 'Region', 1),
(12, 'Ironhaven', 'City-State', 2);

COMMIT;
```

### Create Setting and Link to Region
```sql
BEGIN TRANSACTION;

-- 1. Create setting (cascade trigger happens here)
INSERT INTO settings (world_id, era_id, region_id, name, summary, created_by_id)
VALUES (1, 3, 42, 'The Iron Conspiracy', 'A tale of betrayal in the Northern Provinces', 'user123');

-- Get setting_id (e.g., 7)

-- 2. Create MVS records
INSERT INTO setting_front_matter (setting_id, tone_words_json, tags_json, active_realms_json)
VALUES (7, '["Tense","Political","Gritty"]', '["intrigue","betrayal","nobility"]', '["Material","Shadow"]');

INSERT INTO setting_time_place (setting_id, local_start_year, local_start_month, local_start_day)
VALUES (7, '318', 'Frostmarch', '15');

INSERT INTO setting_geography (setting_id, travel_tactics_json, resources_hazards_json, signature_features_json)
VALUES (7, '[]', '[]', '["Ironspine Mountains","Lake Mirrowen"]');

-- ... create other MVS and advanced records

COMMIT;
```

---

## Indexes & Performance

### Primary Indexes (Foreign Keys)
All foreign key columns are indexed automatically for:
- CASCADE delete operations
- JOIN performance
- Cascade resolution queries

### Additional Indexes
- `idx_worlds_name` - Fast world lookup by name
- `idx_eras_world_order` - Era timeline sorting
- `idx_era_governments_continent` - Cascade resolution
- `idx_era_regions_government` - Cascade resolution
- `idx_settings_region` - Cascade trigger
- `idx_continent_*_continent` - Geography lookup

### Query Optimization Tips
1. **Always join through foreign keys** (they're indexed)
2. **Use prepared statements** (better-sqlite3 is FAST with these)
3. **Batch inserts in transactions** (wrap in BEGIN/COMMIT)
4. **Fetch cascade data once** (cache in application layer)
5. **Use JSON for arrays** (avoid separate junction tables for simple lists)

---

## Validation Rules

### Check Constraints
- `era_backdrop_defaults.magic_tide` IN ('Low','Medium','High','Extreme')
- `era_backdrop_defaults.stability_conflict` IN ('Stable','Tense','War','Collapse')
- `era_backdrop_defaults.economy` IN ('Depression','Recession','Stable','Boom')
- `era_regions.kind` IN ('Region','Kingdom','City-State','Territory')
- `era_races.status` IN ('Dominant','Present','Uncommon','Rare','Extinct','Hidden')
- `era_creatures.status` IN ('Common','Present','Uncommon','Rare','Extinct','Legendary')
- `era_factions.scope` IN ('Local','Regional','National','Continental','Global')

### Unique Constraints
- `(world_id, name)` - Continent names unique per world
- `(era_id, name)` - Government names unique per era
- `(government_id, name)` - Region names unique per government
- `(era_id, race_id)` - Race appears once per era
- `(era_id, faction_name)` - Faction names unique per era
- `(setting_id, race_id)` - Race override once per setting

### Cascade Delete
- Delete world → deletes all eras, continents, settings
- Delete era → deletes all governments, regions, settings
- Delete continent → sets government.continent_id to NULL (preserves government)
- Delete government → deletes all regions
- Delete region → sets setting.region_id to NULL (preserves setting)

---

## Future Enhancements

### Possible Additions
1. **Continent Features** - Store character/description for mountains, rivers (not just names)
2. **Region Culture** - Add `era_region_culture` table for local values, traditions
3. **Faction Relationships** - Add `era_faction_relationships` table for pre-defined relationships
4. **Government Details** - Add government type details (ruler name, capital, etc.)
5. **Setting Snapshots** - Version history for settings (undo/redo)
6. **Sharing** - Add `shared_with` table for collaborative worldbuilding

### Performance Optimizations
1. **Materialized Views** - Pre-compute cascade data for fast reads
2. **Full-Text Search** - Add FTS5 tables for searching names/descriptions
3. **Archival** - Separate active/archived settings for cleaner queries

---

## Migration Path from Mock Data

### Current Mock Data Location
- `src/app/worldbuilder/settings/settingdetails/page.tsx`
- `src/app/worldbuilder/worlds/eradetails/page.tsx`

### Steps to Migrate
1. **Create seed data script** - Convert mock data to SQL INSERT statements
2. **Populate database** - Run seed script in test environment
3. **Update API routes** - Replace mock data with DB queries
4. **Test cascade** - Verify resolution works with real DB
5. **Deploy** - Roll out to production

See: `docs/MOCK_TO_DB_MIGRATION.md` (to be created)

---

## Related Documentation
- `CASCADE_SYSTEM_STATUS.md` - Cascade implementation progress
- `CASCADE_QUICK_REFERENCE.md` - Quick guide to cascade system
- `TESTING_CASCADE.md` - Test procedures for cascade
- `API_DESIGN.md` - (Future) API endpoints for DB access
