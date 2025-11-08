// src/app/api/world/eras/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch era with all related data
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return apiError("Era ID is required", 400);
  }

  // Get era basic info
  const era = db.prepare(`
    SELECT * FROM eras WHERE id = ?
  `).get(id);

  if (!era) {
    return apiError("Era not found", 404);
  }

  // Get related data
  const governments = db.prepare(`
    SELECT * FROM era_governments WHERE era_id = ? ORDER BY id
  `).all(id);

  const tradeRoutes = db.prepare(`
    SELECT * FROM era_trade_routes WHERE era_id = ? ORDER BY id
  `).all(id);

  const economicConditions = db.prepare(`
    SELECT * FROM era_economic_conditions WHERE era_id = ? ORDER BY id
  `).all(id);

  const catalysts = db.prepare(`
    SELECT * FROM era_catalysts WHERE era_id = ? ORDER BY start_date_year, start_date_month, start_date_day
  `).all(id);

  const currencies = db.prepare(`
    SELECT * FROM era_currencies WHERE era_id = ? ORDER BY display_order, id
  `).all(id);

  const regions = db.prepare(`
    SELECT * FROM era_regions WHERE era_id = ? ORDER BY id
  `).all(id);

  const catalogRaces = db.prepare(`
    SELECT * FROM era_catalog_races WHERE era_id = ? ORDER BY race_id
  `).all(id);

  const catalogCreatures = db.prepare(`
    SELECT * FROM era_catalog_creatures WHERE era_id = ? ORDER BY creature_id
  `).all(id);

  const catalogLanguages = db.prepare(`
    SELECT * FROM era_catalog_languages WHERE era_id = ? ORDER BY language_name
  `).all(id);

  const catalogDeities = db.prepare(`
    SELECT * FROM era_catalog_deities WHERE era_id = ? ORDER BY deity_name
  `).all(id);

  const catalogFactions = db.prepare(`
    SELECT * FROM era_catalog_factions WHERE era_id = ? ORDER BY faction_name
  `).all(id);

  const catalogOrganizations = db.prepare(`
    SELECT * FROM era_catalog_organizations WHERE era_id = ? ORDER BY organization_name
  `).all(id);

  return apiSuccess({
    era,
    governments,
    tradeRoutes,
    economicConditions,
    catalysts,
    currencies,
    regions,
    catalogRaces,
    catalogCreatures,
    catalogLanguages,
    catalogDeities,
    catalogFactions,
    catalogOrganizations,
  });
});

// PUT - Update era basic info
export const PUT = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return apiError("Era ID is required", 400);
  }

  // Build update query
  const fields = [];
  const values: any[] = [];

  const allowedFields = [
    'name', 'short_summary', 'ongoing', 
    'start_year', 'start_month', 'start_day',
    'end_year', 'end_month', 'end_day',
    'tech_level', 'magic_tide', 'stability_conflict',
    'travel_safety', 'economy', 'law_order', 'religious_temperature',
    'rules_rest_recovery', 'rules_difficulty_bias',
    'transition_in', 'transition_out',
    'friendly_label', 'icon', 'color', 'description'
  ];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }

  if (fields.length === 0) {
    return apiError("No valid fields to update", 400);
  }

  values.push(new Date().toISOString()); // updated_at
  values.push(id);

  const sql = `
    UPDATE eras 
    SET ${fields.join(', ')}, updated_at = ?
    WHERE id = ?
  `;

  const result = db.prepare(sql).run(...values);

  if (result.changes === 0) {
    return apiError("Era not found", 404);
  }

  // Return updated era
  const era = db.prepare('SELECT * FROM eras WHERE id = ?').get(id);
  return apiSuccess(era);
});

