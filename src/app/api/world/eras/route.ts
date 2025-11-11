import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getSessionUser } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (data: any, init?: number | ResponseInit) => NextResponse.json(data, init as any);

function getEraDetails(eraId: number) {
  const era = db.prepare("SELECT * FROM eras WHERE id = ?").get(eraId);
  if (!era) return null;

  const basicInfo = db.prepare("SELECT * FROM era_basic_info WHERE era_id = ?").get(eraId);
  const backdropDefaults = db.prepare("SELECT * FROM era_backdrop_defaults WHERE era_id = ?").get(eraId);
  
  const governments = db.prepare("SELECT * FROM era_governments WHERE era_id = ? ORDER BY order_index").all(eraId);
  governments.forEach((gov: any) => {
    gov.regions = db.prepare("SELECT * FROM era_regions WHERE government_id = ? ORDER BY order_index").all(gov.id);
    gov.regions.forEach((region: any) => {
      region.currencies = db.prepare("SELECT * FROM era_region_currency_denominations WHERE region_id = ? ORDER BY order_index").all(region.id);
    });
  });

  const tradeEconomics = db.prepare("SELECT * FROM era_trade_economics WHERE era_id = ?").get(eraId);
  
  const races = db.prepare("SELECT * FROM era_races WHERE era_id = ? ORDER BY order_index").all(eraId);
  const creatures = db.prepare("SELECT * FROM era_creatures WHERE era_id = ? ORDER BY order_index").all(eraId);
  const languages = db.prepare("SELECT * FROM era_languages WHERE era_id = ? ORDER BY order_index").all(eraId);
  const deities = db.prepare("SELECT * FROM era_deities WHERE era_id = ? ORDER BY order_index").all(eraId);
  const factions = db.prepare("SELECT * FROM era_factions WHERE era_id = ? ORDER BY order_index").all(eraId);
  
  const catalystEvents = db.prepare("SELECT * FROM era_catalyst_events WHERE era_id = ? ORDER BY order_index").all(eraId);

  return {
    era,
    basicInfo,
    backdropDefaults,
    governments,
    tradeEconomics,
    catalogs: { races, creatures, languages, deities, factions },
    catalystEvents
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return json({ ok: false, error: "Era ID required" }, 400);

    const data = getEraDetails(Number(id));
    if (!data) return json({ ok: false, error: "Era not found" }, 404);

    return json({ ok: true, data });
  } catch (err: any) {
    console.error("GET /api/world/eras error:", err);
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return json({ ok: false, error: "Unauthorized" }, 401);

    const body = await req.json();
    const { eraId, section, data } = body;
    if (!eraId) return json({ ok: false, error: "eraId required" }, 400);

    switch (section) {
      case "basicInfo":
        const existing = db.prepare("SELECT id FROM era_basic_info WHERE era_id = ?").get(eraId);
        if (existing) {
          db.prepare("UPDATE era_basic_info SET short_summary = ?, ongoing = ?, start_date_year = ?, start_date_month = ?, start_date_day = ?, end_date_year = ?, end_date_month = ?, end_date_day = ?, transition_in = ?, transition_out = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE era_id = ?")
            .run(data.shortSummary, data.ongoing ? 1 : 0, data.startDate?.year, data.startDate?.month, data.startDate?.day, data.endDate?.year, data.endDate?.month, data.endDate?.day, data.transitionIn, data.transitionOut, eraId);
        } else {
          db.prepare("INSERT INTO era_basic_info (era_id, short_summary, ongoing, start_date_year, start_date_month, start_date_day, end_date_year, end_date_month, end_date_day, transition_in, transition_out) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .run(eraId, data.shortSummary, data.ongoing ? 1 : 0, data.startDate?.year, data.startDate?.month, data.startDate?.day, data.endDate?.year, data.endDate?.month, data.endDate?.day, data.transitionIn, data.transitionOut);
        }
        break;

      case "backdropDefaults":
        const existingBackdrop = db.prepare("SELECT id FROM era_backdrop_defaults WHERE era_id = ?").get(eraId);
        if (existingBackdrop) {
          db.prepare("UPDATE era_backdrop_defaults SET active_realms_json = ?, typical_tech_level = ?, magic_tide = ?, stability_conflict = ?, travel_safety = ?, economy = ?, law_order = ?, religious_temperature = ?, rules_style_nudges_json = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE era_id = ?")
            .run(JSON.stringify(data.activeRealms || []), data.typicalTechLevel, data.magicTide, data.stabilityConflict, data.travelSafety, data.economy, data.lawOrder, data.religiousTemperature, JSON.stringify(data.rulesStyleNudges || {}), eraId);
        } else {
          db.prepare("INSERT INTO era_backdrop_defaults (era_id, active_realms_json, typical_tech_level, magic_tide, stability_conflict, travel_safety, economy, law_order, religious_temperature, rules_style_nudges_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .run(eraId, JSON.stringify(data.activeRealms || []), data.typicalTechLevel, data.magicTide, data.stabilityConflict, data.travelSafety, data.economy, data.lawOrder, data.religiousTemperature, JSON.stringify(data.rulesStyleNudges || {}));
        }
        break;
    }

    const updated = getEraDetails(Number(eraId));
    return json({ ok: true, data: updated });
  } catch (err: any) {
    console.error("POST /api/world/eras error:", err);
    return json({ ok: false, error: err.message }, 500);
  }
}
