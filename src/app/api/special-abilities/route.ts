import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/special-abilities
 * Body: {
 *   scaling: {
 *     skill_id, ability_type, prerequisites|null, scaling_method, scaling_details
 *   },
 *   requirements: {
 *     skill_id, stage1_tag|null, stage1_desc|null, stage1_points|null,
 *     stage2_tag|null, stage2_desc|null, stage2_points|null,
 *     stage3_tag|null, stage3_desc|null,
 *     stage4_tag|null, stage4_desc|null,
 *     final_tag|null, final_desc|null,
 *     add1_tag|null, add1_desc|null, ... up to add4_*
 *     saved_at (ISO)
 *   }
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sc = body?.scaling ?? {};
    const rq = body?.requirements ?? {};
    const skillIdS = Number(sc.skill_id ?? rq.skill_id ?? 0);
    if (!Number.isInteger(skillIdS) || skillIdS <= 0) {
      return NextResponse.json({ ok: false, error: "skill_id required (int)" }, { status: 400 });
    }

    // UPSERT scaling
    const insScaling = db.prepare(`
      INSERT INTO special_ability_scaling (
        skill_id, ability_type, prerequisites, scaling_method, scaling_details, saved_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(skill_id) DO UPDATE SET
        ability_type=excluded.ability_type,
        prerequisites=excluded.prerequisites,
        scaling_method=excluded.scaling_method,
        scaling_details=excluded.scaling_details,
        saved_at=excluded.saved_at
    `);
    insScaling.run(
      skillIdS,
      String(sc.ability_type || "Utility"),
      sc.prerequisites ? String(sc.prerequisites) : null,
      String(sc.scaling_method || "Point-Based"),
      String(sc.scaling_details || ""),
      String(sc.saved_at ?? new Date().toISOString())
    );

    // UPSERT requirements
const insReq = db.prepare(`
  INSERT INTO special_ability_requirements (
    skill_id,
    stage1_tag, stage1_desc, stage1_points,
    stage2_tag, stage2_desc, stage2_points,
    stage3_tag, stage3_desc,
    stage4_tag, stage4_desc,
    final_tag, final_desc,
    add1_tag, add1_desc,
    add2_tag, add2_desc,
    add3_tag, add3_desc,
    add4_tag, add4_desc,
    saved_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)   -- <-- 22 placeholders
  ON CONFLICT(skill_id) DO UPDATE SET
    stage1_tag=excluded.stage1_tag, stage1_desc=excluded.stage1_desc, stage1_points=excluded.stage1_points,
    stage2_tag=excluded.stage2_tag, stage2_desc=excluded.stage2_desc, stage2_points=excluded.stage2_points,
    stage3_tag=excluded.stage3_tag, stage3_desc=excluded.stage3_desc,
    stage4_tag=excluded.stage4_tag, stage4_desc=excluded.stage4_desc,
    final_tag=excluded.final_tag, final_desc=excluded.final_desc,
    add1_tag=excluded.add1_tag, add1_desc=excluded.add1_desc,
    add2_tag=excluded.add2_tag, add2_desc=excluded.add2_desc,
    add3_tag=excluded.add3_tag, add3_desc=excluded.add3_desc,
    add4_tag=excluded.add4_tag, add4_desc=excluded.add4_desc,
    saved_at=excluded.saved_at
`);


    const R = rq || {};
    const nil = (v: any) => (v === undefined || v === null || v === "" ? null : String(v));

    insReq.run(
      skillIdS,
      nil(R.stage1_tag),  nil(R.stage1_desc),  nil(R.stage1_points),
      nil(R.stage2_tag),  nil(R.stage2_desc),  nil(R.stage2_points),
      nil(R.stage3_tag),  nil(R.stage3_desc),
      nil(R.stage4_tag),  nil(R.stage4_desc),
      nil(R.final_tag),   nil(R.final_desc),
      nil(R.add1_tag),    nil(R.add1_desc),
      nil(R.add2_tag),    nil(R.add2_desc),
      nil(R.add3_tag),    nil(R.add3_desc),
      nil(R.add4_tag),    nil(R.add4_desc),
      String(R.saved_at ?? new Date().toISOString())
    );

    // return the joined snapshot
    const snapshot = db.prepare(`
      SELECT s.id AS skill_id, s.name AS skill_name, s.type AS skill_type,
             sas.*, sar.*
      FROM skills s
      LEFT JOIN special_ability_scaling sas ON sas.skill_id = s.id
      LEFT JOIN special_ability_requirements sar ON sar.skill_id = s.id
      WHERE s.id = ?
    `).get(skillIdS);

    return NextResponse.json({ ok: true, item: snapshot });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