// POST - Create or update related data
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { type, eraId, data, id } = body;

  if (!type || !eraId) {
    return apiError("Type and eraId are required", 400);
  }

  const now = new Date().toISOString();

  switch (type) {
    case 'government': {
      if (id) {
        // Update
        db.prepare(`
          UPDATE era_governments 
          SET name = ?, gov_type = ?, territory_controlled = ?, current_ruler = ?,
              stability_status = ?, military_strength = ?, updated_at = ?
          WHERE id = ?
        `).run(
          data.name, data.gov_type, data.territory_controlled, data.current_ruler,
          data.stability_status, data.military_strength, now, id
        );
      } else {
        // Insert
        db.prepare(`
          INSERT INTO era_governments (era_id, name, gov_type, territory_controlled, current_ruler, stability_status, military_strength, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(eraId, data.name, data.gov_type, data.territory_controlled, data.current_ruler, data.stability_status, data.military_strength, now);
      }
      break;
    }

    case 'tradeRoute': {
      if (id) {
        db.prepare(`
          UPDATE era_trade_routes 
          SET name = ?, status = ?, start_point = ?, end_point = ?, trade_goods = ?, updated_at = ?
          WHERE id = ?
        `).run(data.name, data.status, data.start_point, data.end_point, data.trade_goods, now, id);
      } else {
        db.prepare(`
          INSERT INTO era_trade_routes (era_id, name, status, start_point, end_point, trade_goods, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(eraId, data.name, data.status, data.start_point, data.end_point, data.trade_goods, now);
      }
      break;
    }

    case 'economicCondition': {
      if (id) {
        db.prepare(`
          UPDATE era_economic_conditions 
          SET condition_type = ?, description = ?, affected_regions = ?, updated_at = ?
          WHERE id = ?
        `).run(data.condition_type, data.description, data.affected_regions, now, id);
      } else {
        db.prepare(`
          INSERT INTO era_economic_conditions (era_id, condition_type, description, affected_regions, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(eraId, data.condition_type, data.description, data.affected_regions, now);
      }
      break;
    }

    case 'catalyst': {
      if (id) {
        db.prepare(`
          UPDATE era_catalysts 
          SET title = ?, catalyst_type = ?, start_date_year = ?, start_date_month = ?, start_date_day = ?,
              end_date_year = ?, end_date_month = ?, end_date_day = ?,
              player_visible = ?, short_summary = ?, full_notes = ?, impacts = ?, mechanical_tags = ?,
              ripple_effects = ?, anniversary_date = ?, related_catalysts = ?, settlement_reactions = ?,
              attachment_url = ?, updated_at = ?
          WHERE id = ?
        `).run(
          data.title, data.catalyst_type, data.start_date_year, data.start_date_month, data.start_date_day,
          data.end_date_year, data.end_date_month, data.end_date_day,
          data.player_visible ? 1 : 0, data.short_summary, data.full_notes, data.impacts, data.mechanical_tags,
          data.ripple_effects, data.anniversary_date, data.related_catalysts, data.settlement_reactions,
          data.attachment_url, now, id
        );
      } else {
        db.prepare(`
          INSERT INTO era_catalysts (
            era_id, title, catalyst_type, start_date_year, start_date_month, start_date_day,
            end_date_year, end_date_month, end_date_day, player_visible, short_summary, full_notes,
            impacts, mechanical_tags, ripple_effects, anniversary_date, related_catalysts,
            settlement_reactions, attachment_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          eraId, data.title, data.catalyst_type, data.start_date_year, data.start_date_month, data.start_date_day,
          data.end_date_year, data.end_date_month, data.end_date_day,
          data.player_visible ? 1 : 0, data.short_summary, data.full_notes, data.impacts, data.mechanical_tags,
          data.ripple_effects, data.anniversary_date, data.related_catalysts, data.settlement_reactions,
          data.attachment_url, now
        );
      }
      break;
    }

    case 'currency': {
      if (id) {
        db.prepare(`
          UPDATE era_currencies 
          SET coin_name = ?, value_in_credits = ?, display_order = ?, updated_at = ?
          WHERE id = ?
        `).run(data.coin_name, data.value_in_credits, data.display_order || 0, now, id);
      } else {
        db.prepare(`
          INSERT INTO era_currencies (era_id, coin_name, value_in_credits, display_order, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(eraId, data.coin_name, data.value_in_credits, data.display_order || 0, now);
      }
      break;
    }

    case 'region': {
      if (id) {
        db.prepare(`
          UPDATE era_regions 
          SET name = ?, kind = ?, parent_govt = ?, currency_rule = ?, local_coins = ?, updated_at = ?
          WHERE id = ?
        `).run(data.name, data.kind, data.parent_govt, data.currency_rule, data.local_coins, now, id);
      } else {
        db.prepare(`
          INSERT INTO era_regions (era_id, name, kind, parent_govt, currency_rule, local_coins, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(eraId, data.name, data.kind, data.parent_govt, data.currency_rule, data.local_coins, now);
      }
      break;
    }

    default:
      return apiError("Invalid type", 400);
  }

  return apiSuccess({ ok: true });
});

// DELETE - Delete related data
export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return apiError("Type and ID are required", 400);
  }

  const tables: Record<string, string> = {
    government: 'era_governments',
    tradeRoute: 'era_trade_routes',
    economicCondition: 'era_economic_conditions',
    catalyst: 'era_catalysts',
    currency: 'era_currencies',
    region: 'era_regions',
  };

  const table = tables[type];
  if (!table) {
    return apiError("Invalid type", 400);
  }

  const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);

  if (result.changes === 0) {
    return apiError("Record not found", 404);
  }

  return apiSuccess({ deleted: true });
});
