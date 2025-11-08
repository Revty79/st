import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { getSessionUser } from "@/server/session";
import { apiSuccess, ApiErrors, withErrorHandling, validateRequiredFields } from "@/lib/api-utils";
import { toInt, toStringOrNull, toFloat } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "items";
const COLS = [
  "name","timeline_tag","cost_credits","category","subtype",
  "genre_tags","mechanical_effect","weight","narrative_notes",
] as const;
type Col = typeof COLS[number];

interface ItemData {
  name?: string;
  timeline_tag?: string | null;
  cost_credits?: number | null;
  category?: string | null;
  subtype?: string | null;
  genre_tags?: string | null;
  mechanical_effect?: string | null;
  weight?: number | null;
  narrative_notes?: string | null;
}

function extractItemFields(body: any): Partial<ItemData> {
  const fields: Partial<ItemData> = {};
  
  for (const col of COLS) {
    if (!(col in body)) continue;
    
    switch (col) {
      case "cost_credits":
        fields[col] = toInt(body[col]);
        break;
      case "weight":
        fields[col] = toFloat(body[col]);
        break;
      case "name":
        fields[col] = toStringOrNull(body[col]) || "";
        break;
      default:
        // Handle other string fields properly
        if (col === "timeline_tag" || col === "category" || col === "subtype" || 
            col === "genre_tags" || col === "mechanical_effect" || col === "narrative_notes") {
          (fields as any)[col] = toStringOrNull(body[col]);
        }
    }
  }
  
  return fields;
}

export const GET = withErrorHandling(async () => {
  const rows = db.prepare(`SELECT * FROM ${TABLE} ORDER BY id DESC`).all();
  return apiSuccess({ rows });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  
  // Validate required fields
  const missing = validateRequiredFields(body, ["name"]);
  if (missing.length > 0) {
    return ApiErrors.missingFields(missing);
  }
  
  const user = await getSessionUser();
  const name = String(body.name).trim();
  
  if (!name) {
    return ApiErrors.validationError("Name cannot be empty");
  }
  
  const info = db.prepare(`INSERT INTO ${TABLE} (name, created_by_id) VALUES (?, ?)`).run(name, user?.id ?? null);
  const row = db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`).get(info.lastInsertRowid);
  
  return apiSuccess({ row }, "Item created successfully", 201);
});

export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const id = toInt(body?.id);
  
  if (!id) {
    return ApiErrors.validationError("Valid ID is required");
  }

  const fields = extractItemFields(body);
  const keys = Object.keys(fields) as Col[];
  
  if (keys.length === 0) {
    return apiSuccess({ updated: 0 }, "No fields to update");
  }

  const sql = `UPDATE ${TABLE} SET ${keys.map((k) => `${k}=@${k}`).join(", ")} WHERE id=@id`;
  const info = db.prepare(sql).run({ ...fields, id });
  const row = db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`).get(id);
  
  return apiSuccess({ updated: info.changes ?? 0, row }, "Item updated successfully");
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const id = toInt(new URL(req.url).searchParams.get("id"));
  
  if (!id) {
    return ApiErrors.validationError("Valid ID is required");
  }
  
  const info = db.prepare(`DELETE FROM ${TABLE} WHERE id = ?`).run(id);
  return apiSuccess({ deleted: info.changes ?? 0 }, "Item deleted successfully");
});
