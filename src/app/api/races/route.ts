// src/app/api/races/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getSessionUser } from "@/server/session";

export const dynamic = "force-dynamic";

/* ----------------------------- helpers ----------------------------- */
function json(data: any, init: number | ResponseInit = 200) {
  const status = typeof init === "number" ? init : (init as ResponseInit).status ?? 200;
  return NextResponse.json(data, { status });
}
function bad(message: string, status = 400) {
  return json({ ok: false, error: message }, status);
}
function asInt(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
function asText(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
function assertId(id: any) {
  const n = asInt(id);
  if (n === null) throw new Error("Valid id is required.");
  return n;
}
function rowOrNull<T = any>(stmt: any, params: any[] = []): T | null {
  try {
    const r = stmt.get(...params);
    return r ?? null;
  } catch {
    return null;
  }
}
function list<T = any>(stmt: any, params: any[] = []): T[] {
  return stmt.all(...params) as T[];
}

/* ----------------------------- SELECTs ----------------------------- */
const selRaceLite = db.prepare(`
  SELECT id, name, created_by_id, created_at, updated_at
  FROM races
  ORDER BY name ASC
`);
const selRaceById = db.prepare(`
  SELECT id, name, created_by_id, created_at, updated_at
  FROM races
  WHERE id = ?
`);
const selRaceByName = db.prepare(`
  SELECT id, name, created_by_id, created_at, updated_at
  FROM races
  WHERE name = ?
`);

const selDefByRace = db.prepare(`
  SELECT
    id, race_id,
    legacy_description, physical_characteristics, physical_description,
    racial_quirk, quirk_success_effect, quirk_failure_effect,
    common_languages_known, common_archetypes, examples_by_genre,
    cultural_mindset, outlook_on_magic
  FROM racial_definitions
  WHERE race_id = ?
`);

const selAttrByRace = db.prepare(`
  SELECT
    id, race_id, age_range, size,
    strength_max, dexterity_max, constitution_max,
    intelligence_max, wisdom_max, charisma_max,
    base_magic, base_movement
  FROM racial_attributes
  WHERE race_id = ?
`);

const selBonusByRace = db.prepare(`
  SELECT rbs.id, rbs.race_id, rbs.skill_id, rbs.points, rbs.slot_idx, s.name AS skill_name
  FROM racial_bonus_skills rbs
  LEFT JOIN skills s ON s.id = rbs.skill_id
  WHERE rbs.race_id = ?
  ORDER BY rbs.slot_idx ASC
`);
const selSpecialsByRace = db.prepare(`
  SELECT rsa.id, rsa.race_id, rsa.skill_id, rsa.points, rsa.slot_idx, s.name AS skill_name
  FROM racial_special_abilities rsa
  LEFT JOIN skills s ON s.id = rsa.skill_id
  WHERE rsa.race_id = ?
  ORDER BY rsa.slot_idx ASC
`);

const selSkillCandidatesTier1 = db.prepare(`
  SELECT id, name
  FROM skills
  WHERE LOWER(type) <> 'special ability' AND (tier = 1)
  ORDER BY name ASC
`);
const selSpecialAbilityCandidates = db.prepare(`
  SELECT id, name
  FROM skills
  WHERE LOWER(type) = 'special ability'
  ORDER BY name ASC
`);

/* ----------------------------- INSERT/UPDATE ----------------------------- */
const insRace = db.prepare(`INSERT INTO races (name, created_by_id) VALUES (?, ?)`);
const updRaceName = db.prepare(`UPDATE races SET name = ? WHERE id = ?`);
const delRace = db.prepare(`DELETE FROM races WHERE id = ?`);

const upsertDefInsert = db.prepare(`
  INSERT INTO racial_definitions (
    race_id,
    legacy_description, physical_characteristics, physical_description,
    racial_quirk, quirk_success_effect, quirk_failure_effect,
    common_languages_known, common_archetypes, examples_by_genre,
    cultural_mindset, outlook_on_magic
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
`);
const upsertDefUpdate = db.prepare(`
  UPDATE racial_definitions SET
    legacy_description = ?, physical_characteristics = ?, physical_description = ?,
    racial_quirk = ?, quirk_success_effect = ?, quirk_failure_effect = ?,
    common_languages_known = ?, common_archetypes = ?, examples_by_genre = ?,
    cultural_mindset = ?, outlook_on_magic = ?
  WHERE race_id = ?
`);

const upsertAttrInsert = db.prepare(`
  INSERT INTO racial_attributes (
    race_id, age_range, size,
    strength_max, dexterity_max, constitution_max,
    intelligence_max, wisdom_max, charisma_max,
    base_magic, base_movement
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
`);
const upsertAttrUpdate = db.prepare(`
  UPDATE racial_attributes SET
    age_range = ?, size = ?,
    strength_max = ?, dexterity_max = ?, constitution_max = ?,
    intelligence_max = ?, wisdom_max = ?, charisma_max = ?,
    base_magic = ?, base_movement = ?
  WHERE race_id = ?
`);

const delBonusForRace = db.prepare(`DELETE FROM racial_bonus_skills WHERE race_id = ?`);
const insBonus = db.prepare(`
  INSERT INTO racial_bonus_skills (race_id, skill_id, points, slot_idx)
  VALUES (?,?,?,?)
`);

const delSpecialsForRace = db.prepare(`DELETE FROM racial_special_abilities WHERE race_id = ?`);
const insSpecial = db.prepare(`
  INSERT INTO racial_special_abilities (race_id, skill_id, points, slot_idx)
  VALUES (?,?,?,?)
`);

/* ----------------------------- shaping ----------------------------- */
function hydrateRaceCore(r: any) {
  if (!r) return null;
  const def = rowOrNull(selDefByRace, [r.id]);
  const attr = rowOrNull(selAttrByRace, [r.id]);
  const bonus = list(selBonusByRace, [r.id]);
  const specials = list(selSpecialsByRace, [r.id]);
  return {
    ...r,
    definition: def ?? null,   // no age_range/size here anymore
    attributes: attr ?? null,  // age_range/size live here
    bonus_skills: bonus,
    special_abilities: specials,
  };
}

/* ----------------------------- handlers ----------------------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lite = searchParams.get("lite");
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const candidates = (searchParams.get("candidates") || "").toLowerCase();

    // picker candidates
    if (candidates === "skills") {
      const rows = list(selSkillCandidatesTier1);
      return json({ ok: true, data: rows });
    }
    if (candidates === "specials") {
      const rows = list(selSpecialAbilityCandidates);
      return json({ ok: true, data: rows });
    }

    if (id) {
      const core = rowOrNull(selRaceById, [asInt(id)]);
      if (!core) return bad("Race not found.", 404);
      return json({ ok: true, data: hydrateRaceCore(core) });
    }
    if (name) {
      const nm = asText(name);
      if (!nm) return bad("Name is required.", 400);
      const core = rowOrNull(selRaceByName, [nm]);
      if (!core) return bad("Race not found.", 404);
      return json({ ok: true, data: hydrateRaceCore(core) });
    }

    const rows = list(selRaceLite);
    if (lite) {
      return json({ ok: true, data: rows.map(({ id, name }) => ({ id, name })) });
    } else {
      const full = rows.map(hydrateRaceCore);
      return json({ ok: true, data: full });
    }
  } catch (e: any) {
    return bad(e?.message || "GET failed.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawName = asText(body?.name);
    if (!rawName) return bad("Race name is required.");

    const exists = rowOrNull(selRaceByName, [rawName]);
    if (exists) return bad(`Race '${rawName}' already exists.`);

    const user = await getSessionUser();
    const createdBy = user?.id ?? null;

    const info = insRace.run(rawName, createdBy);
    const core = rowOrNull(selRaceById, [info.lastInsertRowid as number]);
    return json({ ok: true, data: hydrateRaceCore(core) }, 201);
  } catch (e: any) {
    return bad(e?.message || "Create failed.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = assertId(body?.id);

    // rename
    if (body?.rename_to !== undefined) {
      const nm = asText(body.rename_to);
      if (!nm) return bad("New name is required.");
      const other = rowOrNull(selRaceByName, [nm]);
      if (other && other.id !== id) return bad(`Race '${nm}' already exists.`);
      const info = updRaceName.run(nm, id);
      if (info.changes === 0) return bad("Race not found.", 404);
      const core = rowOrNull(selRaceById, [id]);
      return json({ ok: true, data: hydrateRaceCore(core) });
    }

    // section upserts
    const section = (body?.section || "").toString();

    if (section === "definition") {
      const p = body?.payload ?? {};
      const has = rowOrNull(selDefByRace, [id]);

      if (!has) {
        upsertDefInsert.run(
          id,
          asText(p.legacy_description),
          asText(p.physical_characteristics),
          asText(p.physical_description),
          asText(p.racial_quirk),
          asText(p.quirk_success_effect),
          asText(p.quirk_failure_effect),
          asText(p.common_languages_known),
          asText(p.common_archetypes),
          asText(p.examples_by_genre),
          asText(p.cultural_mindset),
          asText(p.outlook_on_magic)
        );
      } else {
        upsertDefUpdate.run(
          asText(p.legacy_description),
          asText(p.physical_characteristics),
          asText(p.physical_description),
          asText(p.racial_quirk),
          asText(p.quirk_success_effect),
          asText(p.quirk_failure_effect),
          asText(p.common_languages_known),
          asText(p.common_archetypes),
          asText(p.examples_by_genre),
          asText(p.cultural_mindset),
          asText(p.outlook_on_magic),
          id
        );
      }
      const core = rowOrNull(selRaceById, [id]);
      return json({ ok: true, data: hydrateRaceCore(core) });
    }

    if (section === "attributes") {
      const p = body?.payload ?? {};
      const has = rowOrNull(selAttrByRace, [id]);
      const norm = (k: string) => asInt(p[k]);

      if (!has) {
        upsertAttrInsert.run(
          id,
          asText(p.age_range),
          asText(p.size),
          norm("strength_max"),
          norm("dexterity_max"),
          norm("constitution_max"),
          norm("intelligence_max"),
          norm("wisdom_max"),
          norm("charisma_max"),
          norm("base_magic"),
          norm("base_movement")
        );
      } else {
        upsertAttrUpdate.run(
          asText(p.age_range),
          asText(p.size),
          norm("strength_max"),
          norm("dexterity_max"),
          norm("constitution_max"),
          norm("intelligence_max"),
          norm("wisdom_max"),
          norm("charisma_max"),
          norm("base_magic"),
          norm("base_movement"),
          id
        );
      }
      const core = rowOrNull(selRaceById, [id]);
      return json({ ok: true, data: hydrateRaceCore(core) });
    }

    if (section === "bonus_skills") {
      const items: any[] = Array.isArray(body?.items) ? body.items : [];
      const tx = db.transaction((rid: number, itemsIn: any[]) => {
        delBonusForRace.run(rid);
        itemsIn.forEach((it, idx) => {
          const sid = assertId(it?.skill_id);
          const pts = Math.max(0, asInt(it?.points) ?? 0);
          insBonus.run(rid, sid, pts, idx);
        });
      });
      tx(id, items);
      const core = rowOrNull(selRaceById, [id]);
      return json({ ok: true, data: hydrateRaceCore(core) });
    }

    if (section === "special_abilities") {
      const items: any[] = Array.isArray(body?.items) ? body.items : [];
      const tx = db.transaction((rid: number, itemsIn: any[]) => {
        delSpecialsForRace.run(rid);
        itemsIn.forEach((it, idx) => {
          const sid = assertId(it?.skill_id);
          const pts = Math.max(0, asInt(it?.points) ?? 0);
          insSpecial.run(rid, sid, pts, idx);
        });
      });
      tx(id, items);
      const core = rowOrNull(selRaceById, [id]);
      return json({ ok: true, data: hydrateRaceCore(core) });
    }

    return bad("Unsupported PUT. Provide { rename_to } or { section, payload/items }.");
  } catch (e: any) {
    return bad(e?.message || "Update failed.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = assertId(body?.id);
    const info = delRace.run(id);
    if (info.changes === 0) return bad("Race not found.", 404);
    return json({ ok: true, deleted: true });
  } catch (e: any) {
    return bad(e?.message || "Delete failed.", 500);
  }
}
