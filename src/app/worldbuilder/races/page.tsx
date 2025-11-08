"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/* ---------- Types ---------- */
type TabKey = "identity" | "attributes" | "bonuses" | "preview";

type RaceDefinition = {
  legacy_description?: string | null;
  physical_characteristics?: string | null;
  physical_description?: string | null;
  racial_quirk?: string | null;
  quirk_success_effect?: string | null;
  quirk_failure_effect?: string | null;
  common_languages_known?: string | null;
  common_archetypes?: string | null;
  examples_by_genre?: string | null;
  cultural_mindset?: string | null;
  outlook_on_magic?: string | null;
};

type RaceAttributes = {
  age_range?: string | null;
  size?: string | null;
  strength_max?: number | null;
  dexterity_max?: number | null;
  constitution_max?: number | null;
  intelligence_max?: number | null;
  wisdom_max?: number | null;
  charisma_max?: number | null;
  base_magic?: number | null;
  base_movement?: number | null;
};

type BonusItem = {
  slot_idx: number;
  skill_id: number | null;
  points: number;
  skill_name?: string | null;
};

type Race = {
  id: number;
  name: string;
  created_by_id?: string | null;
  created_at?: string;
  updated_at?: string;
  definition?: RaceDefinition | null;
  attributes?: RaceAttributes | null;
  bonus_skills?: BonusItem[] | null;
  special_abilities?: BonusItem[] | null;
};

type RaceLite = { id: number; name: string };
type SkillOption = { id: number; name: string };

/* ---------- Constants ---------- */
const MAX_BONUS_SKILLS = 7;
const MAX_SPECIALS = 5;
const SIZE_OPTIONS = ["tiny", "small", "average", "large", "gigantic", "titan"] as const;

/* ---------- Helpers ---------- */
async function api<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

function padRows(rows: BonusItem[] | null | undefined, max: number): BonusItem[] {
  const base = (rows ?? []).slice().sort((a, b) => a.slot_idx - b.slot_idx);
  while (base.length < max) {
    base.push({ slot_idx: base.length, skill_id: null, points: 0, skill_name: "(none)" });
  }
  return base.slice(0, max);
}

