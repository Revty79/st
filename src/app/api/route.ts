import { NextResponse } from "next/server";
import { db } from "@/server/db"; // ← your existing db export

// ---------- helpers ----------
function bad(msg: string, code = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status: code });
}
async function readJson<T = any>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    // allow empty body
    return {} as T;
  }
}

function toInt(v: any, d: number | null = null) {
  if (v === null || v === undefined || v === "") return d;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}
function toFloat(v: any, d: number | null = null) {
  if (v === null || v === undefined || v === "") return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function toBool01(v: any, d = 0) {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v === 1 || v === "1" || v === "true" || v === "on") return 1;
  if (v === 0 || v === "0" || v === "false" || v === "off") return 0;
  return d;
}
function arr<T = any>(v: any): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function ensureWorldExists(world_id: number) {
  const row = db.prepare(`SELECT id, name, description FROM worlds WHERE id = ?`).get(world_id) as
    | { id: number; name: string; description?: string }
    | undefined;
  if (!row) throw new Error("World not found");
  return row;
}

// resolves race/creature by name to ID (if provided)
function idByName(table: "races" | "creatures", name: string): number | null {
  const row = db.prepare(`SELECT id FROM ${table} WHERE name = ?`).get(name) as { id: number } | undefined;
  return row?.id ?? null;
}

// ---------- GET ----------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const world_id = toInt(url.searchParams.get("world_id"));
    if (!world_id) return bad("world_id is required");

    const world = ensureWorldExists(world_id);

    // details (1:1) – may not exist yet
    const details =
      (db
        .prepare(
          `
        SELECT *
        FROM world_details
        WHERE world_id = ?
      `
        )
        .get(world_id) as any) ||
      null;

    // child lists
    const tags = db.prepare(`SELECT value FROM world_tags WHERE world_id = ? ORDER BY value`).all(world_id) as { value: string }[];
    const moons = db
      .prepare(`SELECT name, cycle_days, omen, order_index FROM world_moons WHERE world_id = ? ORDER BY order_index`)
      .all(world_id) as { name: string; cycle_days: number | null; omen: string | null; order_index: number }[];
    const months = db
      .prepare(`SELECT name, days, order_index FROM world_months WHERE world_id = ? ORDER BY order_index`)
      .all(world_id) as { name: string; days: number; order_index: number }[];
    const weekdays = db
      .prepare(`SELECT value, order_index FROM world_weekdays WHERE world_id = ? ORDER BY order_index`)
      .all(world_id) as { value: string; order_index: number }[];
    const climates = db
      .prepare(`SELECT value FROM world_climates WHERE world_id = ? ORDER BY value`)
      .all(world_id) as { value: string }[];
    const magic_builtins = db
      .prepare(`SELECT system FROM world_magic_systems WHERE world_id = ? ORDER BY system`)
      .all(world_id) as { system: string }[];
    const magic_customs = db
      .prepare(`SELECT name FROM world_magic_customs WHERE world_id = ? ORDER BY name`)
      .all(world_id) as { name: string }[];
    const unbreakables = db
      .prepare(`SELECT value, order_index FROM world_unbreakables WHERE world_id = ? ORDER BY order_index`)
      .all(world_id) as { value: string; order_index: number }[];
    const bans = db.prepare(`SELECT value FROM world_bans WHERE world_id = ? ORDER BY value`).all(world_id) as {
      value: string;
    }[];
    const tone_flags = db
      .prepare(`SELECT flag FROM world_tone_flags WHERE world_id = ? ORDER BY flag`)
      .all(world_id) as { flag: string }[];
    const realms = db
      .prepare(
        `SELECT name, type, traits, travel, bleed, order_index
         FROM world_realms WHERE world_id = ? ORDER BY order_index`
      )
      .all(world_id) as {
        name: string;
        type: string | null;
        traits: string | null;
        travel: string | null;
        bleed: string | null;
        order_index: number;
      }[];
    const languages = db
      .prepare(`SELECT value FROM world_languages WHERE world_id = ? ORDER BY value`)
      .all(world_id) as { value: string }[];
    const deities = db
      .prepare(`SELECT value FROM world_deities WHERE world_id = ? ORDER BY value`)
      .all(world_id) as { value: string }[];
    const factions = db
      .prepare(`SELECT value FROM world_factions WHERE world_id = ? ORDER BY value`)
      .all(world_id) as { value: string }[];

    // catalogs (join back out to names for convenience)
    const race_rows = db
      .prepare(
        `SELECT r.id, r.name
         FROM world_race_catalog wrc
         JOIN races r ON r.id = wrc.race_id
         WHERE wrc.world_id = ?
         ORDER BY r.name`
      )
      .all(world_id) as { id: number; name: string }[];

    const creature_rows = db
      .prepare(
        `SELECT c.id, c.name
         FROM world_creature_catalog wcc
         JOIN creatures c ON c.id = wcc.creature_id
         WHERE wcc.world_id = ?
         ORDER BY c.name`
      )
      .all(world_id) as { id: number; name: string }[];

    return NextResponse.json({
      ok: true,
      world,
      details,
      tags: tags.map((x) => x.value),
      moons,
      months,
      weekdays,
      climates: climates.map((x) => x.value),
      magic: {
        builtins: magic_builtins.map((x) => x.system),
        customs: magic_customs.map((x) => x.name),
      },
      unbreakables,
      bans: bans.map((x) => x.value),
      tone_flags: tone_flags.map((x) => x.flag),
      realms,
      languages: languages.map((x) => x.value),
      deities: deities.map((x) => x.value),
      factions: factions.map((x) => x.value),
      race_catalog: race_rows, // {id,name}[]
      creature_catalog: creature_rows, // {id,name}[]
    });
  } catch (err: any) {
    return bad(err.message || "Failed to load world details", 500);
  }
}

