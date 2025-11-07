"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ---------- constants ---------- */
const ATTR_ITEMS = ["STR", "DEX", "CON", "INT", "WIS", "CHA", "NA"] as const;
type Attr = (typeof ATTR_ITEMS)[number];

const TYPE_ITEMS = [
  "standard",
  "magic",
  "sphere",
  "discipline",
  "resonance",
  "spell",
  "psionic skill",
  "reverberation",
  "special ability",
] as const;
type SkillType = (typeof TYPE_ITEMS)[number];

const TIER_ITEMS = ["1", "2", "3", "N/A"] as const;
type TierText = (typeof TIER_ITEMS)[number];

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

const DETAIL_TYPES = new Set<SkillType>([
  "spell",
  "psionic skill",
  "reverberation",
  "special ability",
]);

/* ---------- util ---------- */
type Skill = {
  id: string | number;
  name: string;
  type: SkillType;
  tier: number | null; // null == "N/A"
  primary_attribute: Attr;
  secondary_attribute: Attr;
  definition?: string;
  parent_id?: string | number | null;
  parent2_id?: string | number | null;
  parent3_id?: string | number | null;
  created_by?: { username?: string } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const tierToText = (t: number | null): TierText => (t === null ? "N/A" : (String(t) as TierText));
const textToTier = (tx: TierText): number | null => (tx === "N/A" ? null : parseInt(tx, 10));
const nv = (x: unknown) => (x === null || x === undefined || x === "" ? "—" : String(x));

function attrOverlap(parent: Skill, c1: Attr, c2: Attr) {
  const child = new Set([c1, c2].filter((a) => a && a !== "NA"));
  const par = new Set(
    [parent.primary_attribute, parent.secondary_attribute].filter((a) => a && a !== "NA")
  );
  for (const a of child) if (par.has(a)) return true;
  return child.size === 0;
}

function parentCandidates(
  all: Skill[],
  current: Skill | null,
  childTier: number | null,
  a1: Attr,
  a2: Attr
) {
  let opts = [...all];
  if (childTier === null || childTier <= 1) opts = [];
  else opts = opts.filter((o) => o.tier === childTier - 1);
  opts = opts.filter((o) => attrOverlap(o, a1, a2));
  if (current) opts = opts.filter((o) => String(o.id) !== String(current.id));
  return opts;
}

/* ---------- CSV helper ---------- */
const HEADER_ALIASES: Record<string, string[]> = {
  "Primary Attribute": ["primary", "primary attribute", "primary_attr", "attr1"],
  "Secondary Attribute": ["secondary", "secondary attribute", "secondary_attr", "attr2"],
  "Skill Type": ["skill type", "type"],
  "Skill Tier": ["skill tier", "tier"],
  "Skill Name": ["skill name", "name"],
  "Parent Skill": ["parent skill", "parents", "parent", "parent(s)"],
  Definition: ["definition", "desc", "description"],
};

function pickField(row: Record<string, string>, canonical: keyof typeof HEADER_ALIASES) {
  const targets = [canonical, ...HEADER_ALIASES[canonical]];
  for (const t of targets) {
    if (t in row) return row[t];
    const k = Object.keys(row).find((k) => k.toLowerCase() === t.toLowerCase());
    if (k) return row[k];
  }
  return "";
}

function sniffDelimiter(sample: string) {
  if (sample.includes("\t")) return "\t";
  if (sample.includes(";")) return ";";
  return ",";
}

function parseCSV(text: string, delim: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [] as Record<string, string>[];
  const headers = lines[0].split(delim).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (cols[idx] ?? "").trim()));
    rows.push(obj);
  }
  return rows;
}

/* ==========================================================
   MAGIC BUILDER — visual only (no localStorage)
   ========================================================== */

