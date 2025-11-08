import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getSessionUser } from "@/server/session";

// Make sure this route never gets cached
export const dynamic = "force-dynamic";

type Attr = "STR"|"DEX"|"CON"|"INT"|"WIS"|"CHA"|"NA";
type SkillType =
  | "standard" | "magic" | "sphere" | "discipline" | "resonance"
  | "spell" | "psionic skill" | "reverberation" | "special ability";

const ATTRS = new Set<Attr>(["STR","DEX","CON","INT","WIS","CHA","NA"]);
const TYPES = new Set<SkillType>([
  "standard","magic","sphere","discipline","resonance",
  "spell","psionic skill","reverberation","special ability",
]);

function cleanTier(t: unknown): number|null {
  if (t === null || t === undefined) return null;
  const n = Number(t);
  return Number.isInteger(n) ? (n >= 1 && n <= 3 ? n : null) : null;
}
function cleanAttr(a: unknown): Attr {
  const s = String(a || "NA").toUpperCase() as Attr;
  return ATTRS.has(s) ? s : "NA";
}
function cleanType(t: unknown): SkillType {
  const s = String(t || "standard").toLowerCase() as SkillType;
  return (TYPES.has(s) ? s : "standard");
}
function asIntOrNull(v: unknown): number|null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function rowToSkill(r: any) {
  return {
    id: r.id,
    name: r.name,
    type: r.type as SkillType,
    tier: r.tier === null ? null : Number(r.tier),
    primary_attribute: r.primary_attribute as Attr,
    secondary_attribute: r.secondary_attribute as Attr,
    definition: r.definition ?? "",
    parent_id: r.parent_id,
    parent2_id: r.parent2_id,
    parent3_id: r.parent3_id,
    created_by: r.created_by_username ? { username: r.created_by_username } : null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

/** GET /api/skills  -> list all (simple) */
export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT s.*,
             u.username AS created_by_username
      FROM skills s
      LEFT JOIN users u ON u.id = s.created_by_id
      ORDER BY s.id DESC
    `);
    const rows = stmt.all();
    return NextResponse.json({ ok: true, items: rows.map(rowToSkill) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

/** POST /api/skills  -> create one (used by "New") */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "(unnamed)");
    const type = cleanType(body.type);
    const tier = cleanTier(body.tier ?? 1);
    const pa = cleanAttr(body.primary_attribute ?? "STR");
    const sa = cleanAttr(body.secondary_attribute ?? "NA");
    const definition = String(body.definition ?? "");

    const user = await getSessionUser();
    const userId = user?.id ?? null;

    const ins = db.prepare(`
      INSERT INTO skills (name, type, tier, primary_attribute, secondary_attribute, definition, created_by_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = ins.run(name, type, tier, pa, sa, definition, userId);

    const sel = db.prepare(`
      SELECT s.*, u.username AS created_by_username
      FROM skills s
      LEFT JOIN users u ON u.id = s.created_by_id
      WHERE s.id = ?
    `);
    const row = sel.get(info.lastInsertRowid);
    return NextResponse.json({ ok: true, item: rowToSkill(row) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

/** PATCH /api/skills  -> update (UI sends {id, patch}) */
export async function PATCH(req: Request) {
  try {
    const { id, patch } = await req.json();
    const skillId = asIntOrNull(id);
    if (skillId === null) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });

    // sanitize fields we allow
    const name = patch?.name !== undefined ? String(patch.name) : undefined;
    const type = patch?.type !== undefined ? cleanType(patch.type) : undefined;
    const tier = patch?.tier !== undefined ? cleanTier(patch.tier) : undefined;
    const pa   = patch?.primary_attribute !== undefined ? cleanAttr(patch.primary_attribute) : undefined;
    const sa   = patch?.secondary_attribute !== undefined ? cleanAttr(patch.secondary_attribute) : undefined;
    const defn = patch?.definition !== undefined ? String(patch.definition ?? "") : undefined;

    // parent ordering & de-duplication
    let p1 = patch?.parent_id;   let p2 = patch?.parent2_id;   let p3 = patch?.parent3_id;
    const ordered = [p1, p2, p3].filter(v => v !== undefined && v !== null && v !== "").map(String)
      .filter((v, i, a) => a.indexOf(v) === i);
    const self = String(skillId);
    const safeParents = ordered.filter(v => v !== self).slice(0, 3);
    p1 = asIntOrNull(safeParents[0]);
    p2 = asIntOrNull(safeParents[1]);
    p3 = asIntOrNull(safeParents[2]);

    // build dynamic update
    const sets: string[] = [];
    const vals: any[] = [];
    if (name !== undefined) { sets.push("name = ?"); vals.push(name); }
    if (type !== undefined) { sets.push("type = ?"); vals.push(type); }
    if (tier !== undefined) { sets.push("tier = ?"); vals.push(tier); }
    if (pa   !== undefined) { sets.push("primary_attribute = ?"); vals.push(pa); }
    if (sa   !== undefined) { sets.push("secondary_attribute = ?"); vals.push(sa); }
    if (defn !== undefined) { sets.push("definition = ?"); vals.push(defn); }
    if (patch?.parent_id !== undefined || patch?.parent2_id !== undefined || patch?.parent3_id !== undefined) {
      sets.push("parent_id = ?");  vals.push(p1);
      sets.push("parent2_id = ?"); vals.push(p2);
      sets.push("parent3_id = ?"); vals.push(p3);
    }
    if (!sets.length) return NextResponse.json({ ok: true, item: null }); // nothing to do

    const sql = `UPDATE skills SET ${sets.join(", ")} WHERE id = ?`;
    vals.push(skillId);
    db.prepare(sql).run(...vals);

    const sel = db.prepare(`
      SELECT s.*, u.username AS created_by_username
      FROM skills s
      LEFT JOIN users u ON u.id = s.created_by_id
      WHERE s.id = ?
    `);
    const row = sel.get(skillId);
    return NextResponse.json({ ok: true, item: rowToSkill(row) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

/** DELETE /api/skills?id=123 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = asIntOrNull(searchParams.get("id"));
    if (id === null) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });

    const del = db.prepare(`DELETE FROM skills WHERE id = ?`);
    const info = del.run(id);
    return NextResponse.json({ ok: true, deleted: info.changes > 0 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
