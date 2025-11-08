import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (data: any, init?: number | ResponseInit) => NextResponse.json(data, init as any);

type WorldRow = {
  id: number; name: string; description: string | null; created_at: string; updated_at: string;
};
type EraRow = {
  id: number; world_id: number; name: string; description: string | null;
  start_year: number | null; end_year: number | null; color: string | null; order_index: number;
};
type SettingRow = {
  id: number; world_id: number; era_id: number | null; name: string; description: string | null;
  start_year: number | null; end_year: number | null;
};
type MarkerRow = {
  id: number; world_id: number; era_id: number | null; name: string; description: string | null;
  year: number | null;
};

function getWorldWithChildren(worldId: number) {
  const w = db.prepare("SELECT * FROM worlds WHERE id = ?").get(worldId) as WorldRow | undefined;
  if (!w) return null;

  const eras = db
    .prepare("SELECT * FROM eras WHERE world_id = ? ORDER BY order_index ASC, id ASC")
    .all(worldId) as EraRow[];

  const settings = db
    .prepare("SELECT * FROM settings WHERE world_id = ?")
    .all(worldId) as SettingRow[];

  const markers = db
    .prepare("SELECT * FROM markers WHERE world_id = ?")
    .all(worldId) as MarkerRow[];

  return { ...w, eras, settings, markers };
}

function getAllWorldsWithChildren() {
  const worlds = db.prepare("SELECT * FROM worlds ORDER BY id DESC").all() as WorldRow[];
  // guard against any `null` from getWorldWithChildren (paranoia, keeps UI happy)
  return worlds.map((w) => getWorldWithChildren(w.id)).filter(Boolean);
}

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

// ---------- GET /api/world ----------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const world = getWorldWithChildren(Number(id));
      if (!world) return json({ ok: false, error: "World not found" }, { status: 404 });
      return json({ ok: true, data: world });
    }

    const data = getAllWorldsWithChildren();
    return json({ ok: true, data });
  } catch (err: any) {
    console.error("GET /api/world error:", err);
    return json({ ok: false, error: "Failed to fetch worlds." }, { status: 500 });
  }
}

