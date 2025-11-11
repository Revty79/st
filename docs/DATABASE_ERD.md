# Database ERD - Cascade System

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                            LAYER 1: WORLD                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   WORLDS     │
├──────────────┤
│ id (PK)      │────┐
│ name         │    │
│ description  │    │
│ created_by   │    │
└──────────────┘    │
                    │
        ┌───────────┴──────────┬────────────────┬──────────────┐
        │                      │                │              │
        ▼                      ▼                ▼              ▼
┌──────────────────┐   ┌──────────────┐  ┌─────────────┐  ┌────────────────┐
│ world_basic_info │   │world_calendars│  │world_realms │  │world_continents│
├──────────────────┤   ├──────────────┤  ├─────────────┤  ├────────────────┤
│ id (PK)          │   │ id (PK)      │  │ id (PK)     │  │ id (PK)        │
│ world_id (FK)    │   │ world_id(FK) │  │ world_id(FK)│  │ world_id (FK)  │
│ tags_json        │   │ day_hours    │  │ realm_id    │  │ name           │
└──────────────────┘   │ year_days    │  │ realm_name  │  │ character      │
                       │ months_json  │  │ order_index │  │ order_index    │
                       │ weekdays_json│  └─────────────┘  └────────────────┘
                       │ seasons_json │                            │
                       └──────────────┘                            │
                                                          ┌─────────┴─────────┐
                                          ┌───────────────┤ CONTINENT FEATURES │
                                          │               └───────────────────┘
                                          │
           ┌──────────────┬───────────────┼──────────────┬──────────────────┐
           │              │               │              │                  │
           ▼              ▼               ▼              ▼                  ▼
┌──────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────────────┐
│continent_mountains│ │continent_   │ │continent_   │ │continent_    │ │continent_      │
├──────────────────┤ │rivers       │ │lakes        │ │coasts        │ │resources       │
│ id (PK)          │ ├─────────────┤ ├─────────────┤ ├──────────────┤ ├────────────────┤
│ continent_id(FK) │ │ id (PK)     │ │ id (PK)     │ │ id (PK)      │ │ id (PK)        │
│ name             │ │continent_id │ │continent_id │ │continent_id  │ │continent_id(FK)│
│ order_index      │ │ name        │ │ name        │ │ name         │ │ name           │
└──────────────────┘ │ order_index │ │ order_index │ │ order_index  │ │ order_index    │
                     └─────────────┘ └─────────────┘ └──────────────┘ └────────────────┘
           ▼                                   ▼
┌──────────────────┐                  ┌────────────────────┐
│continent_hazards │                  │continent_trade_paths│
├──────────────────┤                  ├────────────────────┤
│ id (PK)          │                  │ id (PK)            │
│ continent_id(FK) │                  │ continent_id (FK)  │
│ name             │                  │ name               │
│ order_index      │                  │ order_index        │
└──────────────────┘                  └────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                            LAYER 2: ERA                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    ERAS      │
├──────────────┤
│ id (PK)      │────┐
│ world_id(FK) │    │
│ name         │    │
│ start_year   │    │
│ end_year     │    │
└──────────────┘    │
                    │
        ┌───────────┴──────────────┬─────────────────────┐
        │                          │                     │
        ▼                          ▼                     ▼
┌──────────────────┐      ┌─────────────────┐   ┌───────────────┐
│ era_basic_info   │      │era_backdrop_    │   │era_governments│
├──────────────────┤      │defaults         │   ├───────────────┤
│ id (PK)          │      ├─────────────────┤   │ id (PK)       │───┐
│ era_id (FK)      │      │ id (PK)         │   │ era_id (FK)   │   │
│ start_date_year  │      │ era_id (FK)     │   │ continent_id* │───┼─→ CASCADE LINK
│ start_date_month │      │ active_realms   │   │ name          │   │   to world_continents
│ start_date_day   │      │ tech_level      │   │ type          │   │
│ end_date_*       │      │ magic_tide      │   │ order_index   │   │
└──────────────────┘      │ stability       │   └───────────────┘   │
                          │ economy         │            │           │
                          └─────────────────┘            │           │
                                                         ▼           │
                                             ┌────────────────┐      │
                                             │  era_regions   │      │
                                             ├────────────────┤      │
                                             │ id (PK)        │◄─────┘
                                             │ government_id* │  CASCADE TARGET
                                             │ name           │  (Settings link here)
                                             │ kind           │
                                             │ order_index    │
                                             └────────────────┘


        ┌─────────────────┐
        │  ERA CATALOGS   │  (Available for Settings to adopt)
        └─────────────────┘
                │
    ┌───────────┼───────────┬──────────────┐
    │           │           │              │
    ▼           ▼           ▼              ▼
┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐
│era_races │ │era_      │ │era_deities│ │era_factions  │
├──────────┤ │creatures │ ├───────────┤ ├──────────────┤
│ id (PK)  │ ├──────────┤ │ id (PK)   │ │ id (PK)      │
│ era_id   │ │ id (PK)  │ │ era_id    │ │ era_id       │
│ race_id  │ │ era_id   │ │deity_name │ │ faction_name │
│ status   │ │creature  │ │ influence │ │ type         │
│order_idx │ │ status   │ │order_index│ │ scope        │
└──────────┘ │danger_sft│ └───────────┘ │ posture      │
             │order_idx │               │ one_line_aim │
             └──────────┘               │ order_index  │
                                        └──────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                          LAYER 3: SETTINGS                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  SETTINGS    │
├──────────────┤
│ id (PK)      │────┐
│ world_id(FK) │    │
│ era_id (FK)  │    │
│ region_id*   │────┼─→ CASCADE TRIGGER (links to era_regions)
│ name         │    │   Traces: region → government → continent
│ summary      │    │
└──────────────┘    │
                    │
        ┌───────────┴────────────────────────────────────┐
        │                                                │
        │               MVS TABLES                       │
        │        (Minimum Viable Setting)                │
        │                                                │
        ├────────────────────┬───────────────────────────┤
        │                    │                           │
        ▼                    ▼                           ▼
┌──────────────────┐  ┌─────────────────┐   ┌───────────────────┐
│setting_front_    │  │setting_time_    │   │setting_region_    │
│matter            │  │place            │   │overview           │
├──────────────────┤  ├─────────────────┤   ├───────────────────┤
│ id (PK)          │  │ id (PK)         │   │ id (PK)           │
│ setting_id (FK)  │  │ setting_id (FK) │   │ setting_id (FK)   │
│ tone_words_json  │  │ local_start_*   │   │ senses_json       │
│ tags_json        │  │ local_end_*     │   │ local_values_json │
│ active_realms    │  │ calendar_quirks │   │ why_now           │
└──────────────────┘  └─────────────────┘   └───────────────────┘

        ▼                    ▼                           ▼
┌──────────────────┐  ┌─────────────────┐   ┌───────────────────┐
│setting_geography │  │setting_infra    │   │setting_factions   │
├──────────────────┤  │structure        │   ├───────────────────┤
│ id (PK)          │  ├─────────────────┤   │ id (PK)           │
│ setting_id (FK)  │  │ id (PK)         │   │ setting_id (FK)   │
│ travel_tactics** │  │ setting_id (FK) │   │ active_factions** │
│ resources_       │  │ settlements_json│   │ relationship_map  │
│   hazards**      │  │ movement_json   │   │ monthly_sway_json │
│ signature_       │  │ utilities_json  │   └───────────────────┘
│   features**     │  └─────────────────┘
└──────────────────┘                          ** = CASCADE ADOPTION

        ▼                    ▼
┌──────────────────┐  ┌─────────────────┐
│setting_places    │  │setting_campaign │
├──────────────────┤  │_seeds           │
│ id (PK)          │  ├─────────────────┤
│ setting_id (FK)  │  │ id (PK)         │
│ sites_json       │  │ setting_id (FK) │
└──────────────────┘  │ seeds_json      │
                      └─────────────────┘


        ┌────────────────────────┐
        │   ADVANCED TABLES      │
        │    (Optional Detail)   │
        └────────────────────────┘
                │
    ┌───────────┼──────────┬───────────┐
    │           │          │           │
    ▼           ▼          ▼           ▼
