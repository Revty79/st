import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getSessionUser } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (data: any, init?: number | ResponseInit) => NextResponse.json(data, init as any);

type WorldDetailsRow = {
  id: number;
  world_id: number;
  pitch: string | null;
  suns_count: number;
  day_hours: number | null;
  year_days: number | null;
  leap_rule: string | null;
  planet_type: string;
  planet_type_note: string | null;
  size_class: string | null;
  gravity_vs_earth: number | null;
  water_pct: number | null;
  tectonics: string;
  source_statement: string | null;
  corruption_level: string;
  corruption_note: string | null;
  magic_rarity: string;
  tech_from: string;
  tech_to: string;
  realm_travel_allowed: number;
  realm_cycles: string | null;
  realm_costs: string | null;
  player_safe_summary_on: number;
  created_at: string;
  updated_at: string;
};

function required<T>(val: T, name: string) {
  if (val === undefined || val === null || (typeof val === "string" && val.trim() === ""))
    throw new Error(`${name} is required`);
  return val;
}

function toIntOrNull(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toFloatOrNull(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getWorldDetailsWithCollections(worldId: number) {
  // Get main world_details record
  let details = db.prepare(`
    SELECT * FROM world_details WHERE world_id = ?
  `).get(worldId) as WorldDetailsRow | undefined;

  // Create default if doesn't exist
  if (!details) {
    db.prepare(`
      INSERT INTO world_details (world_id) VALUES (?)
    `).run(worldId);
    details = db.prepare(`
      SELECT * FROM world_details WHERE world_id = ?
    `).get(worldId) as WorldDetailsRow;
  }

  // Get all collections
  const tags = db.prepare("SELECT value FROM world_tags WHERE world_id = ?").all(worldId) as Array<{value: string}>;
  const moons = db.prepare("SELECT * FROM world_moons WHERE world_id = ? ORDER BY order_index").all(worldId);
  const months = db.prepare("SELECT * FROM world_months WHERE world_id = ? ORDER BY order_index").all(worldId);
  const weekdays = db.prepare("SELECT value FROM world_weekdays WHERE world_id = ? ORDER BY order_index").all(worldId) as Array<{value: string}>;
  const climates = db.prepare("SELECT value FROM world_climates WHERE world_id = ?").all(worldId) as Array<{value: string}>;
  const magicSystems = db.prepare("SELECT system FROM world_magic_systems WHERE world_id = ?").all(worldId) as Array<{system: string}>;
  const magicCustoms = db.prepare("SELECT name FROM world_magic_customs WHERE world_id = ?").all(worldId) as Array<{name: string}>;
  const unbreakables = db.prepare("SELECT value FROM world_unbreakables WHERE world_id = ? ORDER BY order_index").all(worldId) as Array<{value: string}>;
  const bans = db.prepare("SELECT value FROM world_bans WHERE world_id = ?").all(worldId) as Array<{value: string}>;
  const toneFlags = db.prepare("SELECT flag FROM world_tone_flags WHERE world_id = ?").all(worldId) as Array<{flag: string}>;
  const realms = db.prepare("SELECT * FROM world_realms WHERE world_id = ? ORDER BY order_index").all(worldId);
  
  // Geography Foundation - Extended
  const continents = db.prepare("SELECT * FROM world_continents WHERE world_id = ?").all(worldId);
  const geographicalFeatures = db.prepare("SELECT * FROM world_geographical_features WHERE world_id = ?").all(worldId);
  const climateZones = db.prepare("SELECT * FROM world_climate_zones WHERE world_id = ?").all(worldId);
  const naturalResources = db.prepare("SELECT * FROM world_natural_resources WHERE world_id = ?").all(worldId);
  const geographyRegions = db.prepare("SELECT * FROM world_geography_regions WHERE world_id = ? ORDER BY order_index").all(worldId);
  const geographyBiomes = db.prepare("SELECT * FROM world_geography_biomes WHERE world_id = ?").all(worldId);
  const geographyLandmarks = db.prepare("SELECT * FROM world_geography_landmarks WHERE world_id = ?").all(worldId);
  const geographyTradeRoutes = db.prepare("SELECT * FROM world_geography_trade_routes WHERE world_id = ?").all(worldId);
  
  // Technology Window - Extended
  const technologyCategories = db.prepare("SELECT * FROM world_technology_categories WHERE world_id = ?").all(worldId);
  const technologyInnovations = db.prepare("SELECT * FROM world_technology_innovations WHERE world_id = ?").all(worldId);
  const technologyRestrictions = db.prepare("SELECT * FROM world_technology_restrictions WHERE world_id = ?").all(worldId);
  
  // Magic extensions
  const magicalMaterials = db.prepare("SELECT * FROM world_magical_materials WHERE world_id = ?").all(worldId);
  const planarConnections = db.prepare("SELECT * FROM world_planar_connections WHERE world_id = ?").all(worldId);
  
  // Tone & Canon - Extended
  const unchangingTruths = db.prepare("SELECT value FROM world_unchanging_truths WHERE world_id = ? ORDER BY order_index").all(worldId) as Array<{value: string}>;
  const toneContentWarnings = db.prepare("SELECT * FROM world_tone_content_warnings WHERE world_id = ?").all(worldId);
  const toneNarrativeStyles = db.prepare("SELECT * FROM world_tone_narrative_styles WHERE world_id = ?").all(worldId);
  const toneThematicElements = db.prepare("SELECT * FROM world_tone_thematic_elements WHERE world_id = ?").all(worldId);
  const toneCanonicalRules = db.prepare("SELECT * FROM world_tone_canonical_rules WHERE world_id = ? ORDER BY order_index").all(worldId);
  
  // Cosmology & Realms - Extended
  const cosmologyPlanes = db.prepare("SELECT * FROM world_cosmology_planes WHERE world_id = ? ORDER BY order_index").all(worldId);
  const cosmologyDimensionalRules = db.prepare("SELECT * FROM world_cosmology_dimensional_rules WHERE world_id = ? ORDER BY order_index").all(worldId);
  const cosmologyDeities = db.prepare("SELECT * FROM world_cosmology_deities WHERE world_id = ?").all(worldId);
  const cosmologyAfterlifeRealms = db.prepare("SELECT * FROM world_cosmology_afterlife_realms WHERE world_id = ? ORDER BY order_index").all(worldId);
  
  // Master Catalogs - Core
  const raceIds = db.prepare("SELECT race_id FROM world_race_catalog WHERE world_id = ?").all(worldId) as Array<{race_id: number}>;
  const races = raceIds.length > 0 ? db.prepare(`
    SELECT * FROM races WHERE id IN (${raceIds.map(() => '?').join(',')})
  `).all(...raceIds.map(r => r.race_id)) : [];

  const creatureIds = db.prepare("SELECT creature_id FROM world_creature_catalog WHERE world_id = ?").all(worldId) as Array<{creature_id: number}>;
  const creatures = creatureIds.length > 0 ? db.prepare(`
    SELECT * FROM creatures WHERE id IN (${creatureIds.map(() => '?').join(',')})
  `).all(...creatureIds.map(c => c.creature_id)) : [];

  const languages = db.prepare("SELECT value FROM world_languages WHERE world_id = ?").all(worldId) as Array<{value: string}>;
  const deities = db.prepare("SELECT value FROM world_deities WHERE world_id = ?").all(worldId) as Array<{value: string}>;
  const factions = db.prepare("SELECT value FROM world_factions WHERE world_id = ?").all(worldId) as Array<{value: string}>;
  
  // Master Catalogs - Extended
  const catalogLanguageFamilies = db.prepare("SELECT * FROM world_catalog_language_families WHERE world_id = ?").all(worldId);
  const catalogCurrencySystems = db.prepare("SELECT * FROM world_catalog_currency_systems WHERE world_id = ?").all(worldId);
  const catalogOrganizations = db.prepare("SELECT * FROM world_catalog_organizations WHERE world_id = ?").all(worldId);
  const catalogCommonItems = db.prepare("SELECT * FROM world_catalog_common_items WHERE world_id = ?").all(worldId);
  const catalogOrganizationTypes = db.prepare("SELECT type_name FROM world_catalog_organization_types WHERE world_id = ?").all(worldId) as Array<{type_name: string}>;
  const catalogItemCategories = db.prepare("SELECT category_name FROM world_catalog_item_categories WHERE world_id = ?").all(worldId) as Array<{category_name: string}>;
  const catalogRarityLevels = db.prepare("SELECT rarity_name FROM world_catalog_rarity_levels WHERE world_id = ?").all(worldId) as Array<{rarity_name: string}>;
  
  // Legacy catalogs
  const organizations = db.prepare("SELECT * FROM world_organizations WHERE world_id = ?").all(worldId);
  const nobleHouses = db.prepare("SELECT * FROM world_noble_houses WHERE world_id = ?").all(worldId);
  const tradeGoods = db.prepare("SELECT * FROM world_trade_goods WHERE world_id = ?").all(worldId);
  const naturalDisasters = db.prepare("SELECT * FROM world_natural_disasters WHERE world_id = ?").all(worldId);
  
  // Timeline
  const timelineVertebrae = db.prepare("SELECT * FROM world_timeline_vertebrae WHERE world_id = ? ORDER BY order_index").all(worldId);

  return {
    ...details,
    tags: tags.map(t => t.value),
    moons,
    months,
    weekdays: weekdays.map(w => w.value),
    climates: climates.map(c => c.value),
    magicSystems: magicSystems.map(m => m.system),
    magicCustoms: magicCustoms.map(m => m.name),
    unbreakables: unbreakables.map(u => u.value),
    bans: bans.map(b => b.value),
    toneFlags: toneFlags.map(t => t.flag),
    realms,
    // Geography Foundation
    continents,
    geographicalFeatures,
    climateZones,
    naturalResources,
    geographyRegions,
    geographyBiomes,
    geographyLandmarks,
    geographyTradeRoutes,
    // Technology Window
    technologyCategories,
    technologyInnovations,
    technologyRestrictions,
    // Magic extensions
    magicalMaterials,
    planarConnections,
    // Tone & Canon
    unchangingTruths: unchangingTruths.map(u => u.value),
    toneContentWarnings,
    toneNarrativeStyles,
    toneThematicElements,
    toneCanonicalRules,
    // Cosmology & Realms
    cosmologyPlanes,
    cosmologyDimensionalRules,
    cosmologyDeities,
    cosmologyAfterlifeRealms,
    // Master Catalogs - Core
    races,
    creatures,
    languages: languages.map(l => l.value),
    deities: deities.map(d => d.value),
    factions: factions.map(f => f.value),
    // Master Catalogs - Extended
    catalogLanguageFamilies,
    catalogCurrencySystems,
    catalogOrganizations,
    catalogCommonItems,
    catalogOrganizationTypes: catalogOrganizationTypes.map(t => t.type_name),
    catalogItemCategories: catalogItemCategories.map(c => c.category_name),
    catalogRarityLevels: catalogRarityLevels.map(r => r.rarity_name),
    // Legacy catalogs
    organizations,
    nobleHouses,
    tradeGoods,
    naturalDisasters,
    timelineVertebrae
  };
}

// ---------- GET /api/world-details ----------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const worldId = searchParams.get("worldId");

    if (!worldId) {
      return json({ ok: false, error: "worldId is required" }, { status: 400 });
    }

    const data = getWorldDetailsWithCollections(Number(worldId));
    return json({ ok: true, data });
  } catch (err: any) {
    console.error("GET /api/world-details error:", err);
    return json({ ok: false, error: "Failed to fetch world details." }, { status: 500 });
  }
}