// ---------- POST (UPSERT) ----------
/**
 * Body shape (send anything you care about; missing arrays default to []):
 * {
 *   world_id: number,
 *   details: {
 *     pitch, suns_count, day_hours, year_days, leap_rule,
 *     planet_type, planet_type_note, size_class, gravity_vs_earth, water_pct, tectonics,
 *     source_statement, corruption_level, corruption_note,
 *     tech_from, tech_to, player_safe_summary_on
 *   },
 *   tags: string[],
 *   moons: [{name, cycle_days, omen, order_index}],
 *   months: [{name, days, order_index}],
 *   weekdays: [{value, order_index}],
 *   climates: string[],
 *   magic: { builtins: string[], customs: string[] },
 *   unbreakables: [{value, order_index}],
 *   bans: string[],
 *   tone_flags: string[],
 *   realms: [{name,type,traits,travel,bleed,order_index}],
 *   languages: string[],
 *   deities: string[],
 *   factions: string[],
 *   race_ids?: number[], race_names?: string[],
 *   creature_ids?: number[], creature_names?: string[]
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await readJson<any>(req);
    const world_id = toInt(body.world_id || body.worldId);
    if (!world_id) return bad("world_id is required");

    ensureWorldExists(world_id);

    const d = body.details || {};

    // Start transaction
    db.exec("BEGIN");

    // ----- upsert world_details (1:1) -----
    const existing = db.prepare(`SELECT id FROM world_details WHERE world_id = ?`).get(world_id) as
      | { id: number }
      | undefined;

    const payload = {
      pitch: (d.pitch ?? null) as string | null,
      suns_count: Math.max(0, Math.min(5, toInt(d.suns_count, 1)!)),
      day_hours: toFloat(d.day_hours, null),
      year_days: toInt(d.year_days, null),
      leap_rule: (d.leap_rule ?? null) as string | null,
      planet_type: (d.planet_type ?? "Terrestrial") as string,
      planet_type_note: (d.planet_type_note ?? null) as string | null,
      size_class: (d.size_class ?? null) as string | null,
      gravity_vs_earth: toFloat(d.gravity_vs_earth, null),
      water_pct: toInt(d.water_pct, null),
      tectonics: (d.tectonics ?? "Medium") as string,
      source_statement: (d.source_statement ?? null) as string | null,
      corruption_level: (d.corruption_level ?? "Moderate") as string,
      corruption_note: (d.corruption_note ?? null) as string | null,
      tech_from: (d.tech_from ?? "Iron") as string,
      tech_to: (d.tech_to ?? "Industrial") as string,
      player_safe_summary_on: toBool01(d.player_safe_summary_on, 1),
    };

    if (existing) {
      db.prepare(
        `UPDATE world_details SET
           pitch=@pitch,
           suns_count=@suns_count,
           day_hours=@day_hours,
           year_days=@year_days,
           leap_rule=@leap_rule,
           planet_type=@planet_type,
           planet_type_note=@planet_type_note,
           size_class=@size_class,
           gravity_vs_earth=@gravity_vs_earth,
           water_pct=@water_pct,
           tectonics=@tectonics,
           source_statement=@source_statement,
           corruption_level=@corruption_level,
           corruption_note=@corruption_note,
           tech_from=@tech_from,
           tech_to=@tech_to,
           player_safe_summary_on=@player_safe_summary_on,
           updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
         WHERE world_id = ${world_id}`
      ).run(payload);
    } else {
      db.prepare(
        `INSERT INTO world_details (
           world_id, pitch, suns_count, day_hours, year_days, leap_rule,
           planet_type, planet_type_note, size_class, gravity_vs_earth, water_pct, tectonics,
           source_statement, corruption_level, corruption_note,
           tech_from, tech_to, player_safe_summary_on
         ) VALUES (
           ?, @pitch, @suns_count, @day_hours, @year_days, @leap_rule,
           @planet_type, @planet_type_note, @size_class, @gravity_vs_earth, @water_pct, @tectonics,
           @source_statement, @corruption_level, @corruption_note,
           @tech_from, @tech_to, @player_safe_summary_on
         )`
      ).run(world_id, payload);
    }

    // ----- replace all child collections -----
    type KV = { value: string };
    const clear = (table: string) =>
      db.prepare(`DELETE FROM ${table} WHERE world_id = ?`).run(world_id);

    clear("world_tags");
    const insTag = db.prepare(`INSERT INTO world_tags (world_id, value) VALUES (?, ?)`);
    for (const v of arr<string>(body.tags)) insTag.run(world_id, String(v).trim());

    clear("world_moons");
    const insMoon = db.prepare(
      `INSERT INTO world_moons (world_id, name, cycle_days, omen, order_index) VALUES (?, ?, ?, ?, ?)`
    );
    for (const m of arr<any>(body.moons)) {
      if (!m || !m.name) continue;
      insMoon.run(world_id, String(m.name).slice(0, 40), toInt(m.cycle_days, null), m.omen ?? null, toInt(m.order_index, 0));
    }

    clear("world_months");
    const insMonth = db.prepare(
      `INSERT INTO world_months (world_id, name, days, order_index) VALUES (?, ?, ?, ?)`
    );
    for (const m of arr<any>(body.months)) {
      if (!m || !m.name) continue;
      insMonth.run(world_id, String(m.name).slice(0, 30), Math.max(1, Math.min(60, toInt(m.days, 30)!)), toInt(m.order_index, 0));
    }

    clear("world_weekdays");
    const insWeek = db.prepare(
      `INSERT INTO world_weekdays (world_id, value, order_index) VALUES (?, ?, ?)`
    );
    for (const w of arr<any>(body.weekdays)) {
      if (!w || !w.value) continue;
      insWeek.run(world_id, String(w.value).slice(0, 20), toInt(w.order_index, 0));
    }

    clear("world_climates");
    const insClimate = db.prepare(`INSERT INTO world_climates (world_id, value) VALUES (?, ?)`);
    for (const v of arr<string>(body.climates)) insClimate.run(world_id, String(v).trim());

    clear("world_magic_systems");
    clear("world_magic_customs");
    const magic = body.magic || {};
    const insBuiltin = db.prepare(`INSERT INTO world_magic_systems (world_id, system) VALUES (?, ?)`);
    for (const s of arr<string>(magic.builtins)) insBuiltin.run(world_id, String(s));
    const insCustom = db.prepare(`INSERT INTO world_magic_customs (world_id, name) VALUES (?, ?)`);
    for (const s of arr<string>(magic.customs)) insCustom.run(world_id, String(s).trim());

    clear("world_unbreakables");
    const insUnb = db.prepare(
      `INSERT INTO world_unbreakables (world_id, value, order_index) VALUES (?, ?, ?)`
    );
    for (const r of arr<any>(body.unbreakables)) {
      if (!r || !r.value) continue;
      insUnb.run(world_id, String(r.value).slice(0, 120), toInt(r.order_index, 0));
    }

    clear("world_bans");
    const insBan = db.prepare(`INSERT INTO world_bans (world_id, value) VALUES (?, ?)`);
    for (const v of arr<string>(body.bans)) insBan.run(world_id, String(v).trim());

    clear("world_tone_flags");
    const insTone = db.prepare(`INSERT INTO world_tone_flags (world_id, flag) VALUES (?, ?)`);
    for (const f of arr<string>(body.tone_flags)) insTone.run(world_id, String(f));

    clear("world_realms");
    const insRealm = db.prepare(
      `INSERT INTO world_realms (world_id, name, type, traits, travel, bleed, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const r of arr<any>(body.realms)) {
      if (!r || !r.name) continue;
      insRealm.run(
        world_id,
        String(r.name).slice(0, 40),
        r.type ? String(r.type).slice(0, 40) : null,
        r.traits ? String(r.traits).slice(0, 80) : null,
        r.travel ? String(r.travel).slice(0, 80) : null,
        r.bleed ? String(r.bleed).slice(0, 80) : null,
        toInt(r.order_index, 0)
      );
    }

    // free lists
    clear("world_languages");
    const insLang = db.prepare(`INSERT INTO world_languages (world_id, value) VALUES (?, ?)`);
    for (const v of arr<string>(body.languages)) insLang.run(world_id, String(v).trim());

    clear("world_deities");
    const insDeity = db.prepare(`INSERT INTO world_deities (world_id, value) VALUES (?, ?)`);
    for (const v of arr<string>(body.deities)) insDeity.run(world_id, String(v).trim());

    clear("world_factions");
    const insFaction = db.prepare(`INSERT INTO world_factions (world_id, value) VALUES (?, ?)`);
    for (const v of arr<string>(body.factions)) insFaction.run(world_id, String(v).trim());

    // catalogs: races / creatures
    clear("world_race_catalog");
    const race_ids = new Set<number>();
    for (const id of arr<number>(body.race_ids)) if (Number.isFinite(id)) race_ids.add(Number(id));
    for (const nm of arr<string>(body.race_names)) {
      const id = idByName("races", nm);
      if (id) race_ids.add(id);
    }
    const insWRC = db.prepare(`INSERT INTO world_race_catalog (world_id, race_id) VALUES (?, ?)`);
    for (const id of race_ids) insWRC.run(world_id, id);

    clear("world_creature_catalog");
    const creature_ids = new Set<number>();
    for (const id of arr<number>(body.creature_ids)) if (Number.isFinite(id)) creature_ids.add(Number(id));
    for (const nm of arr<string>(body.creature_names)) {
      const id = idByName("creatures", nm);
      if (id) creature_ids.add(id);
    }
    const insWCC = db.prepare(`INSERT INTO world_creature_catalog (world_id, creature_id) VALUES (?, ?)`);
    for (const id of creature_ids) insWCC.run(world_id, id);

    db.exec("COMMIT");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    try {
      db.exec("ROLLBACK");
    } catch {}
    return bad(err.message || "Failed to save world details", 500);
  }
}

// ---------- DELETE ----------
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const world_id = toInt(url.searchParams.get("world_id"));
    if (!world_id) return bad("world_id is required");

    ensureWorldExists(world_id);

    db.exec("BEGIN");
    const tables = [
      "world_details",
      "world_tags",
      "world_moons",
      "world_months",
      "world_weekdays",
      "world_climates",
      "world_magic_systems",
      "world_magic_customs",
      "world_unbreakables",
      "world_bans",
      "world_tone_flags",
      "world_realms",
      "world_languages",
      "world_deities",
      "world_factions",
      "world_race_catalog",
      "world_creature_catalog",
    ];
    for (const t of tables) {
      db.prepare(`DELETE FROM ${t} WHERE world_id = ?`).run(world_id);
    }
    db.exec("COMMIT");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    try {
      db.exec("ROLLBACK");
    } catch {}
    return bad(err.message || "Failed to delete world details", 500);
  }
}
