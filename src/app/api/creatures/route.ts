import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db"; // <- your existing better-sqlite3 instance
import { getSessionUser } from "@/server/session";

type Row = {
  id: number;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;

  name: string;
  alt_names: string | null;
  challenge_rating: string | null;
  encounter_scale: string | null;
  type: string | null;
  role: string | null;
  genre_tags: string | null;
  description_short: string | null;

  size: string | null;
  strength: number | null;
  dexterity: number | null;
  constitution: number | null;
  intelligence: number | null;
  wisdom: number | null;
  charisma: number | null;

  hp_total: number | null;
  hp_by_location: string | null;
  initiative: number | null;
  armor_soak: string | null;

  attack_modes: string | null;
  damage: string | null;
  range_text: string | null;

  special_abilities: string | null;
  magic_resonance_interaction: string | null;
  behavior_tactics: string | null;
  habitat: string | null;
  diet: string | null;
  variants: string | null;
  loot_harvest: string | null;
  story_hooks: string | null;
  notes: string | null;
};

type Payload = Partial<Omit<Row, "id" | "created_at" | "updated_at">> & {
  id?: number;
  name?: string;
};

// ---- helpers ----
function mapRow(r: any): Row {
  return {
    id: r.id,
    created_by_id: r.created_by_id ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,

    name: r.name,
    alt_names: r.alt_names ?? null,
    challenge_rating: r.challenge_rating ?? null,
    encounter_scale: r.encounter_scale ?? null,
    type: r.type ?? null,
    role: r.role ?? null,
    genre_tags: r.genre_tags ?? null,
    description_short: r.description_short ?? null,

    size: r.size ?? null,
    strength: r.strength ?? null,
    dexterity: r.dexterity ?? null,
    constitution: r.constitution ?? null,
    intelligence: r.intelligence ?? null,
    wisdom: r.wisdom ?? null,
    charisma: r.charisma ?? null,

    hp_total: r.hp_total ?? null,
    hp_by_location: r.hp_by_location ?? null,
    initiative: r.initiative ?? null,
    armor_soak: r.armor_soak ?? null,

    attack_modes: r.attack_modes ?? null,
    damage: r.damage ?? null,
    range_text: r.range_text ?? null,

    special_abilities: r.special_abilities ?? null,
    magic_resonance_interaction: r.magic_resonance_interaction ?? null,
    behavior_tactics: r.behavior_tactics ?? null,
    habitat: r.habitat ?? null,
    diet: r.diet ?? null,
    variants: r.variants ?? null,
    loot_harvest: r.loot_harvest ?? null,
    story_hooks: r.story_hooks ?? null,
    notes: r.notes ?? null,
  };
}

// ============================
// GET /api/creatures
// - list (with optional ?q= search by name)
// - by id: ?id=123
// ============================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  try {
    if (id) {
      const row = db.prepare("SELECT * FROM creatures WHERE id = ?").get(id);
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(mapRow(row));
    }

    let sql = "SELECT * FROM creatures";
    const params: any[] = [];
    if (q) {
      sql += " WHERE lower(name) LIKE ?";
      params.push(`%${q}%`);
    }
    sql += " ORDER BY name ASC LIMIT 1000";

    const rows = db.prepare(sql).all(...params).map(mapRow);
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