// ---------- POST /api/world-details ----------
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const op = String(body?.op ?? "").trim();
    const worldId = Number(required(body.worldId, "worldId"));

    if (!op) return json({ ok: false, error: "Missing op" }, { status: 400 });

    // Basic world details update
    if (op === "updateBasicInfo") {
      const updates: any = {};
      if (body.pitch !== undefined) updates.pitch = body.pitch;
      if (body.sunsCount !== undefined) updates.suns_count = Number(body.sunsCount);
      if (body.dayHours !== undefined) updates.day_hours = toFloatOrNull(body.dayHours);
      if (body.yearDays !== undefined) updates.year_days = toIntOrNull(body.yearDays);
      if (body.leapRule !== undefined) updates.leap_rule = body.leapRule;
      if (body.planetType !== undefined) updates.planet_type = body.planetType;
      if (body.planetTypeNote !== undefined) updates.planet_type_note = body.planetTypeNote;
      if (body.sizeClass !== undefined) updates.size_class = body.sizeClass;
      if (body.gravityVsEarth !== undefined) updates.gravity_vs_earth = toFloatOrNull(body.gravityVsEarth);
      if (body.waterPct !== undefined) updates.water_pct = toIntOrNull(body.waterPct);
      if (body.tectonics !== undefined) updates.tectonics = body.tectonics;
      if (body.sourceStatement !== undefined) updates.source_statement = body.sourceStatement;
      if (body.corruptionLevel !== undefined) updates.corruption_level = body.corruptionLevel;
      if (body.corruptionNote !== undefined) updates.corruption_note = body.corruptionNote;
      if (body.magicRarity !== undefined) updates.magic_rarity = body.magicRarity;
      if (body.techFrom !== undefined) updates.tech_from = body.techFrom;
      if (body.techTo !== undefined) updates.tech_to = body.techTo;
      if (body.realmTravelAllowed !== undefined) updates.realm_travel_allowed = body.realmTravelAllowed ? 1 : 0;
      if (body.realmCycles !== undefined) updates.realm_cycles = body.realmCycles;
      if (body.realmCosts !== undefined) updates.realm_costs = body.realmCosts;
      if (body.playerSafeSummaryOn !== undefined) updates.player_safe_summary_on = body.playerSafeSummaryOn ? 1 : 0;
      
      // Extended fields for new forms
      if (body.geographyNotes !== undefined) updates.geography_notes = body.geographyNotes;
      if (body.technologyNotes !== undefined) updates.technology_notes = body.technologyNotes;
      if (body.toneCanonNotes !== undefined) updates.tone_canon_notes = body.toneCanonNotes;
      if (body.cosmologyStructure !== undefined) updates.cosmology_structure = body.cosmologyStructure;
      if (body.cosmologyAfterlifeSystem !== undefined) updates.cosmology_afterlife_system = body.cosmologyAfterlifeSystem;
      if (body.cosmologyPlanarTravel !== undefined) updates.cosmology_planar_travel = body.cosmologyPlanarTravel;
      if (body.cosmologyCosmicThreats !== undefined) updates.cosmology_cosmic_threats = body.cosmologyCosmicThreats;
      if (body.cosmologyUniversalLaws !== undefined) updates.cosmology_universal_laws = body.cosmologyUniversalLaws;
      if (body.cosmologyNotes !== undefined) updates.cosmology_notes = body.cosmologyNotes;
      if (body.catalogNotes !== undefined) updates.catalog_notes = body.catalogNotes;

      if (Object.keys(updates).length > 0) {
        const sets = Object.keys(updates).map(k => `${k} = ?`);
        const values = Object.values(updates);
        
        db.prepare(`UPDATE world_details SET ${sets.join(", ")} WHERE world_id = ?`).run(...values, worldId);
      }

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // Tag management
    if (op === "updateTags") {
      const tags = Array.isArray(body.tags) ? body.tags : [];
      
      db.prepare("DELETE FROM world_tags WHERE world_id = ?").run(worldId);
      
      tags.forEach((tag: string) => {
        if (tag.trim()) {
          db.prepare("INSERT INTO world_tags (world_id, value) VALUES (?, ?)").run(worldId, tag.trim());
        }
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // Moon management
    if (op === "updateMoons") {
      const moons = Array.isArray(body.moons) ? body.moons : [];
      
      db.prepare("DELETE FROM world_moons WHERE world_id = ?").run(worldId);
      
      moons.forEach((moon: any, index: number) => {
        db.prepare(`
          INSERT INTO world_moons (world_id, name, cycle_days, omen, order_index) 
          VALUES (?, ?, ?, ?, ?)
        `).run(worldId, moon.name || "", toIntOrNull(moon.cycleDays), moon.omen || null, index);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // Geography Foundation operations
    if (op === "updateGeographyRegions") {
      const regions = Array.isArray(body.regions) ? body.regions : [];
      
      db.prepare("DELETE FROM world_geography_regions WHERE world_id = ?").run(worldId);
      
      regions.forEach((region: any, index: number) => {
        db.prepare(`
          INSERT INTO world_geography_regions (world_id, name, type, population, governance, description, order_index) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, region.name || "", region.type || null, toIntOrNull(region.population), 
               region.governance || null, region.description || null, index);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateGeographyBiomes") {
      const biomes = Array.isArray(body.biomes) ? body.biomes : [];
      
      db.prepare("DELETE FROM world_geography_biomes WHERE world_id = ?").run(worldId);
      
      biomes.forEach((biome: any) => {
        db.prepare(`
          INSERT INTO world_geography_biomes (world_id, name, climate, flora, fauna, description) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(worldId, biome.name || "", biome.climate || null, biome.flora || null, 
               biome.fauna || null, biome.description || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateGeographyLandmarks") {
      const landmarks = Array.isArray(body.landmarks) ? body.landmarks : [];
      
      db.prepare("DELETE FROM world_geography_landmarks WHERE world_id = ?").run(worldId);
      
      landmarks.forEach((landmark: any) => {
        db.prepare(`
          INSERT INTO world_geography_landmarks (world_id, name, type, significance, location, description) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(worldId, landmark.name || "", landmark.type || null, landmark.significance || null, 
               landmark.location || null, landmark.description || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateGeographyTradeRoutes") {
      const tradeRoutes = Array.isArray(body.tradeRoutes) ? body.tradeRoutes : [];
      
      db.prepare("DELETE FROM world_geography_trade_routes WHERE world_id = ?").run(worldId);
      
      tradeRoutes.forEach((route: any) => {
        const goods = Array.isArray(route.goods) ? JSON.stringify(route.goods) : null;
        db.prepare(`
          INSERT INTO world_geography_trade_routes (world_id, name, from_location, to_location, goods, dangers, travel_time, description) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, route.name || "", route.fromLocation || null, route.toLocation || null, 
               goods, route.dangers || null, route.travelTime || null, route.description || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // Technology Window operations
    if (op === "updateTechnologyCategories") {
      const categories = Array.isArray(body.categories) ? body.categories : [];
      
      db.prepare("DELETE FROM world_technology_categories WHERE world_id = ?").run(worldId);
      
      categories.forEach((category: any) => {
        db.prepare(`
          INSERT INTO world_technology_categories (world_id, category, level, description, restrictions) 
          VALUES (?, ?, ?, ?, ?)
        `).run(worldId, category.name || "", category.level || null, 
               category.description || null, category.restrictions || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateTechnologyInnovations") {
      const innovations = Array.isArray(body.innovations) ? body.innovations : [];
      
      db.prepare("DELETE FROM world_technology_innovations WHERE world_id = ?").run(worldId);
      
      innovations.forEach((innovation: any) => {
        db.prepare(`
          INSERT INTO world_technology_innovations (world_id, name, category, era, description, impact, requirements) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, innovation.name || "", innovation.category || null, innovation.era || null, 
               innovation.description || null, innovation.impact || null, innovation.requirements || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateTechnologyRestrictions") {
      const restrictions = Array.isArray(body.restrictions) ? body.restrictions : [];
      
      db.prepare("DELETE FROM world_technology_restrictions WHERE world_id = ?").run(worldId);
      
      restrictions.forEach((restriction: any) => {
        db.prepare(`
          INSERT INTO world_technology_restrictions (world_id, restriction, reason, scope, exceptions) 
          VALUES (?, ?, ?, ?, ?)
        `).run(worldId, restriction.restriction || "", restriction.reason || null, 
               restriction.scope || null, restriction.exceptions || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // More operations would follow the same pattern for other collections...
    // For now, let's implement the most essential ones
    
    // Tone & Canon operations
    if (op === "updateToneContentWarnings") {
      const warnings = Array.isArray(body.warnings) ? body.warnings : [];
      
      db.prepare("DELETE FROM world_tone_content_warnings WHERE world_id = ?").run(worldId);
      
      warnings.forEach((warning: any) => {
        db.prepare(`
          INSERT INTO world_tone_content_warnings (world_id, warning, severity, description) 
          VALUES (?, ?, ?, ?)
        `).run(worldId, warning.warning || "", warning.severity || null, warning.description || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateToneNarrativeStyles") {
      const styles = Array.isArray(body.styles) ? body.styles : [];
      
      db.prepare("DELETE FROM world_tone_narrative_styles WHERE world_id = ?").run(worldId);
      
      styles.forEach((style: any) => {
        db.prepare(`
          INSERT INTO world_tone_narrative_styles (world_id, style, description) 
          VALUES (?, ?, ?)
        `).run(worldId, style.style || "", style.description || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateToneThematicElements") {
      const elements = Array.isArray(body.elements) ? body.elements : [];
      
      db.prepare("DELETE FROM world_tone_thematic_elements WHERE world_id = ?").run(worldId);
      
      elements.forEach((element: any) => {
        db.prepare(`
          INSERT INTO world_tone_thematic_elements (world_id, element, prominence, description) 
          VALUES (?, ?, ?, ?)
        `).run(worldId, element.element || "", element.prominence || null, element.description || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateToneCanonicalRules") {
      const rules = Array.isArray(body.rules) ? body.rules : [];
      
      db.prepare("DELETE FROM world_tone_canonical_rules WHERE world_id = ?").run(worldId);
      
      rules.forEach((rule: any, index: number) => {
        db.prepare(`
          INSERT INTO world_tone_canonical_rules (world_id, rule, type, enforcement, exceptions, description, order_index) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, rule.rule || "", rule.type || null, rule.enforcement || null, 
               rule.exceptions || null, rule.description || null, index);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // Cosmology & Realms operations
    if (op === "updateCosmologyPlanes") {
      const planes = Array.isArray(body.planes) ? body.planes : [];
      
      db.prepare("DELETE FROM world_cosmology_planes WHERE world_id = ?").run(worldId);
      
      planes.forEach((plane: any, index: number) => {
        db.prepare(`
          INSERT INTO world_cosmology_planes (world_id, name, plane_type, description, inhabitants, access_method, dangers, alignment, order_index) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, plane.name || "", plane.type || null, plane.description || null, 
               plane.inhabitants || null, plane.accessMethod || null, plane.dangers || null, 
               plane.alignment || null, index);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCosmologyDimensionalRules") {
      const rules = Array.isArray(body.dimensionalRules) ? body.dimensionalRules : [];
      
      db.prepare("DELETE FROM world_cosmology_dimensional_rules WHERE world_id = ?").run(worldId);
      
      rules.forEach((rule: any, index: number) => {
        db.prepare(`
          INSERT INTO world_cosmology_dimensional_rules (world_id, rule, scope, effects, exceptions, order_index) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(worldId, rule.rule || "", rule.scope || null, rule.effects || null, 
               rule.exceptions || null, index);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCosmologyDeities") {
      const deities = Array.isArray(body.deities) ? body.deities : [];
      
      db.prepare("DELETE FROM world_cosmology_deities WHERE world_id = ?").run(worldId);
      
      deities.forEach((deity: any) => {
        db.prepare(`
          INSERT INTO world_cosmology_deities (world_id, name, domain, alignment, power_level, description, followers) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, deity.name || "", deity.domain || null, deity.alignment || null, 
               deity.power || null, deity.description || null, deity.followers || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCosmologyAfterlifeRealms") {
      const realms = Array.isArray(body.afterlifeRealms) ? body.afterlifeRealms : [];
      
      db.prepare("DELETE FROM world_cosmology_afterlife_realms WHERE world_id = ?").run(worldId);
      
      realms.forEach((realm: any, index: number) => {
        db.prepare(`
          INSERT INTO world_cosmology_afterlife_realms (world_id, name, criteria, description, duration, order_index) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(worldId, realm.name || "", realm.criteria || null, realm.description || null, 
               realm.duration || null, index);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // Master Catalogs operations
    if (op === "updateCatalogLanguageFamilies") {
      const families = Array.isArray(body.languageFamilies) ? body.languageFamilies : [];
      
      db.prepare("DELETE FROM world_catalog_language_families WHERE world_id = ?").run(worldId);
      
      families.forEach((family: any) => {
        const languages = Array.isArray(family.languages) ? JSON.stringify(family.languages) : null;
        db.prepare(`
          INSERT INTO world_catalog_language_families (world_id, name, description, languages, writing_system, speakers, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, family.name || "", family.description || null, languages, 
               family.writingSystem || null, family.speakers || null, family.status || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCatalogCurrencySystems") {
      const currencies = Array.isArray(body.currencySystems) ? body.currencySystems : [];
      
      db.prepare("DELETE FROM world_catalog_currency_systems WHERE world_id = ?").run(worldId);
      
      currencies.forEach((currency: any) => {
        const denominations = Array.isArray(currency.denominations) ? JSON.stringify(currency.denominations) : null;
        const regions = Array.isArray(currency.regions) ? JSON.stringify(currency.regions) : null;
        db.prepare(`
          INSERT INTO world_catalog_currency_systems (world_id, name, currency_type, denominations, exchange_rates, regions, backing, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, currency.name || "", currency.type || null, denominations, 
               currency.exchangeRates || null, regions, currency.backing || null, currency.notes || null);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCatalogOrganizations") {
      const organizations = Array.isArray(body.organizations) ? body.organizations : [];
      
      db.prepare("DELETE FROM world_catalog_organizations WHERE world_id = ?").run(worldId);
      
      organizations.forEach((org: any) => {
        const rivals = Array.isArray(org.rivals) ? JSON.stringify(org.rivals) : null;
        const allies = Array.isArray(org.allies) ? JSON.stringify(org.allies) : null;
        db.prepare(`
          INSERT INTO world_catalog_organizations (world_id, name, org_type, scope, alignment, goals, structure, membership, resources, reputation, rivals, allies) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, org.name || "", org.type || null, org.scope || null, org.alignment || null, 
               org.goals || null, org.structure || null, org.membership || null, org.resources || null, 
               org.reputation || null, rivals, allies);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCatalogCommonItems") {
      const items = Array.isArray(body.commonItems) ? body.commonItems : [];
      
      db.prepare("DELETE FROM world_catalog_common_items WHERE world_id = ?").run(worldId);
      
      items.forEach((item: any) => {
        const regions = Array.isArray(item.regions) ? JSON.stringify(item.regions) : null;
        const uses = Array.isArray(item.uses) ? JSON.stringify(item.uses) : null;
        db.prepare(`
          INSERT INTO world_catalog_common_items (world_id, name, category, rarity, value, description, availability, regions, uses) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(worldId, item.name || "", item.category || null, item.rarity || null, item.value || null, 
               item.description || null, item.availability || null, regions, uses);
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    // Catalog meta-configuration operations
    if (op === "updateCatalogOrganizationTypes") {
      const types = Array.isArray(body.organizationTypes) ? body.organizationTypes : [];
      
      db.prepare("DELETE FROM world_catalog_organization_types WHERE world_id = ?").run(worldId);
      
      types.forEach((type: string) => {
        if (type.trim()) {
          db.prepare("INSERT INTO world_catalog_organization_types (world_id, type_name) VALUES (?, ?)").run(worldId, type.trim());
        }
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCatalogItemCategories") {
      const categories = Array.isArray(body.itemCategories) ? body.itemCategories : [];
      
      db.prepare("DELETE FROM world_catalog_item_categories WHERE world_id = ?").run(worldId);
      
      categories.forEach((category: string) => {
        if (category.trim()) {
          db.prepare("INSERT INTO world_catalog_item_categories (world_id, category_name) VALUES (?, ?)").run(worldId, category.trim());
        }
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }

    if (op === "updateCatalogRarityLevels") {
      const rarities = Array.isArray(body.rarityLevels) ? body.rarityLevels : [];
      
      db.prepare("DELETE FROM world_catalog_rarity_levels WHERE world_id = ?").run(worldId);
      
      rarities.forEach((rarity: string) => {
        if (rarity.trim()) {
          db.prepare("INSERT INTO world_catalog_rarity_levels (world_id, rarity_name) VALUES (?, ?)").run(worldId, rarity.trim());
        }
      });

      const data = getWorldDetailsWithCollections(worldId);
      return json({ ok: true, data });
    }
    
    return json({ ok: false, error: `Unknown op: ${op}` }, { status: 400 });
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    console.error("POST /api/world-details error:", err);
    return json({ ok: false, error: msg || "Operation failed." }, { status: 400 });
  }
}