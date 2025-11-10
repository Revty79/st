import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getSessionUser } from "@/server/session";

export const dynamic = "force-dynamic";

// Settings API route handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eraId = searchParams.get("eraId");
    const worldId = searchParams.get("worldId");
    const settingId = searchParams.get("id");

    if (settingId) {
      // Get single setting
      const setting = db.prepare(`
        SELECT s.*, e.name as era_name, w.name as world_name
        FROM settings s
        LEFT JOIN eras e ON s.era_id = e.id
        LEFT JOIN worlds w ON s.world_id = w.id
        WHERE s.id = ?
      `).get(settingId);

      if (!setting) {
        return NextResponse.json({ ok: false, error: "Setting not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, data: setting });
    }

    if (eraId) {
      // Get settings for specific era
      const settings = db.prepare(`
        SELECT s.*, e.name as era_name, w.name as world_name
        FROM settings s
        LEFT JOIN eras e ON s.era_id = e.id
        LEFT JOIN worlds w ON s.world_id = w.id
        WHERE s.era_id = ?
        ORDER BY s.name
      `).all(eraId);

      return NextResponse.json({ ok: true, data: settings });
    }

    if (worldId) {
      // Get all settings for world
      const settings = db.prepare(`
        SELECT s.*, e.name as era_name, w.name as world_name
        FROM settings s
        LEFT JOIN eras e ON s.era_id = e.id
        LEFT JOIN worlds w ON s.world_id = w.id
        WHERE s.world_id = ?
        ORDER BY s.name
      `).all(worldId);

      return NextResponse.json({ ok: true, data: settings });
    }

    return NextResponse.json({ ok: false, error: "Missing required parameters" }, { status: 400 });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { op } = body;

    if (op === "create") {
      const { worldId, eraId, name, description } = body;

      if (!worldId || !name) {
        return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
      }

      const result = db.prepare(`
        INSERT INTO settings (world_id, era_id, name, description)
        VALUES (?, ?, ?, ?)
      `).run(worldId, eraId || null, name, description || null);

      const setting = db.prepare(`
        SELECT s.*, e.name as era_name, w.name as world_name
        FROM settings s
        LEFT JOIN eras e ON s.era_id = e.id
        LEFT JOIN worlds w ON s.world_id = w.id
        WHERE s.id = ?
      `).get(result.lastInsertRowid);

      return NextResponse.json({ ok: true, data: setting });
    }

    if (op === "update") {
      const { id, name, description, eraId, startYear, endYear } = body;

      if (!id) {
        return NextResponse.json({ ok: false, error: "Missing setting ID" }, { status: 400 });
      }

      db.prepare(`
        UPDATE settings 
        SET name = ?, description = ?, era_id = ?, start_year = ?, end_year = ?
        WHERE id = ?
      `).run(name, description, eraId || null, startYear || null, endYear || null, id);

      const setting = db.prepare(`
        SELECT s.*, e.name as era_name, w.name as world_name
        FROM settings s
        LEFT JOIN eras e ON s.era_id = e.id
        LEFT JOIN worlds w ON s.world_id = w.id
        WHERE s.id = ?
      `).get(id);

      return NextResponse.json({ ok: true, data: setting });
    }

    return NextResponse.json({ ok: false, error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing setting ID" }, { status: 400 });
    }

    db.prepare("DELETE FROM settings WHERE id = ?").run(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}