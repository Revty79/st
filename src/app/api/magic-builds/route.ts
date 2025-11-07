import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/magic-builds
 * Body: {
 *  skill_id, skill_name, tradition, tier2_path|null,
 *  containers_json, modifiers_json,
 *  mana_cost, casting_time, mastery_level,
 *  notes|null, flavor_line|null, saved_at (ISO)
 * }
 * Server will also derive a few human-readable rollups when possible.
 */
export async function POST(req: Request) {
  try {
    const b = await req.json();

    const skillId = Number(b.skill_id ?? 0);
    if (!Number.isInteger(skillId) || skillId <= 0) {
      return NextResponse.json({ ok: false, error: "skill_id required (int)" }, { status: 400 });
    }

    // Optional rollups from containers_json for user friendliness (best-effort)
    let rangeText: string|null = null;
    let shapeText: string|null = null;
    let durationText: string|null = null;
    let effectsText: string|null = null;
    let containerBreakdown: string|null = null;
    let addonsText: string|null = null;

    try {
      const blocks = JSON.parse(String(b.containers_json || "[]"));
      const ranges = new Set<string>();
      const shapes = new Set<string>();
      const durations = new Set<string>();
      const effects: string[] = [];
      const addons: string[] = [];
      const lines: string[] = [];

      const walk = (n: any, prefix: string) => {
        if (n?.range) ranges.add(n.range);
        if (n?.shape) shapes.add(n.shape);
        if (n?.duration) durations.add(n.duration);
        if (Array.isArray(n?.effects)) {
          n.effects.forEach((e: any) => {
            const nm = e?.name ? String(e.name) : "?";
            const cnt = Number(e?.count ?? 1);
            effects.push(nm + (cnt > 1 ? ` ×${cnt}` : ""));
          });
        }
        const addl: string[] = [];
        if (n?.shape) addl.push(`Shape=${n.shape}(+${Number(n?.addons?.shape_increments || n?.shape_increments || 0)})`);
        if (n?.range) addl.push(`Range=${n.range}`);
        if (n?.duration) addl.push(`Duration=${n.duration}`);
        if ((n?.multi_target ?? 0) > 0) addl.push(`MultiTarget=+${Number(n.multi_target)}`);
        if (addl.length) addons.push(addl.join("; "));
        lines.push(`${prefix || "•"} ${String(n?.container || "Target")}`);
        if (Array.isArray(n?.children)) n.children.forEach((c: any, i: number) => walk(c, prefix ? `${prefix}.${i + 1}` : String(i + 1)));
      };
      if (Array.isArray(blocks)) blocks.forEach((b: any, i: number) => walk(b, String(i + 1)));

      rangeText = ranges.size ? Array.from(ranges).join(", ") : null;
      shapeText = shapes.size ? Array.from(shapes).join(", ") : null;
      durationText = durations.size ? Array.from(durations).join(", ") : null;
      effectsText = effects.length ? effects.join("; ") : null;
      containerBreakdown = lines.length ? lines.join("\n") : null;
      addonsText = addons.length ? addons.join("\n") : null;
    } catch {
      // ignore; keep nulls
    }

    const up = db.prepare(`
      INSERT INTO magic_builds (
        skill_id, tradition, tier2_path,
        containers_json, modifiers_json,
        mana_cost, casting_time, mastery_level,
        range_text, shape_text, duration_text, effects_text,
        container_breakdown, addons_text, notes, flavor_line, progressive_conditions, saved_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(skill_id) DO UPDATE SET
        tradition=excluded.tradition,
        tier2_path=excluded.tier2_path,
        containers_json=excluded.containers_json,
        modifiers_json=excluded.modifiers_json,
        mana_cost=excluded.mana_cost,
        casting_time=excluded.casting_time,
        mastery_level=excluded.mastery_level,
        range_text=excluded.range_text,
        shape_text=excluded.shape_text,
        duration_text=excluded.duration_text,
        effects_text=excluded.effects_text,
        container_breakdown=excluded.container_breakdown,
        addons_text=excluded.addons_text,
        notes=excluded.notes,
        flavor_line=excluded.flavor_line,
        progressive_conditions=excluded.progressive_conditions,
        saved_at=excluded.saved_at
    `);

    up.run(
      skillId,
      String(b.tradition || "spellcraft"),
      b.tier2_path ? String(b.tier2_path) : null,
      String(b.containers_json ?? "[]"),
      String(b.modifiers_json ?? "{}"),
      Number(b.mana_cost ?? 0),
      Number(b.casting_time ?? 0),
      String(b.mastery_level ?? "Apprentice"),
      rangeText,
      shapeText,
      durationText,
      effectsText,
      containerBreakdown,
      addonsText,
      b.notes ? String(b.notes) : null,
      b.flavor_line ? String(b.flavor_line) : null,
      b.progressive_conditions ? String(b.progressive_conditions) : null,
      String(b.saved_at ?? new Date().toISOString())
    );

    // Return joined view for convenience
    const row = db.prepare(`
      SELECT mb.*, s.name AS skill_name
      FROM magic_builds mb
      JOIN skills s ON s.id = mb.skill_id
      WHERE mb.skill_id = ?
    `).get(skillId);

    return NextResponse.json({ ok: true, item: row });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