┌────────────┐ ┌─────────┐ ┌────────┐ ┌────────────┐
│setting_    │ │setting_ │ │setting_│ │setting_    │
│magic_      │ │races    │ │crea    │ │deities     │
│profile     │ ├─────────┤ │tures   │ ├────────────┤
├────────────┤ │id (PK)  │ ├────────┤ │id (PK)     │
│id (PK)     │ │setting  │ │id (PK) │ │setting_id  │
│setting_id  │ │race_id**│ │setting │ │deity_name**│
│systems_json│ │local_   │ │creature│ │local_      │
│avail_notes │ │ status  │ │ id**   │ │influence   │
│taboos_json │ │ notes   │ │local_  │ │teachings_  │
│corruption  │ └─────────┘ │ status │ │worship     │
│cosmic_evts │             │local_  │ └────────────┘
└────────────┘             │danger  │
        ▼                  │regional│      ▼
┌────────────┐             │ area   │  ┌──────────────┐
│setting_    │             │ notes  │  │setting_      │
│governance  │             └────────┘  │currency      │
├────────────┤                         ├──────────────┤
│id (PK)     │     ** = ADOPTS FROM    │id (PK)       │
│setting_id  │     ERA CATALOGS        │setting_id    │
│who_decides │                         │resolved_     │
│enforcement │                         │ denoms_json  │
│courts_json │                         │barter_quirks │
│fair_ex     │                         │slang_json    │
│unfair_ex   │                         └──────────────┘
│conseq_tbl  │
└────────────┘


═══════════════════════════════════════════════════════════════════════════════

CASCADE DATA FLOW VISUALIZATION:

User Action: Setting selects region_id = 42
                        │
                        ▼
         ┌──────────────────────────────┐
         │  settings.region_id = 42     │
         └──────────────────────────────┘
                        │
                        ▼ JOIN
         ┌──────────────────────────────┐
         │  era_regions.id = 42         │
         │  government_id = 12          │
         └──────────────────────────────┘
                        │
                        ▼ JOIN
         ┌──────────────────────────────┐
         │  era_governments.id = 12     │
         │  continent_id = 5            │
         └──────────────────────────────┘
                        │
                        ▼ JOIN
         ┌──────────────────────────────┐
         │  world_continents.id = 5     │
         │  name = "Aurelia"            │
         └──────────────────────────────┘
                        │
                        ▼ FETCH ALL
         ┌──────────────────────────────┐
         │  continent_mountains         │
         │  continent_rivers            │
         │  continent_lakes             │
         │  continent_coasts            │
         │  continent_resources         │
         │  continent_hazards           │
         │  continent_trade_paths       │
         └──────────────────────────────┘
                        │
                        ▼ DISPLAY IN UI
         ┌──────────────────────────────┐
         │  GeographyAndClimateForm     │
         │  - Context Panel             │
         │  - Quick-Adopt Resources     │
         │  - Quick-Adopt Hazards       │
         │  - Signature Features        │
         └──────────────────────────────┘
                        │
                        ▼ USER CLICKS "Adopt"
         ┌──────────────────────────────┐
         │  setting_geography           │
         │  signature_features_json =   │
         │  ["Ironspine Mtns", ...]     │
         └──────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

KEY RELATIONSHIPS:

1. World → Era → Settings (Basic Hierarchy)
   worlds.id ←─── eras.world_id ←─── settings.world_id
                  eras.id ←─────────── settings.era_id

2. Continent → Government → Region → Setting (CASCADE CHAIN)
   world_continents.id ←─── era_governments.continent_id
                            era_governments.id ←─── era_regions.government_id
                                                    era_regions.id ←─── settings.region_id

3. Continent → Features (GEOGRAPHY SOURCE)
   world_continents.id ←─── continent_mountains.continent_id
                       ←─── continent_rivers.continent_id
                       ←─── continent_lakes.continent_id
                       ←─── ... (all other geography tables)

4. Era → Catalogs (ADOPTION SOURCE)
   eras.id ←─── era_races.era_id
           ←─── era_creatures.era_id
           ←─── era_deities.era_id
           ←─── era_factions.era_id

5. Setting → MVS/Advanced (DATA STORAGE)
   settings.id ←─── setting_front_matter.setting_id
               ←─── setting_geography.setting_id
               ←─── setting_races.setting_id
               ←─── ... (all other setting tables)

═══════════════════════════════════════════════════════════════════════════════