// ---------- POST /api/world ----------
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const op = String(body?.op ?? "").trim();

    if (!op) return json({ ok: false, error: "Missing op" }, { status: 400 });

    // worlds ---------
    if (op === "createWorld") {
      const name = String(required(body.name, "name")).trim();
      const description = typeof body.description === "string" ? body.description : null;

      const dupe = db.prepare("SELECT 1 FROM worlds WHERE lower(name)=lower(?)").get(name);
      if (dupe) return json({ ok: false, error: "World name already exists." }, { status: 409 });

      const info = db
        .prepare(`INSERT INTO worlds (name, description, created_by_id) VALUES (?,?,NULL)`)
        .run(name, description);

      const created = getWorldWithChildren(Number(info.lastInsertRowid));
      return json({ ok: true, data: created }, { status: 201 });
    }

    if (op === "updateWorld") {
      const id = Number(required(body.id, "id"));
      const name = body.name !== undefined ? String(body.name).trim() : undefined;
      const description =
        body.description === undefined
          ? undefined
          : typeof body.description === "string"
          ? body.description
          : null;

      const exists = db.prepare("SELECT * FROM worlds WHERE id = ?").get(id) as WorldRow | undefined;
      if (!exists) return json({ ok: false, error: "World not found" }, { status: 404 });

      if (name && name.toLowerCase() !== (exists.name ?? "").toLowerCase()) {
        const dupe = db
          .prepare("SELECT 1 FROM worlds WHERE lower(name)=lower(?) AND id<>?")
          .get(name, id);
        if (dupe) return json({ ok: false, error: "World name already exists." }, { status: 409 });
      }

      const sets: string[] = [];
      const vals: any[] = [];
      if (name !== undefined) { sets.push("name = ?"); vals.push(name); }
      if (description !== undefined) { sets.push("description = ?"); vals.push(description); }
      if (sets.length) {
        db.prepare(`UPDATE worlds SET ${sets.join(", ")} WHERE id = ?`).run(...vals, id);
      }

      const updated = getWorldWithChildren(id);
      return json({ ok: true, data: updated });
    }

    if (op === "deleteWorld") {
      const id = Number(required(body.id, "id"));
      const done = db.prepare("DELETE FROM worlds WHERE id = ?").run(id);
      if (!done.changes) return json({ ok: false, error: "World not found" }, { status: 404 });
      return json({ ok: true, data: { id } });
    }

    // eras ----------
    if (op === "createEra") {
      const worldId = Number(required(body.worldId, "worldId"));
      const name = String(required(body.name, "name")).trim();
      const description = typeof body.description === "string" ? body.description : null;
      const startYear = toIntOrNull(body.startYear);
      const endYear = toIntOrNull(body.endYear);
      const color = typeof body.color === "string" ? body.color : "#8b5cf6";

      const maxOrder = db
        .prepare("SELECT COALESCE(MAX(order_index), -1) AS m FROM eras WHERE world_id = ?")
        .get(worldId) as { m: number };
      const orderIndex = (maxOrder?.m ?? -1) + 1;

      db.prepare(
        `INSERT INTO eras (world_id, name, description, start_year, end_year, color, order_index)
         VALUES (?,?,?,?,?,?,?)`
      ).run(worldId, name, description, startYear, endYear, color, orderIndex);

      const world = getWorldWithChildren(worldId);
      return json({ ok: true, data: world }, { status: 201 });
    }

    if (op === "updateEra") {
      const id = Number(required(body.id, "id"));
      const row = db.prepare("SELECT * FROM eras WHERE id=?").get(id) as EraRow | undefined;
      if (!row) return json({ ok: false, error: "Era not found" }, { status: 404 });

      const name = body.name === undefined ? undefined : String(body.name).trim();
      const description =
        body.description === undefined
          ? undefined
          : typeof body.description === "string"
          ? body.description
          : null;
      const startYear = body.startYear === undefined ? undefined : toIntOrNull(body.startYear);
      const endYear = body.endYear === undefined ? undefined : toIntOrNull(body.endYear);
      const color = body.color === undefined ? undefined : typeof body.color === "string" ? body.color : null;

      const sets: string[] = [];
      const vals: any[] = [];
      if (name !== undefined) { sets.push("name=?"); vals.push(name); }
      if (description !== undefined) { sets.push("description=?"); vals.push(description); }
      if (startYear !== undefined) { sets.push("start_year=?"); vals.push(startYear); }
      if (endYear !== undefined) { sets.push("end_year=?"); vals.push(endYear); }
      if (color !== undefined) { sets.push("color=?"); vals.push(color); }

      if (sets.length) db.prepare(`UPDATE eras SET ${sets.join(", ")} WHERE id = ?`).run(...vals, id);

      const world = getWorldWithChildren(row.world_id);
      return json({ ok: true, data: world });
    }

    if (op === "moveEra") {
      const id = Number(required(body.id, "id"));
      const dir = Number(required(body.dir, "dir")); // -1 or 1

      const e = db.prepare("SELECT * FROM eras WHERE id=?").get(id) as EraRow | undefined;
      if (!e) return json({ ok: false, error: "Era not found" }, { status: 404 });

      const list = db
        .prepare("SELECT id, order_index FROM eras WHERE world_id=? ORDER BY order_index ASC, id ASC")
        .all(e.world_id) as { id: number; order_index: number }[];

      const idx = list.findIndex((r) => r.id === id);
      const swapIdx = idx + (dir < 0 ? -1 : 1);
      if (swapIdx < 0 || swapIdx >= list.length) {
        const world = getWorldWithChildren(e.world_id);
        return json({ ok: true, data: world }); // no-op
      }

      const a = list[idx], b = list[swapIdx];
      db.prepare("UPDATE eras SET order_index=? WHERE id=?").run(b.order_index, a.id);
      db.prepare("UPDATE eras SET order_index=? WHERE id=?").run(a.order_index, b.id);

      const world = getWorldWithChildren(e.world_id);
      return json({ ok: true, data: world });
    }

    if (op === "deleteEra") {
      const id = Number(required(body.id, "id"));
      const e = db.prepare("SELECT * FROM eras WHERE id=?").get(id) as EraRow | undefined;
      if (!e) return json({ ok: false, error: "Era not found" }, { status: 404 });

      db.prepare("DELETE FROM eras WHERE id=?").run(id);

      const eras = db
        .prepare("SELECT id FROM eras WHERE world_id=? ORDER BY order_index ASC, id ASC")
        .all(e.world_id) as { id: number }[];
      eras.forEach((row, i) => {
        db.prepare("UPDATE eras SET order_index=? WHERE id=?").run(i, row.id);
      });

      const world = getWorldWithChildren(e.world_id);
      return json({ ok: true, data: world });
    }

    // settings --------
    if (op === "createSetting") {
      const worldId = Number(required(body.worldId, "worldId"));
      const name = String(required(body.name, "name")).trim();
      const description = typeof body.description === "string" ? body.description : null;
      const eraId = body.eraId === null ? null : toIntOrNull(body.eraId);
      const startYear = toIntOrNull(body.startYear);
      const endYear = toIntOrNull(body.endYear);

      db.prepare(
        `INSERT INTO settings (world_id, era_id, name, description, start_year, end_year)
         VALUES (?,?,?,?,?,?)`
      ).run(worldId, eraId, name, description, startYear, endYear);

      const world = getWorldWithChildren(worldId);
      return json({ ok: true, data: world }, { status: 201 });
    }

    if (op === "updateSetting") {
      const id = Number(required(body.id, "id"));
      const s = db.prepare("SELECT * FROM settings WHERE id=?").get(id) as SettingRow | undefined;
      if (!s) return json({ ok: false, error: "Setting not found" }, { status: 404 });

      const name = body.name === undefined ? undefined : String(body.name).trim();
      const description =
        body.description === undefined
          ? undefined
          : typeof body.description === "string"
          ? body.description
          : null;
      const eraId =
        body.eraId === undefined ? undefined : body.eraId === null ? null : toIntOrNull(body.eraId);
      const startYear = body.startYear === undefined ? undefined : toIntOrNull(body.startYear);
      const endYear = body.endYear === undefined ? undefined : toIntOrNull(body.endYear);

      const sets: string[] = [];
      const vals: any[] = [];
      if (name !== undefined) { sets.push("name=?"); vals.push(name); }
      if (description !== undefined) { sets.push("description=?"); vals.push(description); }
      if (eraId !== undefined) { sets.push("era_id=?"); vals.push(eraId); }
      if (startYear !== undefined) { sets.push("start_year=?"); vals.push(startYear); }
      if (endYear !== undefined) { sets.push("end_year=?"); vals.push(endYear); }

      if (sets.length) db.prepare(`UPDATE settings SET ${sets.join(", ")} WHERE id=?`).run(...vals, id);

      const world = getWorldWithChildren(s.world_id);
      return json({ ok: true, data: world });
    }

    if (op === "deleteSetting") {
      const id = Number(required(body.id, "id"));
      const s = db.prepare("SELECT * FROM settings WHERE id=?").get(id) as SettingRow | undefined;
      if (!s) return json({ ok: false, error: "Setting not found" }, { status: 404 });

      db.prepare("DELETE FROM settings WHERE id=?").run(id);
      const world = getWorldWithChildren(s.world_id);
      return json({ ok: true, data: world });
    }

    // markers ---------
    if (op === "createMarker") {
      const worldId = Number(required(body.worldId, "worldId"));
      const name = String(required(body.name, "name")).trim();
      const description = typeof body.description === "string" ? body.description : null;
      const eraId = body.eraId === null ? null : toIntOrNull(body.eraId);
      const year = toIntOrNull(body.year);

      db.prepare(
        `INSERT INTO markers (world_id, era_id, name, description, year)
         VALUES (?,?,?,?,?)`
      ).run(worldId, eraId, name, description, year);

      const world = getWorldWithChildren(worldId);
      return json({ ok: true, data: world }, { status: 201 });
    }

    if (op === "updateMarker") {
      const id = Number(required(body.id, "id"));
      const m = db.prepare("SELECT * FROM markers WHERE id=?").get(id) as MarkerRow | undefined;
      if (!m) return json({ ok: false, error: "Marker not found" }, { status: 404 });

      const name = body.name === undefined ? undefined : String(body.name).trim();
      const description =
        body.description === undefined
          ? undefined
          : typeof body.description === "string"
          ? body.description
          : null;
      const eraId =
        body.eraId === undefined ? undefined : body.eraId === null ? null : toIntOrNull(body.eraId);
      const year = body.year === undefined ? undefined : toIntOrNull(body.year);

      const sets: string[] = [];
      const vals: any[] = [];
      if (name !== undefined) { sets.push("name=?"); vals.push(name); }
      if (description !== undefined) { sets.push("description=?"); vals.push(description); }
      if (eraId !== undefined) { sets.push("era_id=?"); vals.push(eraId); }
      if (year !== undefined) { sets.push("year=?"); vals.push(year); }

      if (sets.length) db.prepare(`UPDATE markers SET ${sets.join(", ")} WHERE id=?`).run(...vals, id);

      const world = getWorldWithChildren(m.world_id);
      return json({ ok: true, data: world });
    }

    if (op === "deleteMarker") {
      const id = Number(required(body.id, "id"));
      const m = db.prepare("SELECT * FROM markers WHERE id=?").get(id) as MarkerRow | undefined;
      if (!m) return json({ ok: false, error: "Marker not found" }, { status: 404 });

      db.prepare("DELETE FROM markers WHERE id=?").run(id);
      const world = getWorldWithChildren(m.world_id);
      return json({ ok: true, data: world });
    }

    // fallback
    return json({ ok: false, error: `Unknown op: ${op}` }, { status: 400 });
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    console.error("POST /api/world error:", err);
    return json({ ok: false, error: msg || "Operation failed." }, { status: 400 });
  }
}