// ============================
// POST /api/creatures
// - create if no id (name required, must be unique)
// - update if id present (upsert-by-id style)
// returns the full row
// ============================
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;
    const {
      id,

      // identity
      name,
      alt_names,
      challenge_rating,
      encounter_scale,
      type,
      role,
      genre_tags,
      description_short,

      // stats
      size,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      hp_total,
      hp_by_location,
      initiative,
      armor_soak,

      // combat
      attack_modes,
      damage,
      range_text,

      // behavior
      special_abilities,
      magic_resonance_interaction,
      behavior_tactics,
      habitat,
      diet,
      variants,
      loot_harvest,
      story_hooks,
      notes,
    } = body;

    if (id) {
      // update by id
      const exists = db.prepare("SELECT id FROM creatures WHERE id = ?").get(id);
      if (!exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const stmt = db.prepare(`
        UPDATE creatures SET
          name = COALESCE(@name, name),
          alt_names = @alt_names,
          challenge_rating = @challenge_rating,
          encounter_scale = @encounter_scale,
          type = @type,
          role = @role,
          genre_tags = @genre_tags,
          description_short = @description_short,

          size = @size,
          strength = @strength,
          dexterity = @dexterity,
          constitution = @constitution,
          intelligence = @intelligence,
          wisdom = @wisdom,
          charisma = @charisma,

          hp_total = @hp_total,
          hp_by_location = @hp_by_location,
          initiative = @initiative,
          armor_soak = @armor_soak,

          attack_modes = @attack_modes,
          damage = @damage,
          range_text = @range_text,

          special_abilities = @special_abilities,
          magic_resonance_interaction = @magic_resonance_interaction,
          behavior_tactics = @behavior_tactics,
          habitat = @habitat,
          diet = @diet,
          variants = @variants,
          loot_harvest = @loot_harvest,
          story_hooks = @story_hooks,
          notes = @notes
        WHERE id = @id
      `);

      try {
        stmt.run({
          id,
          name: name ?? null,
          alt_names: alt_names ?? null,
          challenge_rating: challenge_rating ?? null,
          encounter_scale: encounter_scale ?? null,
          type: type ?? null,
          role: role ?? null,
          genre_tags: genre_tags ?? null,
          description_short: description_short ?? null,

          size: size ?? null,
          strength: strength ?? null,
          dexterity: dexterity ?? null,
          constitution: constitution ?? null,
          intelligence: intelligence ?? null,
          wisdom: wisdom ?? null,
          charisma: charisma ?? null,

          hp_total: hp_total ?? null,
          hp_by_location: hp_by_location ?? null,
          initiative: initiative ?? null,
          armor_soak: armor_soak ?? null,

          attack_modes: attack_modes ?? null,
          damage: damage ?? null,
          range_text: range_text ?? null,

          special_abilities: special_abilities ?? null,
          magic_resonance_interaction: magic_resonance_interaction ?? null,
          behavior_tactics: behavior_tactics ?? null,
          habitat: habitat ?? null,
          diet: diet ?? null,
          variants: variants ?? null,
          loot_harvest: loot_harvest ?? null,
          story_hooks: story_hooks ?? null,
          notes: notes ?? null,
        });
      } catch (err: any) {
        if (String(err?.message || "").includes("UNIQUE") && String(err?.message || "").includes("name")) {
          return NextResponse.json({ error: "Name already exists" }, { status: 409 });
        }
        throw err;
      }

      const row = db.prepare("SELECT * FROM creatures WHERE id = ?").get(id);
      return NextResponse.json(mapRow(row));
    }

    // create: require name, must be unique
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM creatures WHERE lower(name) = ?").get(name.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Name already exists" }, { status: 409 });
    }

    // Get the authenticated user's ID from session
    const user = await getSessionUser();
    const created_by_id = user?.id ?? null;

    const insert = db.prepare(`
      INSERT INTO creatures (
        created_by_id,

        name, alt_names, challenge_rating, encounter_scale, type, role, genre_tags, description_short,

        size, strength, dexterity, constitution, intelligence, wisdom, charisma,
        hp_total, hp_by_location, initiative, armor_soak,

        attack_modes, damage, range_text,

        special_abilities, magic_resonance_interaction, behavior_tactics, habitat, diet, variants, loot_harvest, story_hooks, notes
      )
      VALUES (
        @created_by_id,

        @name, @alt_names, @challenge_rating, @encounter_scale, @type, @role, @genre_tags, @description_short,

        @size, @strength, @dexterity, @constitution, @intelligence, @wisdom, @charisma,
        @hp_total, @hp_by_location, @initiative, @armor_soak,

        @attack_modes, @damage, @range_text,

        @special_abilities, @magic_resonance_interaction, @behavior_tactics, @habitat, @diet, @variants, @loot_harvest, @story_hooks, @notes
      )
    `);

    const info = insert.run({
      created_by_id,

      name: name.trim(),
      alt_names: alt_names ?? null,
      challenge_rating: challenge_rating ?? null,
      encounter_scale: encounter_scale ?? null,
      type: type ?? null,
      role: role ?? null,
      genre_tags: genre_tags ?? null,
      description_short: description_short ?? null,

      size: size ?? null,
      strength: strength ?? null,
      dexterity: dexterity ?? null,
      constitution: constitution ?? null,
      intelligence: intelligence ?? null,
      wisdom: wisdom ?? null,
      charisma: charisma ?? null,

      hp_total: hp_total ?? null,
      hp_by_location: hp_by_location ?? null,
      initiative: initiative ?? null,
      armor_soak: armor_soak ?? null,

      attack_modes: attack_modes ?? null,
      damage: damage ?? null,
      range_text: range_text ?? null,

      special_abilities: special_abilities ?? null,
      magic_resonance_interaction: magic_resonance_interaction ?? null,
      behavior_tactics: behavior_tactics ?? null,
      habitat: habitat ?? null,
      diet: diet ?? null,
      variants: variants ?? null,
      loot_harvest: loot_harvest ?? null,
      story_hooks: story_hooks ?? null,
      notes: notes ?? null,
    });

    const row = db.prepare("SELECT * FROM creatures WHERE id = ?").get(info.lastInsertRowid);
    return NextResponse.json(mapRow(row));
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

// ============================
// DELETE /api/creatures?id=123
// ============================
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const info = db.prepare("DELETE FROM creatures WHERE id = ?").run(id);
    if (info.changes === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
