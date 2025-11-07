import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "armors";
const COLS = [
  "name","timeline_tag","cost_credits","area_covered","soak","category","atype",
  "genre_tags","weight","encumbrance_penalty","effect","narrative_notes",
] as const;
type Col = typeof COLS[number];

function pick(body: any) {
  const out: Record<string, any> = {};
  for (const k of COLS) if (k in body) out[k] = body[k];
  return out;
}

export async function GET() {
  try {
    const rows = db.prepare(`SELECT * FROM ${TABLE} ORDER BY id DESC`).all();
    return NextResponse.json({ ok: true, rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || !String(name).trim()) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });
    const info = db.prepare(`INSERT INTO ${TABLE} (name) VALUES (?)`).run(String(name).trim());
    const row = db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`).get(info.lastInsertRowid);
    return NextResponse.json({ ok: true, row });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = Number(body?.id);
    if (!Number.isFinite(id)) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const fields = pick(body);
    const keys = Object.keys(fields) as Col[];
    if (keys.length === 0) return NextResponse.json({ ok: true, updated: 0 });

    const sql = `UPDATE ${TABLE} SET ${keys.map((k) => `${k}=@${k}`).join(", ")} WHERE id=@id`;
    const info = db.prepare(sql).run({ ...fields, id });
    const row = db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`).get(id);
    return NextResponse.json({ ok: true, updated: info.changes ?? 0, row });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isFinite(id)) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    const info = db.prepare(`DELETE FROM ${TABLE} WHERE id = ?`).run(id);
    return NextResponse.json({ ok: true, deleted: info.changes ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
