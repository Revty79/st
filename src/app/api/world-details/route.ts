import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getSessionUser } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (data: any, init?: number | ResponseInit) => NextResponse.json(data, init as any);

function getWorldDetails(worldId: number) {
  const world = db.prepare("SELECT * FROM worlds WHERE id = ?").get(worldId);
  if (!world) return null;

  const basicInfo = db.prepare("SELECT * FROM world_basic_info WHERE world_id = ?").get(worldId);
  const calendar = db.prepare("SELECT * FROM world_calendars WHERE world_id = ?").get(worldId);
  const realms = db.prepare("SELECT * FROM world_realms WHERE world_id = ? ORDER BY order_index").all(worldId);
  
  const continents = db.prepare("SELECT * FROM world_continents WHERE world_id = ? ORDER BY order_index").all(worldId);
  continents.forEach((continent: any) => {
    continent.mountains = db.prepare("SELECT * FROM continent_mountains WHERE continent_id = ? ORDER BY order_index").all(continent.id);
    continent.rivers = db.prepare("SELECT * FROM continent_rivers WHERE continent_id = ? ORDER BY order_index").all(continent.id);
    continent.lakes = db.prepare("SELECT * FROM continent_lakes WHERE continent_id = ? ORDER BY order_index").all(continent.id);
    continent.coasts = db.prepare("SELECT * FROM continent_coasts WHERE continent_id = ? ORDER BY order_index").all(continent.id);
    continent.resources = db.prepare("SELECT * FROM continent_resources WHERE continent_id = ? ORDER BY order_index").all(continent.id);
    continent.hazards = db.prepare("SELECT * FROM continent_hazards WHERE continent_id = ? ORDER BY order_index").all(continent.id);
    continent.biomes = db.prepare("SELECT * FROM continent_biomes WHERE continent_id = ? ORDER BY order_index").all(continent.id);
    continent.tradePaths = db.prepare("SELECT * FROM continent_trade_paths WHERE continent_id = ? ORDER BY order_index").all(continent.id);
  });

  const suns = db.prepare("SELECT * FROM world_astral_suns WHERE world_id = ? ORDER BY order_index").all(worldId);
  const moons = db.prepare("SELECT * FROM world_astral_moons WHERE world_id = ? ORDER BY order_index").all(worldId);
  const constellations = db.prepare("SELECT * FROM world_astral_constellations WHERE world_id = ? ORDER BY order_index").all(worldId);
  const cosmicEvents = db.prepare("SELECT * FROM world_cosmic_events WHERE world_id = ? ORDER BY order_index").all(worldId);
  const technology = db.prepare("SELECT * FROM world_technology WHERE world_id = ?").get(worldId);
  const toneCanon = db.prepare("SELECT * FROM world_tone_canon WHERE world_id = ?").get(worldId);
  const magicModel = db.prepare("SELECT * FROM world_magic_model WHERE world_id = ?").get(worldId);
  const magicSystems = db.prepare("SELECT * FROM world_magic_systems WHERE world_id = ? ORDER BY order_index").all(worldId);
  const magicCustoms = db.prepare("SELECT * FROM world_magic_customs WHERE world_id = ? ORDER BY order_index").all(worldId);
  const magicRules = db.prepare("SELECT * FROM world_magic_rules WHERE world_id = ? ORDER BY order_index").all(worldId);
  const corruptionThresholds = db.prepare("SELECT * FROM world_corruption_thresholds WHERE world_id = ? ORDER BY order_index").all(worldId);
  const currencyAnchor = db.prepare("SELECT * FROM world_currency_anchor WHERE world_id = ?").get(worldId);

  // Master catalogs - races and creatures available in this world
  const worldRaces = db.prepare(`
    SELECT wr.id, wr.order_index, r.* 
    FROM world_races wr
    JOIN races r ON wr.race_id = r.id
    WHERE wr.world_id = ?
    ORDER BY wr.order_index
  `).all(worldId);
  
  const worldCreatures = db.prepare(`
    SELECT wc.id, wc.order_index, c.* 
    FROM world_creatures wc
    JOIN creatures c ON wc.creature_id = c.id
    WHERE wc.world_id = ?
    ORDER BY wc.order_index
  `).all(worldId);

  return {
    world,
    basicInfo,
    calendar,
    realms,
    continents,
    astralBodies: { suns, moons, constellations, cosmicEvents },
    technology,
    toneCanon,
    magic: { model: magicModel, systems: magicSystems, customs: magicCustoms, rules: magicRules, corruptionThresholds },
    currencyAnchor,
    masterCatalogs: { races: worldRaces, creatures: worldCreatures }
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const worldId = searchParams.get("worldId");
    if (!worldId) return json({ ok: false, error: "worldId required" }, 400);

    const data = getWorldDetails(Number(worldId));
    if (!data) return json({ ok: false, error: "World not found" }, 404);

    return json({ ok: true, data });
  } catch (err: any) {
    console.error("GET /api/world-details error:", err);
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return json({ ok: false, error: "Unauthorized" }, 401);

    const body = await req.json();
    const { worldId, section, data, action, raceId, creatureId } = body;
    if (!worldId) return json({ ok: false, error: "worldId required" }, 400);

    switch (section) {
      case "basicInfo":
        const existing = db.prepare("SELECT id FROM world_basic_info WHERE world_id = ?").get(worldId);
        if (existing) {
          db.prepare("UPDATE world_basic_info SET tags_json = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE world_id = ?")
            .run(JSON.stringify(data.tags || []), worldId);
        } else {
          db.prepare("INSERT INTO world_basic_info (world_id, tags_json) VALUES (?, ?)")
            .run(worldId, JSON.stringify(data.tags || []));
        }
        break;

      case "calendar":
        const existingCal = db.prepare("SELECT id FROM world_calendars WHERE world_id = ?").get(worldId);
        if (existingCal) {
          db.prepare("UPDATE world_calendars SET day_hours = ?, year_days = ?, months_json = ?, weekdays_json = ?, season_bands_json = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE world_id = ?")
            .run(data.dayHours || 24, data.yearDays || 365, JSON.stringify(data.months || []), JSON.stringify(data.weekdays || []), JSON.stringify(data.seasonBands || []), worldId);
        } else {
          db.prepare("INSERT INTO world_calendars (world_id, day_hours, year_days, months_json, weekdays_json, season_bands_json) VALUES (?, ?, ?, ?, ?, ?)")
            .run(worldId, data.dayHours || 24, data.yearDays || 365, JSON.stringify(data.months || []), JSON.stringify(data.weekdays || []), JSON.stringify(data.seasonBands || []));
        }
        break;

      case "masterCatalogs":
        if (action === "addRace" && raceId) {
          const maxOrder = db.prepare("SELECT COALESCE(MAX(order_index), -1) as max FROM world_races WHERE world_id = ?").get(worldId) as { max: number };
          db.prepare("INSERT OR IGNORE INTO world_races (world_id, race_id, order_index) VALUES (?, ?, ?)")
            .run(worldId, raceId, maxOrder.max + 1);
        } else if (action === "removeRace" && raceId) {
          db.prepare("DELETE FROM world_races WHERE world_id = ? AND race_id = ?")
            .run(worldId, raceId);
        } else if (action === "addCreature" && creatureId) {
          const maxOrder = db.prepare("SELECT COALESCE(MAX(order_index), -1) as max FROM world_creatures WHERE world_id = ?").get(worldId) as { max: number };
          db.prepare("INSERT OR IGNORE INTO world_creatures (world_id, creature_id, order_index) VALUES (?, ?, ?)")
            .run(worldId, creatureId, maxOrder.max + 1);
        } else if (action === "removeCreature" && creatureId) {
          db.prepare("DELETE FROM world_creatures WHERE world_id = ? AND creature_id = ?")
            .run(worldId, creatureId);
        }
        break;
    }

    const updated = getWorldDetails(Number(worldId));
    return json({ ok: true, data: updated });
  } catch (err: any) {
    console.error("POST /api/world-details error:", err);
    return json({ ok: false, error: err.message }, 500);
  }
}