const CONTAINERS: Record<string, number> = {
  Target: 1,
  "AoE (Area)": 2,
  Control: 2,
  "Temporal/Spatial": 5,
};
const STAND_ALONES: Record<string, any> = {
  Damage: { type: "per", base: 3, per: 2 },
  Healing: { type: "per", base: 3, per: 2 },
  Buff: { type: "per", base: 2, per: 1 },
  Debuff: { type: "per", base: 2, per: 1 },
  "Summon (minor)": { type: "flat", cost: 8 },
  "Summon (major)": { type: "flat", cost: 15 },
  "Create/Destroy (basic)": { type: "flat", cost: 5 },
  "Create/Destroy (major)": { type: "flat", cost: 12 },
  "Transform/Alter": { type: "flat", cost: 10 },
  "Illusion / Mask": { type: "flat", cost: 4 },
  "Reveal / Detect": { type: "flat", cost: 4 },
  "Counter / Cancel": { type: "flat", cost: 6 },
  "Accelerate / Hasten": { type: "per", base: 4, per: 1 },
  "Decelerate / Slow": { type: "per", base: 4, per: 1 },
  Teleportation: { type: "flat", cost: 8 },
  Banish: { type: "flat", cost: 10 },
  "Pocket Space": { type: "flat", cost: 12 },
  "Spatial Bubble": { type: "flat", cost: 8 },
  "Temporal Stasis": { type: "flat", cost: 6 },
  "Link / Bind": { type: "flat", cost: 6 },
  "Transfer Life Force": { type: "per", base: 4, per: 2 },
  "Push (Control)": { type: "flat", cost: 3, control_only: true },
  "Pull (Control)": { type: "flat", cost: 3, control_only: true },
  "Grapple/Restrain (Control)": { type: "flat", cost: 4, control_only: true },
  "Immobilize (Control)": { type: "flat", cost: 6, control_only: true },
  "Stun/Daze (Control)": { type: "flat", cost: 6, control_only: true },
  "Disarm (Control)": { type: "flat", cost: 5 },
  "Knockdown (Control)": { type: "flat", cost: 4 },
  "Blind/Deaf/Silence (Control)": { type: "flat", cost: 5, control_only: true },
  "Anchor/Lock (Control)": { type: "flat", cost: 6 },
};
const RANGES: Record<string, number> = {
  Self: 1,
  Touch: 2,
  "Melee Reach": 3,
  "Short (30 ft)": 4,
  "Medium (60 ft)": 5,
  "Long (120 ft)": 7,
  "Line of Sight": 10,
  Unlimited: 15,
};
const SHAPES: Record<string, { base: number; per_inc: number; label: string }> = {
  "Radius (10 ft)": { base: 3, per_inc: 2, label: "+2 per +10 ft" },
  "Cone (30 ft)": { base: 3, per_inc: 2, label: "+2 per +10 ft" },
  "Line (30 ft)": { base: 3, per_inc: 2, label: "+2 per +10 ft" },
  "Wall (30 ft)": { base: 4, per_inc: 2, label: "+2 per +10 ft" },
  "Sphere/Cube/Zone": { base: 5, per_inc: 3, label: "+3 per size" },
};
const DURATIONS: Record<string, number> = {
  Instantaneous: 1,
  "Combat Step": 2,
  "Combat Round": 5,
  Lingering: 2,
};
const MULTI_TARGET = { base: 3, per_target: 1 };
const MODIFIERS: Record<string, number> = {
  Concentration: -2,
  "Static Assignment": 1,
  "Per Success Assignment": 3,
  "Sense Modifier": 2,
  "Component Requirement": -2,
  "Environmental Dependency": -3,
  "Backlash Risk": -5,
  "Expose / Conceal": 2,
  "Release (Delayed)": 2,
  "Progressive Spell": 3,
};
const MASTERY_BANDS: Array<[string, number, number]> = [
  ["Apprentice", 1, 10],
  ["Novice", 11, 20],
  ["Master", 21, 50],
  ["High Master", 51, 90],
  ["Grand Master", 91, 200],
];
const masteryFor = (mana: number) => {
  if (mana <= 0) return "Apprentice";
  for (const [n, lo, hi] of MASTERY_BANDS) if (lo <= mana && mana <= hi) return n;
  return "Beyond Grand Master";
};

type MBNode = {
  container: string;
  effects: Array<[string, number]>;
  range: string;
  shape: string;
  shape_increments: number;
  duration: string;
  lingering: number;
  multi_target: number;
  children: MBNode[];
};

/* ---------- tolerant fetch helpers ---------- */
async function parseJSONSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
function pickItem(json: any, fallback?: any) {
  if (!json) return fallback ?? null;
  if (json.item) return json.item;
  if (json.data) return json.data;
  if (Array.isArray(json.items) && json.items.length) return json.items[0];
  return fallback ?? null;
}
function successy(json: any, res: Response) {
  // treat any 2xx as success, or common shapes: ok, success, deleted, etc.
  if (res.ok) return true;
  return Boolean(json?.ok || json?.success || json?.deleted);
}
function messageFrom(json: any, res: Response) {
  return json?.message || json?.error || `HTTP ${res.status}`;
}

