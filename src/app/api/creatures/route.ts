import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db"; 
import { getSessionUser } from "@/server/session";
import { withErrorHandling, apiSuccess, apiError } from "@/lib/api-utils";
import { toInt, toStringOrNull } from "@/lib/utils";
import type { Creature, CreateInput, UpdateInput } from "@/types";

// Extended creature type with all the custom fields for this system
interface ExtendedCreature extends Omit<Creature, 'stats' | 'abilities' | 'type'> {
  created_by_id: string | null;
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
}

type CreaturePayload = Partial<Omit<ExtendedCreature, "id" | "created_at" | "updated_at">> & {
  id?: number;
  name?: string;
};

// ---- helpers ----
function mapRow(r: any): ExtendedCreature {
  return {
    id: r.id,
    created_by_id: r.created_by_id ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    description: r.description_short ?? '', // Map description_short to description
    world_id: r.world_id ?? 0, // Provide default world_id

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

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (id) {
    const row = db.prepare("SELECT * FROM creatures WHERE id = ?").get(id);
    if (!row) return apiError("Creature not found", 404);
    return apiSuccess(mapRow(row));
  }

  let sql = "SELECT * FROM creatures";
  const params: any[] = [];
  if (q) {
    sql += " WHERE lower(name) LIKE ?";
    params.push(`%${q}%`);
  }
  sql += " ORDER BY name ASC LIMIT 1000";

  const rows = db.prepare(sql).all(...params).map(mapRow);
  return apiSuccess(rows);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = (await req.json()) as CreaturePayload;
    const {
      id,
      name,
      alt_names,
      challenge_rating,
      encounter_scale,
      type,
      role,
      genre_tags,
      description_short,
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
      attack_modes,
      damage,
      range_text,
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
      // Update existing creature
      const exists = db.prepare("SELECT id FROM creatures WHERE id = ?").get(id);
      if (!exists) {
        return apiError("Creature not found", 404);
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
          name: toStringOrNull(name),
          alt_names: toStringOrNull(alt_names),
          challenge_rating: toStringOrNull(challenge_rating),
          encounter_scale: toStringOrNull(encounter_scale),
          type: toStringOrNull(type),
          role: toStringOrNull(role),
          genre_tags: toStringOrNull(genre_tags),
          description_short: toStringOrNull(description_short),
          size: toStringOrNull(size),
          strength: toInt(strength),
          dexterity: toInt(dexterity),
          constitution: toInt(constitution),
          intelligence: toInt(intelligence),
          wisdom: toInt(wisdom),
          charisma: toInt(charisma),
          hp_total: toInt(hp_total),
          hp_by_location: toStringOrNull(hp_by_location),
          initiative: toInt(initiative),
          armor_soak: toStringOrNull(armor_soak),
          attack_modes: toStringOrNull(attack_modes),
          damage: toStringOrNull(damage),
          range_text: toStringOrNull(range_text),
          special_abilities: toStringOrNull(special_abilities),
          magic_resonance_interaction: toStringOrNull(magic_resonance_interaction),
          behavior_tactics: toStringOrNull(behavior_tactics),
          habitat: toStringOrNull(habitat),
          diet: toStringOrNull(diet),
          variants: toStringOrNull(variants),
          loot_harvest: toStringOrNull(loot_harvest),
          story_hooks: toStringOrNull(story_hooks),
          notes: toStringOrNull(notes),
        });
      } catch (err: any) {
        if (String(err?.message || "").includes("UNIQUE") && String(err?.message || "").includes("name")) {
          return apiError("Name already exists", 409);
        }
        throw err;
      }

      const row = db.prepare("SELECT * FROM creatures WHERE id = ?").get(id);
      return apiSuccess(mapRow(row));
    }

    // Create new creature
    if (!name || !name.trim()) {
      return apiError("Name is required", 400);
    }

    const existing = db.prepare("SELECT id FROM creatures WHERE lower(name) = ?").get(name.trim().toLowerCase());
    if (existing) {
      return apiError("Name already exists", 409);
    }

    // Get the authenticated user's ID from session
    const user = await getSessionUser();
    const created_by_id = user?.id ?? null;

    const insert = db.prepare(`
      INSERT INTO creatures (
        created_by_id, name, alt_names, challenge_rating, encounter_scale, type, role, genre_tags, description_short,
        size, strength, dexterity, constitution, intelligence, wisdom, charisma,
        hp_total, hp_by_location, initiative, armor_soak, attack_modes, damage, range_text,
        special_abilities, magic_resonance_interaction, behavior_tactics, habitat, diet, variants, loot_harvest, story_hooks, notes
      )
      VALUES (
        @created_by_id, @name, @alt_names, @challenge_rating, @encounter_scale, @type, @role, @genre_tags, @description_short,
        @size, @strength, @dexterity, @constitution, @intelligence, @wisdom, @charisma,
        @hp_total, @hp_by_location, @initiative, @armor_soak, @attack_modes, @damage, @range_text,
        @special_abilities, @magic_resonance_interaction, @behavior_tactics, @habitat, @diet, @variants, @loot_harvest, @story_hooks, @notes
      )
    `);

    const info = insert.run({
      created_by_id,
      name: name.trim(),
      alt_names: toStringOrNull(alt_names),
      challenge_rating: toStringOrNull(challenge_rating),
      encounter_scale: toStringOrNull(encounter_scale),
      type: toStringOrNull(type),
      role: toStringOrNull(role),
      genre_tags: toStringOrNull(genre_tags),
      description_short: toStringOrNull(description_short),
      size: toStringOrNull(size),
      strength: toInt(strength),
      dexterity: toInt(dexterity),
      constitution: toInt(constitution),
      intelligence: toInt(intelligence),
      wisdom: toInt(wisdom),
      charisma: toInt(charisma),
      hp_total: toInt(hp_total),
      hp_by_location: toStringOrNull(hp_by_location),
      initiative: toInt(initiative),
      armor_soak: toStringOrNull(armor_soak),
      attack_modes: toStringOrNull(attack_modes),
      damage: toStringOrNull(damage),
      range_text: toStringOrNull(range_text),
      special_abilities: toStringOrNull(special_abilities),
      magic_resonance_interaction: toStringOrNull(magic_resonance_interaction),
      behavior_tactics: toStringOrNull(behavior_tactics),
      habitat: toStringOrNull(habitat),
      diet: toStringOrNull(diet),
      variants: toStringOrNull(variants),
      loot_harvest: toStringOrNull(loot_harvest),
      story_hooks: toStringOrNull(story_hooks),
      notes: toStringOrNull(notes),
    });

    const row = db.prepare("SELECT * FROM creatures WHERE id = ?").get(info.lastInsertRowid);
    return apiSuccess(mapRow(row));
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("ID is required", 400);

  const info = db.prepare("DELETE FROM creatures WHERE id = ?").run(id);
  if (info.changes === 0) {
    return apiError("Creature not found", 404);
  }
  return apiSuccess({ deleted: true });
});