/* ---------- Page ---------- */
export default function RacesPage() {
  // Lists/selection
  const [racesLite, setRacesLite] = useState<RaceLite[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Server object (for name/header, etc.)
  const [race, setRace] = useState<Race | null>(null);

  // Drafts that persist across tab switches
  const [draftDef, setDraftDef] = useState<RaceDefinition>({});
  const [draftAttr, setDraftAttr] = useState<RaceAttributes>({});
  const [draftBonus, setDraftBonus] = useState<BonusItem[]>(padRows([], MAX_BONUS_SKILLS));
  const [draftSpecial, setDraftSpecial] = useState<BonusItem[]>(padRows([], MAX_SPECIALS));

  // Candidates
  const [skillCandidates, setSkillCandidates] = useState<SkillOption[]>([]);
  const [specialCandidates, setSpecialCandidates] = useState<SkillOption[]>([]);

  // UI
  const [tab, setTab] = useState<TabKey>("identity");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  useEffect(() => setRenameValue(""), [selectedId]);

  // --- load initial ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const listRes = await api<{ ok: true; data: RaceLite[] }>("/api/races?lite=1");
        setRacesLite(listRes.data);
        const chosen = selectedId ?? listRes.data[0]?.id ?? null;
        if (chosen != null) await loadRace(chosen);
        const [sk, sp] = await Promise.all([
          api<{ ok: true; data: SkillOption[] }>("/api/races?candidates=skills"),
          api<{ ok: true; data: SkillOption[] }>("/api/races?candidates=specials"),
        ]);
        setSkillCandidates(sk.data);
        setSpecialCandidates(sp.data);
      } catch (e: any) {
        alert(`Load failed: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRace(id: number) {
    const full = await api<{ ok: true; data: Race }>(`/api/races?id=${id}`);
    const r = full.data;
    setRace(r);
    setSelectedId(id);

    // seed drafts from server
    setDraftDef({
      legacy_description: r.definition?.legacy_description ?? "",
      physical_characteristics: r.definition?.physical_characteristics ?? "",
      physical_description: r.definition?.physical_description ?? "",
      racial_quirk: r.definition?.racial_quirk ?? "",
      quirk_success_effect: r.definition?.quirk_success_effect ?? "",
      quirk_failure_effect: r.definition?.quirk_failure_effect ?? "",
      common_languages_known: r.definition?.common_languages_known ?? "",
      common_archetypes: r.definition?.common_archetypes ?? "",
      examples_by_genre: r.definition?.examples_by_genre ?? "",
      cultural_mindset: r.definition?.cultural_mindset ?? "",
      outlook_on_magic: r.definition?.outlook_on_magic ?? "",
    });

    setDraftAttr({
      age_range: r.attributes?.age_range ?? "",
      size: r.attributes?.size ?? "",
      strength_max: r.attributes?.strength_max ?? null,
      dexterity_max: r.attributes?.dexterity_max ?? null,
      constitution_max: r.attributes?.constitution_max ?? null,
      intelligence_max: r.attributes?.intelligence_max ?? null,
      wisdom_max: r.attributes?.wisdom_max ?? null,
      charisma_max: r.attributes?.charisma_max ?? null,
      base_magic: r.attributes?.base_magic ?? null,
      base_movement: r.attributes?.base_movement ?? null,
    });

    setDraftBonus(padRows(r.bonus_skills, MAX_BONUS_SKILLS));
    setDraftSpecial(padRows(r.special_abilities, MAX_SPECIALS));
  }

  async function refreshLiteAndMaybeSelect(idToSelect?: number | null) {
    const listRes = await api<{ ok: true; data: RaceLite[] }>("/api/races?lite=1");
    setRacesLite(listRes.data);
    const pick =
      idToSelect ?? (listRes.data.find((r) => r.id === selectedId)?.id ?? listRes.data[0]?.id ?? null);
    if (pick != null) await loadRace(pick);
    else {
      setRace(null);
      setSelectedId(null);
      setDraftDef({});
      setDraftAttr({});
      setDraftBonus(padRows([], MAX_BONUS_SKILLS));
      setDraftSpecial(padRows([], MAX_SPECIALS));
    }
  }

  // --- selectors/CRUD ---
  async function onSelectRace(idStr: string) {
    const id = Number(idStr);
    if (!Number.isFinite(id)) return;
    setLoading(true);
    try {
      await loadRace(id);
    } catch (e: any) {
      alert(`Failed to load race: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function onCreateRace() {
    const name = (newName || "").trim();
    if (!name) return;
    setLoading(true);
    try {
      await api("/api/races", { method: "POST", body: JSON.stringify({ name }) });
      setNewName("");
      await refreshLiteAndMaybeSelect(null);
    } catch (e: any) {
      alert(`Create failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function onRenameRace() {
    if (!race) return;
    const nm = (renameValue || "").trim();
    if (!nm) return;
    setLoading(true);
    try {
      await api("/api/races", { method: "PUT", body: JSON.stringify({ id: race.id, rename_to: nm }) });
      setRenameValue("");
      await refreshLiteAndMaybeSelect(race.id);
    } catch (e: any) {
      alert(`Rename failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteRace() {
    if (!race) return;
    if (!confirm(`Delete race "${race.name}"?`)) return;
    setLoading(true);
    try {
      await api("/api/races", { method: "DELETE", body: JSON.stringify({ id: race.id }) });
      await refreshLiteAndMaybeSelect(null);
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Save (uses drafts, not FormData) ---------- */
  async function onSave() {
    if (!race) return;
    setSaving(true);
    try {
      // definition
      await api("/api/races", {
        method: "PUT",
        body: JSON.stringify({
          id: race.id,
          section: "definition",
          payload: {
            legacy_description: nz(draftDef.legacy_description),
            physical_characteristics: nz(draftDef.physical_characteristics),
            physical_description: nz(draftDef.physical_description),
            racial_quirk: nz(draftDef.racial_quirk),
            quirk_success_effect: nz(draftDef.quirk_success_effect),
            quirk_failure_effect: nz(draftDef.quirk_failure_effect),
            common_languages_known: nz(draftDef.common_languages_known),
            common_archetypes: nz(draftDef.common_archetypes),
            examples_by_genre: nz(draftDef.examples_by_genre),
            cultural_mindset: nz(draftDef.cultural_mindset),
            outlook_on_magic: nz(draftDef.outlook_on_magic),
          },
        }),
      });

      // attributes
      await api("/api/races", {
        method: "PUT",
        body: JSON.stringify({
          id: race.id,
          section: "attributes",
          payload: {
            age_range: nz(draftAttr.age_range),
            size: nz(draftAttr.size),
            strength_max: nn(draftAttr.strength_max),
            dexterity_max: nn(draftAttr.dexterity_max),
            constitution_max: nn(draftAttr.constitution_max),
            intelligence_max: nn(draftAttr.intelligence_max),
            wisdom_max: nn(draftAttr.wisdom_max),
            charisma_max: nn(draftAttr.charisma_max),
            base_magic: nn(draftAttr.base_magic),
            base_movement: nn(draftAttr.base_movement),
          },
        }),
      });

      // bonus skills
      await api("/api/races", {
        method: "PUT",
        body: JSON.stringify({
          id: race.id,
          section: "bonus_skills",
          items: draftBonus
            .filter((b) => b.skill_id != null)
            .map((b, idx) => ({ skill_id: b.skill_id!, points: Math.max(0, b.points | 0), slot_idx: idx })),
        }),
      });

      // specials
      await api("/api/races", {
        method: "PUT",
        body: JSON.stringify({
          id: race.id,
          section: "special_abilities",
          items: draftSpecial
            .filter((s) => s.skill_id != null)
            .map((s, idx) => ({ skill_id: s.skill_id!, points: Math.max(0, s.points | 0), slot_idx: idx })),
        }),
      });

      await loadRace(race.id);
      alert("Race saved.");
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Draft setters ---------- */
  const setDef = <K extends keyof RaceDefinition>(k: K, v: string) =>
    setDraftDef((d) => ({ ...d, [k]: v }));

  const setAttrText = (k: keyof RaceAttributes, v: string) =>
    setDraftAttr((a) => ({ ...a, [k]: v }));

  const setAttrNum = (k: keyof RaceAttributes, v: string) =>
    setDraftAttr((a) => ({
      ...a,
      [k]: v === "" ? null : Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : null,
    }));

  function setBonusName(row: BonusItem, name: string) {
    const hit = skillCandidates.find((s) => s.name === name) || null;
    setDraftBonus((arr) =>
      arr.map((r) =>
        r.slot_idx === row.slot_idx
          ? {
              ...r,
              skill_name: name || "(none)",
              skill_id: hit ? hit.id : null,
            }
          : r
      )
    );
  }
  function setBonusPoints(row: BonusItem, pts: string) {
    setDraftBonus((arr) =>
      arr.map((r) => (r.slot_idx === row.slot_idx ? { ...r, points: Math.max(0, Number(pts) | 0) } : r))
    );
  }
  function setSpecialName(row: BonusItem, name: string) {
    const hit = specialCandidates.find((s) => s.name === name) || null;
    setDraftSpecial((arr) =>
      arr.map((r) =>
        r.slot_idx === row.slot_idx
          ? {
              ...r,
              skill_name: name || "(none)",
              skill_id: hit ? hit.id : null,
            }
          : r
      )
    );
  }
  function setSpecialPoints(row: BonusItem, pts: string) {
    setDraftSpecial((arr) =>
      arr.map((r) => (r.slot_idx === row.slot_idx ? { ...r, points: Math.max(0, Number(pts) | 0) } : r))
    );
  }

  /* ---------- Preview ---------- */
  const previewText = useMemo(() => {
    if (!race) return "";
    const nv = (x: any) => (x == null || x === "" ? "—" : x);

    const defEntries = Object.entries(draftDef).filter(([, v]) => (v ?? "").toString().trim() !== "");
    const defLines = defEntries.map(
      ([k, v]) =>
        `${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${
          String(v).length > 200 ? `${String(v).slice(0, 200)}…` : v
        }`
    );

    const bonusLines =
      draftBonus.filter((b) => b.skill_id).length === 0
        ? [" • (none)"]
        : draftBonus
            .filter((b) => b.skill_id)
            .sort((a, b) => a.slot_idx - b.slot_idx)
            .map((b) => ` • ${b.skill_name ?? `#${b.skill_id}`} (+${b.points})`);

    const specialLines =
      draftSpecial.filter((s) => s.skill_id).length === 0
        ? [" • (none)"]
        : draftSpecial
            .filter((s) => s.skill_id)
            .sort((a, b) => a.slot_idx - b.slot_idx)
            .map((s) => ` • ${s.skill_name ?? `#${s.skill_id}`} (+${s.points})`);

    return [
      `Race: ${race.name}`,
      "— Identity & Lore —",
      ...defLines,
      "— Attributes —",
      `Age/Size: ${nv(draftAttr.age_range)} / ${nv(draftAttr.size)}`,
      `STR/DEX/CON: ${nv(draftAttr.strength_max)} / ${nv(draftAttr.dexterity_max)} / ${nv(draftAttr.constitution_max)}`,
      `INT/WIS/CHA: ${nv(draftAttr.intelligence_max)} / ${nv(draftAttr.wisdom_max)} / ${nv(draftAttr.charisma_max)}`,
      `Base Magic/Move: ${nv(draftAttr.base_magic)} / ${nv(draftAttr.base_movement)}`,
      "— Bonus Skills —",
      ...bonusLines,
      "— Racial Special Abilities —",
      ...specialLines,
    ].join("\n");
  }, [race, draftDef, draftAttr, draftBonus, draftSpecial]);

  const raceName = race?.name ?? "";

  /* ---------- render ---------- */
  return (
    <main className="min-h-screen px-6 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Link href="/worldbuilder" className="hover:text-neutral-200">World Builder</Link>
              <span>›</span>
              <span>Races</span>
            </div>
            <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
              Race Designer
            </h1>
            <p className="mt-1 text-sm text-neutral-400">Define racial lore, attribute caps/bases, and racial bonuses. Remember: the GM is G.O.D.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800/40 disabled:opacity-50"
              onClick={onSave}
              disabled={saving || loading || !race}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="rounded-md border border-rose-700 text-rose-200 px-3 py-1.5 text-sm hover:bg-rose-900/30 disabled:opacity-50"
              onClick={onDeleteRace}
              disabled={loading || !race}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <header className="max-w-7xl mx-auto mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Race:</span>
          <select
            className="w-64 rounded-md bg-neutral-900/50 border border-neutral-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
            value={selectedId ?? ""}
            onChange={(e) => onSelectRace(e.target.value)}
            disabled={loading}
          >
            {racesLite.length === 0 && <option value="">(none)</option>}
            {racesLite.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* New race */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New race name…"
            className="w-56 rounded-md bg-neutral-900/50 border border-neutral-700 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreateRace()}
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="button"
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800/40"
            onClick={onCreateRace}
            disabled={loading || !newName.trim()}
          >
            Add
          </button>
        </div>

        {/* Rename */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={race ? `Rename “${raceName}”…` : "Rename…"}
            className="w-52 rounded-md bg-neutral-900/50 border border-neutral-700 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onRenameRace()}
            disabled={loading || !race}
            autoComplete="off"
          />
          <button
            type="button"
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800/40"
            onClick={onRenameRace}
            disabled={loading || !race || !renameValue.trim()}
          >
            Apply
          </button>
        </div>

        <div className="flex-1" />
      </header>

      {/* Editor */}
      <section className="max-w-7xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-950/30 p-4">
        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Tab tab="identity" current={tab} setTab={setTab} label="Identity & Lore" />
          <Tab tab="attributes" current={tab} setTab={setTab} label="Attributes" />
          <Tab tab="bonuses" current={tab} setTab={setTab} label="Bonuses" />
          <Tab tab="preview" current={tab} setTab={setTab} label="Preview" />
        </div>

        <div className="border border-neutral-800 rounded-2xl p-4 bg-neutral-950/30">
          {/* Identity */}
          <div className={tab === "identity" ? "block" : "hidden"}>
            {!race ? (
              <div className="p-2 text-neutral-400">Select or add a race.</div>
            ) : (
              <div className="grid gap-4">
                <Area label="Legacy Description" value={draftDef.legacy_description ?? ""} onChange={(v) => setDef("legacy_description", v)} />
                <Area label="Physical Characteristics" value={draftDef.physical_characteristics ?? ""} onChange={(v) => setDef("physical_characteristics", v)} />
                <Area label="Physical Description" value={draftDef.physical_description ?? ""} onChange={(v) => setDef("physical_description", v)} />
                <div className="flex items-end gap-6">
                  <Field label="Racial Quirk">
                    <input
                      className="w-80 rounded-md bg-neutral-900/50 border border-neutral-700 px-3 py-1.5 text-sm"
                      value={draftDef.racial_quirk ?? ""}
                      onChange={(e) => setDef("racial_quirk", e.target.value)}
                    />
                  </Field>
                </div>
                <Area label="Quirk Success Effect" value={draftDef.quirk_success_effect ?? ""} onChange={(v) => setDef("quirk_success_effect", v)} rows={3} />
                <Area label="Quirk Failure Effect" value={draftDef.quirk_failure_effect ?? ""} onChange={(v) => setDef("quirk_failure_effect", v)} rows={3} />
                <Area label="Common Languages Known" value={draftDef.common_languages_known ?? ""} onChange={(v) => setDef("common_languages_known", v)} rows={2} />
                <Area label="Common Archetypes" value={draftDef.common_archetypes ?? ""} onChange={(v) => setDef("common_archetypes", v)} rows={2} />
                <Area label="Examples of Use in Different Genres" value={draftDef.examples_by_genre ?? ""} onChange={(v) => setDef("examples_by_genre", v)} rows={3} />
                <Area label="Cultural Mindset" value={draftDef.cultural_mindset ?? ""} onChange={(v) => setDef("cultural_mindset", v)} rows={3} />
                <Area label="Outlook On Magic" value={draftDef.outlook_on_magic ?? ""} onChange={(v) => setDef("outlook_on_magic", v)} rows={3} />
              </div>
            )}
          </div>

          {/* Attributes */}
          <div className={tab === "attributes" ? "block" : "hidden"}>
            {!race ? (
              <div className="p-2 text-neutral-400">Select or add a race.</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Field label="Age Range">
                    <input
                      className="w-56 rounded-md bg-neutral-900/50 border border-neutral-700 px-3 py-1.5 text-sm"
                      placeholder="e.g., 15–90"
                      value={draftAttr.age_range ?? ""}
                      onChange={(e) => setAttrText("age_range", e.target.value)}
                    />
                  </Field>
                  <Field label="Size">
                    <select
                      className="w-44 rounded-md bg-neutral-900/50 border border-neutral-700 px-3 py-1.5 text-sm"
                      value={draftAttr.size ?? ""}
                      onChange={(e) => setAttrText("size", e.target.value)}
                    >
                      <option value="">(choose)</option>
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="flex items-center gap-3">
                  <Num label="STR Max" value={draftAttr.strength_max} onChange={(v) => setAttrNum("strength_max", v)} />
                  <Num label="DEX Max" value={draftAttr.dexterity_max} onChange={(v) => setAttrNum("dexterity_max", v)} />
                  <Num label="CON Max" value={draftAttr.constitution_max} onChange={(v) => setAttrNum("constitution_max", v)} />
                </div>

                <div className="flex items-center gap-3">
                  <Num label="INT Max" value={draftAttr.intelligence_max} onChange={(v) => setAttrNum("intelligence_max", v)} />
                  <Num label="WIS Max" value={draftAttr.wisdom_max} onChange={(v) => setAttrNum("wisdom_max", v)} />
                  <Num label="CHA Max" value={draftAttr.charisma_max} onChange={(v) => setAttrNum("charisma_max", v)} />
                </div>

                <div className="flex items-center gap-3">
                  <Num label="Base Magic" value={draftAttr.base_magic} onChange={(v) => setAttrNum("base_magic", v)} />
                  <Num label="Base Movement" value={draftAttr.base_movement} onChange={(v) => setAttrNum("base_movement", v)} />
                </div>
              </div>
            )}
          </div>

          {/* Bonuses */}
          <div className={tab === "bonuses" ? "block" : "hidden"}>
            {!race ? (
              <div className="p-2 text-neutral-400">Select or add a race.</div>
            ) : (
              <div className="flex flex-col gap-6">
                <section>
                  <div className="font-semibold mb-2">Bonus Skills (Tier 1 only)</div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-3">
                    <div className="flex flex-col gap-2">
                      {draftBonus.map((row) => (
                        <div key={row.slot_idx} className="flex items-center gap-3">
                          <select
                            className="min-w-64 rounded-md bg-neutral-900/50 border border-neutral-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
                            value={row.skill_name ?? "(none)"}
                            onChange={(e) => setBonusName(row, e.target.value)}
                          >
                            <option>(none)</option>
                            {skillCandidates.map((o) => (
                              <option key={o.id}>{o.name}</option>
                            ))}
                          </select>
                          <span className="text-sm text-neutral-400">pts</span>
                          <input
                            type="number"
                            min={0}
                            className="w-20 rounded-md bg-neutral-900/50 border border-neutral-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
                            value={row.points}
                            onChange={(e) => setBonusPoints(row, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <div className="font-semibold mb-2">Racial Special Abilities</div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-3">
                    <div className="flex flex-col gap-2">
                      {draftSpecial.map((row) => (
                        <div key={row.slot_idx} className="flex items-center gap-3">
                          <select
                            className="min-w-64 rounded-md bg-neutral-900/50 border border-neutral-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
                            value={row.skill_name ?? "(none)"}
                            onChange={(e) => setSpecialName(row, e.target.value)}
                          >
                            <option>(none)</option>
                            {specialCandidates.map((o) => (
                              <option key={o.id}>{o.name}</option>
                            ))}
                          </select>
                          <span className="text-sm text-neutral-400">pts</span>
                          <input
                            type="number"
                            min={0}
                            className="w-20 rounded-md bg-neutral-900/50 border border-neutral-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
                            value={row.points}
                            onChange={(e) => setSpecialPoints(row, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className={tab === "preview" ? "block" : "hidden"}>
            <textarea
              readOnly
              value={previewText}
              className="w-full h-[520px] rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Small components ---------- */
function Tab({
  tab,
  current,
  setTab,
  label,
}: {
  tab: TabKey;
  current: TabKey;
  setTab: (t: TabKey) => void;
  label: string;
}) {
  const active = current === tab;
  return (
    <button
      type="button"
      aria-selected={active}
      onClick={() => setTab(tab)}
      className={`px-3 py-1.5 rounded-md border text-sm transition ${
        active
          ? "bg-neutral-800/20 border-neutral-700 text-neutral-200"
          : "hover:bg-neutral-800/30 border-neutral-700 text-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-400">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        rows={rows ?? 4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-md bg-neutral-900/50 border border-neutral-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
        autoComplete="off"
        spellCheck={false}
      />
    </Field>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-neutral-300">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-36 rounded-md bg-neutral-900/50 border border-neutral-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
        autoComplete="off"
      />
    </div>
  );
}

/* ---------- tiny utils ---------- */
function nz<T extends string | null | undefined>(v: T): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}
function nn<T extends number | null | undefined>(v: T): number | null {
  return v == null || Number.isNaN(Number(v)) ? null : Math.trunc(Number(v));
}