function MagicBuilder({
  seedSkill,
  allSkills,
  onClose,
}: {
  seedSkill: Skill;
  allSkills: Skill[];
  onClose: () => void;
}) {
  const [blocks, setBlocks] = useState<MBNode[]>([
    { container: "Target", effects: [], range: "", shape: "", shape_increments: 0, duration: "", lingering: 0, multi_target: 0, children: [] },
  ]);
  const [mods, setMods] = useState<Record<string, number>>(
    Object.fromEntries(Object.keys(MODIFIERS).map((k) => [k, 0])) as Record<string, number>
  );
  const [trad, setTrad] = useState<string>(() => {
    const t = (seedSkill?.type || "").toLowerCase();
    if (t === "psionic skill") return "Psionics (Psionic Skill)";
    if (t === "reverberation") return "Bardic Resonance (Reverberation)";
    return "Spellcraft, Talismanism, Faith (Spells)";
  });
  const [path, setPath] = useState<string>("(none)");
  const [name, setName] = useState<string>(seedSkill?.name || "");
  const [notes, setNotes] = useState<string>("");
  const [flavor, setFlavor] = useState<string>("");

  const wantType =
    trad.startsWith("Psionics") ? "discipline" : trad.startsWith("Bardic") ? "resonance" : "sphere";
  const pathOptions = useMemo(() => {
    const items = ["(none)", ...allSkills.filter((s) => s.type === wantType).map((s) => s.name).sort()];
    const seedParents = [seedSkill?.parent_id, seedSkill?.parent2_id, seedSkill?.parent3_id]
      .map((pid) => allSkills.find((x) => String(x.id) === String(pid)))
      .filter(Boolean) as Skill[];
    const exact = seedParents.find((p) => p.type === wantType)?.name;
    if (exact && items.includes(exact) && path === "(none)") setPath(exact);
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantType, allSkills, seedSkill?.id]);

  const nodeSubtotal = (n: MBNode): number => {
    let m = CONTAINERS[n.container] || 0;
    for (const [ename, cnt] of n.effects) {
      const meta = STAND_ALONES[ename];
      if (!meta) continue;
      if (meta.type === "flat") m += meta.cost;
      else m += meta.base + Math.max(0, (cnt || 1) - 1) * meta.per;
    }
    m += RANGES[n.range] || 0;
    if (n.shape) {
      const meta = SHAPES[n.shape];
      if (meta) m += meta.base + meta.per_inc * Math.max(0, n.shape_increments || 0);
    }
    if (n.duration) {
      m += DURATIONS[n.duration] || 0;
      if (n.duration === "Lingering") m += Number(n.lingering || 0);
    }
    if (n.container === "Target" && (n.multi_target || 0) > 0) {
      m += MULTI_TARGET.base + Math.max(0, (n.multi_target || 0) - 1) * MULTI_TARGET.per_target;
    }
    for (const ch of n.children) m += nodeSubtotal(ch);
    return m;
  };
  const totalMana =
    blocks.reduce((a, b) => a + nodeSubtotal(b), 0) +
    Object.entries(mods).reduce((a, [k, v]) => a + (MODIFIERS[k] || 0) * (Number(v) || 0), 0);
  const castingTime = Math.floor(totalMana / 2);
  const mastery = masteryFor(totalMana);

  const addRoot = () =>
    setBlocks((b) => [
      ...b,
      { container: "Target", effects: [], range: "", shape: "", shape_increments: 0, duration: "", lingering: 0, multi_target: 0, children: [] },
    ]);
  const updateNodeAt = (pathIdx: number[], patch: Partial<MBNode>) => {
    setBlocks((prev) => {
      const clone = structuredClone(prev) as MBNode[];
      let cur: any = clone;
      for (let i = 0; i < pathIdx.length - 1; i++) cur = cur[pathIdx[i]].children;
      const last = pathIdx[pathIdx.length - 1];
      cur[last] = { ...cur[last], ...patch };
      return clone;
    });
  };
  const addChildAt = (pathIdx: number[]) => {
    setBlocks((prev) => {
      const clone = structuredClone(prev) as MBNode[];
      let cur: any = clone;
      for (let i = 0; i < pathIdx.length - 1; i++) cur = cur[pathIdx[i]].children;
      const last = pathIdx[pathIdx.length - 1];
      cur[last].children.push({
        container: "Target",
        effects: [],
        range: "",
        shape: "",
        shape_increments: 0,
        duration: "",
        lingering: 0,
        multi_target: 0,
        children: [],
      });
      return clone;
    });
  };
  const removeAt = (pathIdx: number[]) => {
    setBlocks((prev) => {
      const clone = structuredClone(prev) as MBNode[];
      if (pathIdx.length === 1) {
        clone.splice(pathIdx[0], 1);
        return clone.length
          ? clone
          : [{ container: "Target", effects: [], range: "", shape: "", shape_increments: 0, duration: "", lingering: 0, multi_target: 0, children: [] }];
      }
      let cur: any = clone;
      for (let i = 0; i < pathIdx.length - 2; i++) cur = cur[pathIdx[i]].children;
      cur.splice(pathIdx[pathIdx.length - 1], 1);
      return clone;
    });
  };
  const addEffectAt = (pathIdx: number[], name: string, count: number) => {
    if (!name) return;
    setBlocks((prev) => {
      const clone = structuredClone(prev) as MBNode[];
      let cur: any = clone;
      for (let i = 0; i < pathIdx.length - 1; i++) cur = cur[pathIdx[i]].children;
      const last = pathIdx[pathIdx.length - 1];
      const info = STAND_ALONES[name];
      const c = info?.type === "per" ? Math.max(1, Number(count) || 1) : 1;
      cur[last].effects.push([name, c]);
      return clone;
    });
  };

  const saveBuild = async () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }
    const tradition = trad.startsWith("Psionics")
      ? "psionics"
      : trad.startsWith("Bardic")
      ? "bardic"
      : "spellcraft";
    const serialize = (n: MBNode): any => ({
      container: n.container,
      effects: n.effects.map(([nm, c]) => ({ name: nm, count: Number(c) || 1 })),
      addons: {
        range: n.range || "",
        shape: n.shape || "",
        shape_increments: Number(n.shape_increments || 0),
        duration: n.duration || "",
        lingering: Number(n.lingering || 0),
        multi_target: Number(n.multi_target || 0),
      },
      children: n.children.map(serialize),
    });
    const rec = {
      skill_id: (seedSkill?.id as any) ?? null,
      skill_name: name.trim(),
      tradition,
      tier2_path: path && path !== "(none)" ? path : null,
      containers_json: JSON.stringify(blocks.map(serialize)),
      modifiers_json: JSON.stringify(mods),
      mana_cost: totalMana,
      casting_time: castingTime,
      mastery_level: mastery,
      notes: notes || null,
      flavor_line: flavor || null,
      saved_at: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/magic-builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rec),
      });
      const json = await parseJSONSafe(res);
      if (successy(json, res)) alert(`Saved build for: ${rec.skill_name}`);
      else alert(`Save failed: ${messageFrom(json, res)}`);
    } catch (e: any) {
      alert(`Save error: ${e?.message || e}`);
    }
  };

  const NodeCard = ({ node, pathIdx }: { node: MBNode; pathIdx: number[] }) => {
    const effectsList = node.effects.length
      ? node.effects
          .map(([n, c], i) => `${i + 1}. ${n}${STAND_ALONES[n]?.type === "per" ? ` ×${c}` : ""}`)
          .join("\n")
      : "(none)";
    const [effName, setEffName] = useState<string>(Object.keys(STAND_ALONES)[0]);
    const [effCnt, setEffCnt] = useState<number>(1);
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="font-semibold">Container {pathIdx.join("/")}</div>
          <div className="ms-auto flex gap-2">
            <button className="rounded border border-white/15 px-2 py-1" onClick={() => addChildAt(pathIdx)}>
              Add Child
            </button>
            <button
              className="rounded border border-rose-400/30 text-rose-200 px-2 py-1"
              onClick={() => removeAt(pathIdx)}
            >
              Remove
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label className="block text-sm">
            Type
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
              value={node.container}
              onChange={(e) => updateNodeAt(pathIdx, { container: e.target.value })}
            >
              {Object.keys(CONTAINERS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Range
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
              value={node.range}
              onChange={(e) => updateNodeAt(pathIdx, { range: e.target.value })}
            >
              <option value=""></option>
              {Object.keys(RANGES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Duration
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
              value={node.duration}
              onChange={(e) => updateNodeAt(pathIdx, { duration: e.target.value })}
            >
              <option value=""></option>
              {Object.keys(DURATIONS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label className="block text-sm">
            Shape
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
              value={node.shape}
              onChange={(e) => updateNodeAt(pathIdx, { shape: e.target.value })}
            >
              <option value=""></option>
              {Object.keys(SHAPES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Shape +inc
            <input
              type="number"
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
              value={node.shape_increments}
              onChange={(e) => updateNodeAt(pathIdx, { shape_increments: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="block text-sm">
            Lingering +steps
            <input
              type="number"
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
              value={node.lingering}
              onChange={(e) => updateNodeAt(pathIdx, { lingering: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        {node.container === "Target" && (
          <label className="block text-sm">
            Multi-Target (+targets)
            <input
              type="number"
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
              value={node.multi_target}
              onChange={(e) => updateNodeAt(pathIdx, { multi_target: Number(e.target.value) || 0 })}
            />
          </label>
        )}
        <div className="rounded-lg border border-white/10 p-2">
          <div className="font-medium mb-1">Effects</div>
          <div className="flex gap-2 items-center">
            <select
              className="rounded border border-white/10 bg-black/50 px-2 py-1"
              value={effName}
              onChange={(e) => setEffName(e.target.value)}
            >
              {Object.keys(STAND_ALONES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <span>×</span>
            <input
              type="number"
              className="w-20 rounded border border-white/10 bg-black/50 px-2 py-1"
              value={effCnt}
              onChange={(e) => setEffCnt(Number(e.target.value) || 1)}
            />
            <button
              className="rounded border border-emerald-400/40 text-emerald-200 px-2 py-1"
              onClick={() => addEffectAt(pathIdx, effName, effCnt)}
            >
              Add Effect
            </button>
          </div>
          <textarea
            className="mt-2 w-full h-24 rounded border border-white/10 bg-black/50 p-2 text-sm"
            readOnly
            value={effectsList}
          />
        </div>
        {node.children.length > 0 && (
          <div className="space-y-2">
            {node.children.map((ch, i) => (
              <NodeCard key={i} node={ch} pathIdx={[...pathIdx, i]} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300/30 bg-amber-300/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-amber-200 font-semibold">Magic Builder</div>
        <div className="ms-auto flex gap-2">
          <button className="rounded border border-white/20 px-2 py-1" onClick={addRoot}>
            ➕ Add Root Container
          </button>
          <button className="rounded border border-white/20 px-2 py-1" onClick={saveBuild}>
            💾 Save
          </button>
          <button className="rounded border border-white/20 px-2 py-1" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block text-sm">
          Tradition / Output
          <select
            className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
            value={trad}
            onChange={(e) => setTrad(e.target.value)}
          >
            {[
              "Spellcraft, Talismanism, Faith (Spells)",
              "Psionics (Psionic Skill)",
              "Bardic Resonance (Reverberation)",
            ].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Tier-2 Path
          <select
            className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          >
            {pathOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Flavor Line
          <input
            className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1"
            value={flavor}
            onChange={(e) => setFlavor(e.target.value)}
          />
        </label>
      </div>
      <div className="space-y-3">
        {blocks.map((n, i) => (
          <NodeCard key={i} node={n} pathIdx={[i]} />
        ))}
      </div>
      <div className="rounded-xl border border-white/10 p-3">
        <div className="font-semibold mb-2">Modifiers (global)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {Object.entries(MODIFIERS).map(([m, delta]) => (
            <label
              key={m}
              className="flex items-center justify-between gap-2 text-sm rounded border border-white/10 bg-black/40 px-2 py-1"
            >
              <span>
                {m} ({delta > 0 ? `+${delta}` : delta})
              </span>
              <input
                type="number"
                min={0}
                className="w-20 rounded bg-black/50 px-2 py-1"
                value={mods[m] || 0}
                onChange={(e) =>
                  setMods({ ...mods, [m]: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </label>
          ))}
        </div>
      </div>
      <label className="block text-sm">
        Notes / Special Conditions
        <textarea
          className="mt-1 w-full h-28 rounded border border-white/10 bg-black/50 p-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <div className="rounded-xl border border-white/10 p-3 space-y-1">
        <div className="font-semibold">Live Summary</div>
        <div>Spell Cost (Mana): {totalMana}</div>
        <div>Casting Time (initiative): {castingTime}</div>
        <div>Mastery Level: {mastery}</div>
      </div>
    </div>
  );
}

/* ==========================================================
   SPECIAL ABILITY DETAILS — visual only (no localStorage)
   ========================================================== */

const ABILITY_TYPES = ["Utility", "Combat", "Magic/Psionic", "Other"] as const;
const SCALING_METHODS = [
  "Point-Based",
  "Point & Roll-Based",
  "Skill % Based",
  "Point Multiplier Based",
  "Other",
] as const;
const MAX_SECTIONS = 9;
const CANONICAL_TITLES = ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Final"];
type UpSection = { tag: string; desc: string; points: string };

function SpecialAbilityDetails({ seedSkill, onClose }: { seedSkill: Skill; onClose: () => void }) {
  const [abilityType, setAbilityType] = useState<string>("Utility");
  const [scalingMethod, setScalingMethod] = useState<string>("Point-Based");
  const [prereq, setPrereq] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [sections, setSections] = useState<UpSection[]>([{ tag: "", desc: "", points: "" }]);

  useEffect(() => {
    if (sections.length === 0) setSections([{ tag: "", desc: "", points: "" }]);
  }, [sections.length]);

  const addSection = () =>
    setSections((arr) => (arr.length >= MAX_SECTIONS ? arr : [...arr, { tag: "", desc: "", points: "" }]));
  const removeSection = (idx: number) =>
    setSections((arr) => {
      const cp = [...arr];
      cp.splice(idx, 1);
      return cp.length ? cp : [{ tag: "", desc: "", points: "" }];
    });

  const save = async () => {
    const norm = (s: string) => (s?.trim() ? s.trim() : null);
    const secs = [...sections];
    while (secs.length < MAX_SECTIONS) secs.push({ tag: "", desc: "", points: "" });
    const rec = {
      skill_id: seedSkill?.id ?? null,
      ability_type: abilityType,
      scaling_method: scalingMethod,
      prerequisites: norm(prereq),
      scaling_details: norm(details),
      stage1_tag: norm(secs[0].tag),
      stage1_desc: norm(secs[0].desc),
      stage1_points: norm(secs[0].points),
      stage2_tag: norm(secs[1].tag),
      stage2_desc: norm(secs[1].desc),
      stage2_points: norm(secs[1].points),
      stage3_tag: norm(secs[2].tag),
      stage3_desc: norm(secs[2].desc),
      stage4_tag: norm(secs[3].tag),
      stage4_desc: norm(secs[3].desc),
      final_tag: norm(secs[4].tag),
      final_desc: norm(secs[4].desc),
      add1_tag: norm(secs[5].tag),
      add1_desc: norm(secs[5].desc),
      add2_tag: norm(secs[6].tag),
      add2_desc: norm(secs[6].desc),
      add3_tag: norm(secs[7].tag),
      add3_desc: norm(secs[7].desc),
      add4_tag: norm(secs[8].tag),
      add4_desc: norm(secs[8].desc),
      saved_at: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/special-abilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scaling: {
            skill_id: rec.skill_id,
            ability_type: rec.ability_type,
            prerequisites: rec.prerequisites,
            scaling_method: rec.scaling_method,
            scaling_details: rec.scaling_details,
          },
          requirements: rec,
        }),
      });
      const json = await parseJSONSafe(res);
      if (successy(json, res)) alert("Special Ability details saved.");
      else alert(`Save failed: ${messageFrom(json, res)}`);
    } catch (e: any) {
      alert(`Save error: ${e?.message || e}`);
    }
  };

  return (
    <div className="rounded-xl border border-sky-300/30 bg-sky-300/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-sky-200 font-semibold">Special Ability Details — {seedSkill?.name || "(unnamed)"}</div>
        <div className="ms-auto flex gap-2">
          <button className="rounded border border-white/20 px-2 py-1" onClick={save}>💾 Save</button>
          <button className="rounded border border-white/20 px-2 py-1" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block text-sm">Ability Type
          <select className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1" value={abilityType} onChange={(e) => setAbilityType(e.target.value)}>
            {ABILITY_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="block text-sm">Scaling Method
          <select className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1" value={scalingMethod} onChange={(e) => setScalingMethod(e.target.value)}>
            {SCALING_METHODS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm">Prerequisites
        <input className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1" value={prereq} onChange={(e) => setPrereq(e.target.value)} />
      </label>
      <label className="block text-sm">Scaling Details
        <textarea className="mt-1 w-full h-28 rounded border border-white/10 bg-black/50 p-2" value={details} onChange={(e) => setDetails(e.target.value)} />
      </label>
      <div className="font-semibold">Upgrade Sections</div>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-black/40 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="font-medium">{i < CANONICAL_TITLES.length ? CANONICAL_TITLES[i] : `Additional ${i - CANONICAL_TITLES.length + 1}`}</div>
              <div className="ms-auto">
                <button className="rounded border border-white/20 px-2 py-1" onClick={() => removeSection(i)}>Remove</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className="block text-sm">Tag / Name
                <input className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1" value={s.tag} onChange={(e) => { const cp = [...sections]; cp[i] = { ...cp[i], tag: e.target.value }; setSections(cp); }} />
              </label>
              <label className="block text-sm">Points (only first two saved)
                <input className="mt-1 w-full rounded border border-white/10 bg-black/50 px-2 py-1" value={s.points} onChange={(e) => { const cp = [...sections]; cp[i] = { ...cp[i], points: e.target.value }; setSections(cp); }} />
              </label>
            </div>
            <label className="block text-sm mt-2">Description
              <textarea className="mt-1 w-full h-24 rounded border border-white/10 bg-black/50 p-2" value={s.desc} onChange={(e) => { const cp = [...sections]; cp[i] = { ...cp[i], desc: e.target.value }; setSections(cp); }} />
            </label>
          </div>
        ))}
      </div>
      <div>
        <button className="rounded border border-white/20 px-2 py-1" onClick={addSection} disabled={sections.length >= MAX_SECTIONS}>Add upgrade section</button>
      </div>
    </div>
  );
}

/* ==========================================================
   MAIN EDITOR — DB-wired shell with tolerant API handling
   ========================================================== */

export default function SkillsetsPage() {
  const router = useRouter();

  // Esc -> back/fallback
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push("/worldbuilder");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // data (API — no localStorage)
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // filters + paging
  const [qtext, setQtext] = useState("");
  const [fType, setFType] = useState<"" | SkillType>("");
  const [fPrimary, setFPrimary] = useState<"" | Attr>("");
  const [fSecondary, setFSecondary] = useState<"" | Attr>("");
  const [fTier, setFTier] = useState<"" | TierText>("");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // tolerant initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/skills", { cache: "no-store" });
        const json = await parseJSONSafe(res);
        if (!mounted) return;

        // accept shapes: {items}, [], or {data:[]}
        const items =
          (Array.isArray(json) && json) ||
          (Array.isArray(json?.items) && json.items) ||
          (Array.isArray(json?.data) && json.data) ||
          [];

        if (Array.isArray(items) && items.length >= 0) {
          setSkills(items as Skill[]);
          if (items.length) setActiveId(String((items as any)[0].id));
        }
      } catch {
        /* visual-only if API not ready */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const active = useMemo(
    () => skills.find((s) => String(s.id) === activeId) ?? null,
    [skills, activeId]
  );

  const filtered = useMemo(() => {
    const q = qtext.trim().toLowerCase();
    return skills.filter((s) => {
      if (fType && s.type !== fType) return false;
      if (fPrimary && s.primary_attribute !== fPrimary) return false;
      if (fSecondary && s.secondary_attribute !== fSecondary) return false;
      if (fTier && tierToText(s.tier) !== fTier) return false;
      if (q) {
        const hay = [
          s.name,
          s.type,
          s.primary_attribute,
          s.secondary_attribute,
          tierToText(s.tier),
          s.definition || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [skills, qtext, fType, fPrimary, fSecondary, fTier]);

  const pages = Math.max(1, Math.ceil(filtered.length / Math.max(1, pageSize)));
  const clampedIndex = Math.max(0, Math.min(pageIndex, pages - 1));
  const start = clampedIndex * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  useEffect(() => {
    if (pageIndex >= pages) setPageIndex(Math.max(0, pages - 1));
  }, [pages, pageIndex]);

  // CRUD shell — tolerant handlers
  async function onNew() {
    const payload = {
      name: "(unnamed)",
      type: "standard",
      tier: 1,
      primary_attribute: "STR",
      secondary_attribute: "NA",
      definition: "",
    };
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await parseJSONSafe(res);
      if (successy(json, res)) {
        const item = pickItem(json, null) || { ...payload, id: uid(), created_at: new Date().toISOString() };
        setSkills((prev) => [item as Skill, ...prev]);
        setActiveId(String((item as any).id));
        setMode("edit");
      } else {
        alert(`Create failed: ${messageFrom(json, res)}`);
      }
    } catch (e: any) {
      alert(`Create error: ${e?.message || e}`);
    }
  }

  async function onDelete() {
    if (!active) return;
    const id = String(active.id);
    try {
      const res = await fetch(`/api/skills?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await parseJSONSafe(res);
      if (successy(json, res)) {
        setSkills((prev) => prev.filter((x) => String(x.id) !== id));
        setActiveId(null);
        setMode("list");
      } else alert(`Delete failed: ${messageFrom(json, res)}`);
    } catch (e: any) {
      alert(`Delete error: ${e?.message || e}`);
    }
  }

  function updateActive(patch: Partial<Skill>) {
    if (!active) return;
    const id = String(active.id);
    setSkills((prev) =>
      prev.map((s) => (String(s.id) === id ? { ...s, ...patch, updated_at: new Date().toISOString() } : s))
    );
  }

  async function saveActive() {
    if (!active) return;
    try {
      const res = await fetch("/api/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, patch: active }),
      });
      const json = await parseJSONSafe(res);
      if (successy(json, res)) {
        const updated = (pickItem(json, null) as Skill) || active;
        setSkills((prev) => prev.map((s) => (String(s.id) === String(updated.id) ? updated : s)));
        alert("Saved.");
      } else {
        alert(`Save failed: ${messageFrom(json, res)}`);
      }
    } catch (e: any) {
      alert(`Save error: ${e?.message || e}`);
    }
  }

  function setParentsOrdered(ids: (string | number | null | undefined)[]) {
    const ordered = ids.filter(Boolean).map(String).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
    updateActive({
      parent_id: ordered[0] ?? null,
      parent2_id: ordered[1] ?? null,
      parent3_id: ordered[2] ?? null,
    });
  }

  const candidateParents = useMemo(() => {
    if (!active) return [] as Skill[];
    return parentCandidates(
      skills,
      active,
      active.tier,
      active.primary_attribute,
      active.secondary_attribute
    );
  }, [skills, active]);

  // Importer — hydrate only
  async function handleImport(file: File) {
    const text = await file.text();
    const delim = file.name.toLowerCase().endsWith(".tsv") ? "\t" : sniffDelimiter(text.slice(0, 4096));
    const rows = parseCSV(text.replace(/^\uFEFF/, ""), delim);
    if (!rows.length) return;
    const created: { name: string; parentStr: string }[] = [];
    const newSkills: Skill[] = [];
    for (const r of rows) {
      let primary = (pickField(r, "Primary Attribute") || "NA").toUpperCase();
      let secondary = (pickField(r, "Secondary Attribute") || "NA").toUpperCase();
      if (primary === "CHR") primary = "CHA";
      if (secondary === "CHR") secondary = "CHA";
      const stype = (pickField(r, "Skill Type") || "standard").toLowerCase() as SkillType;
      const tierRaw = (pickField(r, "Skill Tier") || "").trim();
      const tier: number | null =
        tierRaw === "" || /^(n\/a|—|-)$/i.test(tierRaw) ? null : parseInt(tierRaw, 10) || null;
      const name = pickField(r, "Skill Name");
      const definition = pickField(r, "Definition");
      if (!name) continue;
      const s: Skill = {
        id: uid(),
        name,
        type: TYPE_ITEMS.includes(stype) ? stype : "standard",
        tier,
        primary_attribute: ATTR_ITEMS.includes(primary as Attr) ? (primary as Attr) : "NA",
        secondary_attribute: ATTR_ITEMS.includes(secondary as Attr) ? (secondary as Attr) : "NA",
        definition,
        parent_id: null,
        parent2_id: null,
        parent3_id: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      newSkills.push(s);
      created.push({ name, parentStr: pickField(r, "Parent Skill") || "" });
    }
    setSkills((prev) => {
      const merged = [...newSkills, ...prev];
      const nameToId = new Map(merged.map((s) => [s.name, String(s.id)]));
      created.forEach((item) => {
        const nm = item.name;
        const raw = (item.parentStr || "").trim();
        if (!raw || /^(n\/a|—|-|none)$/i.test(raw)) return;
        const parentNames = raw.split(",").map((p) => p.trim()).filter(Boolean);
        const ordered = parentNames
          .map((p) => nameToId.get(p))
          .filter(Boolean)
          .filter((v, i, a) => a!.indexOf(v!) === i)
          .slice(0, 3) as string[];
        const idx = merged.findIndex((s) => s.name === nm);
        if (idx >= 0) {
          merged[idx] = {
            ...merged[idx],
            parent_id: ordered[0] ?? null,
            parent2_id: ordered[1] ?? null,
            parent3_id: ordered[2] ?? null,
          };
        }
      });
      return merged;
    });
  }

  const showMagicBuilder =
    showDetails &&
    active &&
    (active.type === "spell" || active.type === "psionic skill" || active.type === "reverberation");
  const showSpecialDetails = showDetails && active && active.type === "special ability";

  return (
    <main className="min-h-screen px-6 py-10">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) router.back();
              else router.push("/worldbuilder");
            }}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
            aria-label="Go back"
          >
            ← Back
          </button>

          <div>
            <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
              Skill&nbsp;Sets
            </h1>
            <p className="mt-1 text-sm text-zinc-300">Grouped skills for races, classes, and modules.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-gold" onClick={onNew}>New</button>
          <button className="btn btn-gold" onClick={() => fileRef.current?.click()} title="Import CSV/TSV">
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              (e.target as HTMLInputElement).value = "";
            }}
          />
          <button className="btn btn-gold" onClick={saveActive}>💾 Save</button>
          <button onClick={onDelete} disabled={!active} className="btn btn-gold disabled:opacity-50" title="Delete selected">
            Delete
          </button>
        </div>
      </header>

      {/* Shell */}
      <section className="max-w-7xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            value={qtext}
            onChange={(e) => {
              setQtext(e.target.value);
              setPageIndex(0);
            }}
            placeholder="Search name/type/attr/definition…"
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
          />
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={fType}
            onChange={(e) => {
              setFType(e.target.value as any);
              setPageIndex(0);
            }}
          >
            <option value="">Type (all)</option>
            {TYPE_ITEMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={fPrimary}
            onChange={(e) => {
              setFPrimary(e.target.value as any);
              setPageIndex(0);
            }}
          >
            <option value="">Primary (all)</option>
            {ATTR_ITEMS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={fSecondary}
            onChange={(e) => {
              setFSecondary(e.target.value as any);
              setPageIndex(0);
            }}
          >
            <option value="">Secondary (all)</option>
            {ATTR_ITEMS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={fTier}
            onChange={(e) => {
              setFTier(e.target.value as any);
              setPageIndex(0);
            }}
          >
            <option value="">Tier (all)</option>
            {TIER_ITEMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LIST */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-zinc-300">Results: {filtered.length}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-400">Page size</span>
                <select
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-sm"
                  value={String(pageSize)}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPageIndex(0);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-400">
                  <tr>
                    <th className="py-1 pr-2">Name</th>
                    <th className="py-1 pr-2">Type</th>
                    <th className="py-1 pr-2">Tier</th>
                    <th className="py-1 pr-2">Primary</th>
                    <th className="py-1 pr-2">Parent(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500">
                        {skills.length ? "No results." : "No skills yet."}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((s) => {
                      const parents = [s.parent_id, s.parent2_id, s.parent3_id]
                        .map((pid) => skills.find((x) => String(x.id) === String(pid))?.name)
                        .filter(Boolean)
                        .join(", ");
                      return (
                        <tr
                          key={String(s.id)}
                          className={`border-t border-white/10 hover:bg-white/5 cursor-pointer ${
                            activeId === String(s.id) ? "bg-white/10" : ""
                          }`}
                          onClick={() => {
                            setActiveId(String(s.id));
                            setMode("list");
                          }}
                        >
                          <td className="py-2 pr-2">{s.name || "(unnamed)"}</td>
                          <td className="py-2 pr-2">{s.type}</td>
                          <td className="py-2 pr-2">{tierToText(s.tier)}</td>
                          <td className="py-2 pr-2">{s.primary_attribute}</td>
                          <td className="py-2 pr-2">{parents || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <button
                className="rounded border border-white/15 px-2 py-1 disabled:opacity-50"
                onClick={() => setPageIndex(0)}
                disabled={clampedIndex <= 0}
              >
                ⏮ First
              </button>
              <button
                className="rounded border border-white/15 px-2 py-1 disabled:opacity-50"
                onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                disabled={clampedIndex <= 0}
              >
                ◀ Prev
              </button>
              <div className="px-2">Page {clampedIndex + 1} / {pages}</div>
              <button
                className="rounded border border-white/15 px-2 py-1 disabled:opacity-50"
                onClick={() => setPageIndex((i) => Math.min(pages - 1, i + 1))}
                disabled={clampedIndex >= pages - 1}
              >
                Next ▶
              </button>
              <button
                className="rounded border border-white/15 px-2 py-1 disabled:opacity-50"
                onClick={() => setPageIndex(pages - 1)}
                disabled={clampedIndex >= pages - 1}
              >
                Last ⏭
              </button>
            </div>
          </div>

          {/* RIGHT PANE */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            {!active ? (
              <p className="text-sm text-zinc-400">Select a skill or click New.</p>
            ) : mode === "list" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold text-zinc-100 flex-1">
                    {active.name || "(unnamed)"}
                  </div>
                  <button
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
                    onClick={() => setMode("edit")}
                  >
                    Edit
                  </button>
                </div>
                <div className="text-xs text-zinc-400">
                  Type: <span className="text-zinc-200">{active.type}</span> &nbsp;|&nbsp; Tier:{" "}
                  <span className="text-zinc-200">{tierToText(active.tier)}</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Attr: <span className="text-zinc-200">{active.primary_attribute}</span>
                  {active.secondary_attribute !== "NA" ? (
                    <> / <span className="text-zinc-200">{active.secondary_attribute}</span></>
                  ) : null}
                </div>
                <div className="text-xs text-zinc-400">
                  Parent ID(s):{" "}
                  <span className="text-zinc-200">
                    {[active.parent_id, active.parent2_id, active.parent3_id].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  Created by: <span className="text-zinc-200">{active.created_by?.username || "Unknown"}</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Created at: <span className="text-zinc-200">{nv(active.created_at)}</span> · Updated at:{" "}
                  <span className="text-zinc-200">{nv(active.updated_at)}</span>
                </div>
                <div>
                  <div className="text-sm text-zinc-300 mb-1">Definition</div>
                  <textarea
                    readOnly
                    rows={8}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                    value={active.definition || ""}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-sm text-zinc-300 mb-1">Name</div>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                      value={active.name}
                      onChange={(e) => updateActive({ name: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <div className="text-sm text-zinc-300 mb-1">Type</div>
                    <div className="flex gap-2">
                      <select
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                        value={active.type}
                        onChange={(e) => updateActive({ type: e.target.value as SkillType })}
                      >
                        {TYPE_ITEMS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {DETAIL_TYPES.has(active.type) && (
                        <button
                          className="shrink-0 rounded-xl border border-amber-300/40 text-amber-200/90 px-3 py-2 text-sm hover:bg-amber-300/10"
                          onClick={() => setShowDetails((s) => !s)}
                        >
                          Type details…
                        </button>
                      )}
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md.grid-cols-3 md:grid-cols-3 gap-3">
                  <label className="block">
                    <div className="text-sm text-zinc-300 mb-1">Tier</div>
                    <select
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                      value={tierToText(active.tier)}
                      onChange={(e) => updateActive({ tier: textToTier(e.target.value as TierText) })}
                    >
                      {TIER_ITEMS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <div className="text-sm text-zinc-300 mb-1">Primary Attribute</div>
                    <select
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                      value={active.primary_attribute}
                      onChange={(e) => updateActive({ primary_attribute: e.target.value as Attr })}
                    >
                      {ATTR_ITEMS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <div className="text-sm text-zinc-300 mb-1">Secondary Attribute</div>
                    <select
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                      value={active.secondary_attribute}
                      onChange={(e) => updateActive({ secondary_attribute: e.target.value as Attr })}
                    >
                      {ATTR_ITEMS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Definition */}
                <label className="block">
                  <div className="text-sm text-zinc-300 mb-1">Definition</div>
                  <textarea
                    rows={8}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                    value={active.definition ?? ""}
                    onChange={(e) => updateActive({ definition: e.target.value })}
                  />
                </label>

                {/* Parents */}
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-sm text-zinc-300 mb-2">Parent Skills (up to 3)</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {(["parent_id", "parent2_id", "parent3_id"] as const).map((key, idx) => (
                      <select
                        key={key}
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                        value={String((active as any)[key] ?? "")}
                        onChange={(e) => {
                          const ids: (string | number | null)[] = [
                            active.parent_id ?? null,
                            active.parent2_id ?? null,
                            active.parent3_id ?? null,
                          ];
                          ids[idx] = e.target.value || null;
                          setParentsOrdered(ids);
                        }}
                      >
                        <option value="">(none)</option>
                        {candidateParents.map((p) => (
                          <option key={String(p.id)} value={String(p.id)}>
                            {p.name || "(unnamed)"} — T{p.tier ?? "N/A"} / {p.primary_attribute}
                            {p.secondary_attribute !== "NA" ? `/${p.secondary_attribute}` : ""}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Rules: parent tier must equal child tier − 1; must share at least one non-NA
                    attribute; cannot select self.
                  </div>
                </div>

                {showMagicBuilder && (
                  <MagicBuilder seedSkill={active} allSkills={skills} onClose={() => setShowDetails(false)} />
                )}
                {showSpecialDetails && (
                  <SpecialAbilityDetails seedSkill={active} onClose={() => setShowDetails(false)} />
                )}

                <div className="flex gap-2">
                  <button className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/10" onClick={() => setMode("list")}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
