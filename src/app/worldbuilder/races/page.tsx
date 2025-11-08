"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NavigationTabs from "@/components/shared/NavigationTabs";
import SaveIndicator from "@/components/shared/SaveIndicator";
import RecordSelector from "@/components/shared/RecordSelector";
import FormField from "@/components/shared/FormField";
import { useAutoSave } from "@/hooks/useAutoSave";
import { apiClient } from "@/lib/api-client";

/* ---------- local nav ---------- */
function WBNav({
  current = "races",
}: {
  current?: "worlds" | "creatures" | "skillsets" | "races" | "inventory";
}) {
  const items = [
    { href: "/worldbuilder/worlds", key: "worlds", label: "Worlds" },
    { href: "/worldbuilder/creatures", key: "creatures", label: "Creatures" },
    { href: "/worldbuilder/skillsets", key: "skillsets", label: "Skillsets" },
    { href: "/worldbuilder/races", key: "races", label: "Races" },
    { href: "/worldbuilder/inventory", key: "inventory", label: "Inventory" },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = current === it.key;
        return (
          <Link
            key={it.key}
            href={it.href}
            className={[
              "rounded-xl px-3 py-1.5 text-sm border",
              active
                ? "border-violet-400/40 text-violet-200 bg-violet-400/10"
                : "border-white/15 text-zinc-200 hover:bg-white/10",
            ].join(" ")}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

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

const TAB_SECTIONS = [
  { id: "identity", label: "Identity & Lore" },
  { id: "attributes", label: "Attributes" },
  { id: "bonuses", label: "Bonuses" },
  { id: "preview", label: "Preview" },
];

/* ---------- Helpers ---------- */
function padRows(rows: BonusItem[] | null | undefined, max: number): BonusItem[] {
  const base = (rows ?? []).slice().sort((a, b) => a.slot_idx - b.slot_idx);
  while (base.length < max) {
    base.push({ slot_idx: base.length, skill_id: null, points: 0, skill_name: "(none)" });
  }
  return base.slice(0, max);
}

function nz<T extends string | null | undefined>(v: T): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

function nn<T extends number | null | undefined>(v: T): number | null {
  return v == null || Number.isNaN(Number(v)) ? null : Math.trunc(Number(v));
}

/* ---------- Page ---------- */
export default function RacesPage() {
  // Lists/selection
  const [racesLite, setRacesLite] = useState<RaceLite[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
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

  // Auto-save
  const { save, isSaving, lastSaved } = useAutoSave({
    onSave: async () => {
      if (!race) return;
      await saveAllSections(race.id);
    },
  });

  // --- load initial ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const listRes = await apiClient<{ ok: true; data: RaceLite[] }>("/api/races?lite=1");
        setRacesLite(listRes.data);
        const chosen = selectedId ?? listRes.data[0]?.id ?? null;
        if (chosen != null) await loadRace(chosen);
        const [sk, sp] = await Promise.all([
          apiClient<{ ok: true; data: SkillOption[] }>("/api/races?candidates=skills"),
          apiClient<{ ok: true; data: SkillOption[] }>("/api/races?candidates=specials"),
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
    const full = await apiClient<{ ok: true; data: Race }>(`/api/races?id=${id}`);
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
    const listRes = await apiClient<{ ok: true; data: RaceLite[] }>("/api/races?lite=1");
    setRacesLite(listRes.data);
    const pick =
      idToSelect ?? (listRes.data.find((r: RaceLite) => r.id === selectedId)?.id ?? listRes.data[0]?.id ?? null);
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

  // --- CRUD ---
  async function handleSelectRace(id: number | null) {
    if (id === null) return;
    setLoading(true);
    try {
      await loadRace(id);
    } catch (e: any) {
      alert(`Failed to load race: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRace(name: string): Promise<void> {
    setLoading(true);
    try {
      await apiClient("/api/races", { method: "POST", body: JSON.stringify({ name }) });
      await refreshLiteAndMaybeSelect(null);
    } catch (e: any) {
      alert(`Create failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRenameRace(id: number, newName: string): Promise<void> {
    setLoading(true);
    try {
      await apiClient("/api/races", { method: "PUT", body: JSON.stringify({ id, rename_to: newName }) });
      await refreshLiteAndMaybeSelect(id);
    } catch (e: any) {
      alert(`Rename failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRace(id: number): Promise<void> {
    if (!confirm(`Delete this race?`)) return;
    setLoading(true);
    try {
      await apiClient("/api/races", { method: "DELETE", body: JSON.stringify({ id }) });
      await refreshLiteAndMaybeSelect(null);
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Save all sections ---------- */
  async function saveAllSections(raceId: number) {
    // definition
    await apiClient("/api/races", {
      method: "PUT",
      body: JSON.stringify({
        id: raceId,
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
    await apiClient("/api/races", {
      method: "PUT",
      body: JSON.stringify({
        id: raceId,
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
    await apiClient("/api/races", {
      method: "PUT",
      body: JSON.stringify({
        id: raceId,
        section: "bonus_skills",
        items: draftBonus
          .filter((b) => b.skill_id != null)
          .map((b, idx) => ({ skill_id: b.skill_id!, points: Math.max(0, b.points | 0), slot_idx: idx })),
      }),
    });

    // specials
    await apiClient("/api/races", {
      method: "PUT",
      body: JSON.stringify({
        id: raceId,
        section: "special_abilities",
        items: draftSpecial
          .filter((s) => s.skill_id != null)
          .map((s, idx) => ({ skill_id: s.skill_id!, points: Math.max(0, s.points | 0), slot_idx: idx })),
      }),
    });
  }

  /* ---------- Draft setters with auto-save ---------- */
  const setDef = <K extends keyof RaceDefinition>(k: K, v: string) => {
    setDraftDef((d) => ({ ...d, [k]: v }));
    save();
  };

  const setAttrText = (k: keyof RaceAttributes, v: string) => {
    setDraftAttr((a) => ({ ...a, [k]: v }));
    save();
  };

  const setAttrNum = (k: keyof RaceAttributes, v: string) => {
    setDraftAttr((a) => ({
      ...a,
      [k]: v === "" ? null : Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : null,
    }));
    save();
  };

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
    save();
  }

  function setBonusPoints(row: BonusItem, pts: string) {
    setDraftBonus((arr) =>
      arr.map((r) => (r.slot_idx === row.slot_idx ? { ...r, points: Math.max(0, Number(pts) | 0) } : r))
    );
    save();
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
    save();
  }

  function setSpecialPoints(row: BonusItem, pts: string) {
    setDraftSpecial((arr) =>
      arr.map((r) => (r.slot_idx === row.slot_idx ? { ...r, points: Math.max(0, Number(pts) | 0) } : r))
    );
    save();
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

  /* ---------- render ---------- */
  return (
    <main className="min-h-screen px-6 py-10">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/worldbuilder"
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
            >
              ← World Builder
            </Link>
            <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
              Race Designer
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => save()}
              disabled={!race || isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Save Now
            </button>
            <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
            <WBNav current="races" />
          </div>
        </div>
        <p className="text-sm text-zinc-300">
          Define racial lore, attribute caps/bases, and racial bonuses. Changes save automatically.
        </p>
      </header>

      {/* Record Selector */}
      <div className="max-w-7xl mx-auto mb-6">
        <RecordSelector
          records={racesLite}
          selectedId={selectedId}
          onSelect={handleSelectRace}
          onCreate={handleCreateRace}
          onRename={handleRenameRace}
          onDelete={handleDeleteRace}
          loading={loading}
          recordType="Race"
        />
      </div>

      {/* Content */}
      <section className="max-w-7xl mx-auto rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm overflow-hidden">
        <NavigationTabs
          sections={TAB_SECTIONS}
          currentSection={tab}
          onSectionChange={(id) => setTab(id as TabKey)}
        />

        <div className="p-6">
          {/* Identity */}
          {tab === "identity" && (
            <div className="grid gap-4">
              {!race ? (
                <div className="p-4 text-zinc-400">Select or create a race to get started.</div>
              ) : (
                <>
                  <FormField
                    label="Legacy Description"
                    value={draftDef.legacy_description ?? ""}
                    onCommit={(v) => setDef("legacy_description", v)}
                    type="textarea"
                    rows={4}
                  />
                  <FormField
                    label="Physical Characteristics"
                    value={draftDef.physical_characteristics ?? ""}
                    onCommit={(v) => setDef("physical_characteristics", v)}
                    type="textarea"
                    rows={4}
                  />
                  <FormField
                    label="Physical Description"
                    value={draftDef.physical_description ?? ""}
                    onCommit={(v) => setDef("physical_description", v)}
                    type="textarea"
                    rows={4}
                  />
                  <FormField
                    label="Racial Quirk"
                    value={draftDef.racial_quirk ?? ""}
                    onCommit={(v) => setDef("racial_quirk", v)}
                    type="text"
                  />
                  <FormField
                    label="Quirk Success Effect"
                    value={draftDef.quirk_success_effect ?? ""}
                    onCommit={(v) => setDef("quirk_success_effect", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Quirk Failure Effect"
                    value={draftDef.quirk_failure_effect ?? ""}
                    onCommit={(v) => setDef("quirk_failure_effect", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Common Languages Known"
                    value={draftDef.common_languages_known ?? ""}
                    onCommit={(v) => setDef("common_languages_known", v)}
                    type="textarea"
                    rows={2}
                  />
                  <FormField
                    label="Common Archetypes"
                    value={draftDef.common_archetypes ?? ""}
                    onCommit={(v) => setDef("common_archetypes", v)}
                    type="textarea"
                    rows={2}
                  />
                  <FormField
                    label="Examples of Use in Different Genres"
                    value={draftDef.examples_by_genre ?? ""}
                    onCommit={(v) => setDef("examples_by_genre", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Cultural Mindset"
                    value={draftDef.cultural_mindset ?? ""}
                    onCommit={(v) => setDef("cultural_mindset", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Outlook On Magic"
                    value={draftDef.outlook_on_magic ?? ""}
                    onCommit={(v) => setDef("outlook_on_magic", v)}
                    type="textarea"
                    rows={3}
                  />
                </>
              )}
            </div>
          )}

          {/* Attributes */}
          {tab === "attributes" && (
            <div className="grid gap-6">
              {!race ? (
                <div className="p-4 text-zinc-400">Select or create a race to get started.</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Age Range"
                      value={draftAttr.age_range ?? ""}
                      onCommit={(v) => setAttrText("age_range", v)}
                      type="text"
                      placeholder="e.g., 15–90"
                    />
                    <FormField
                      label="Size"
                      value={draftAttr.size ?? ""}
                      onCommit={(v) => setAttrText("size", v)}
                      type="select"
                      options={[
                        { value: "", label: "(choose)" },
                        ...SIZE_OPTIONS.map((s) => ({ value: s, label: s })),
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      label="STR Max"
                      value={String(draftAttr.strength_max ?? "")}
                      onCommit={(v) => setAttrNum("strength_max", v)}
                      type="number"
                    />
                    <FormField
                      label="DEX Max"
                      value={String(draftAttr.dexterity_max ?? "")}
                      onCommit={(v) => setAttrNum("dexterity_max", v)}
                      type="number"
                    />
                    <FormField
                      label="CON Max"
                      value={String(draftAttr.constitution_max ?? "")}
                      onCommit={(v) => setAttrNum("constitution_max", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      label="INT Max"
                      value={String(draftAttr.intelligence_max ?? "")}
                      onCommit={(v) => setAttrNum("intelligence_max", v)}
                      type="number"
                    />
                    <FormField
                      label="WIS Max"
                      value={String(draftAttr.wisdom_max ?? "")}
                      onCommit={(v) => setAttrNum("wisdom_max", v)}
                      type="number"
                    />
                    <FormField
                      label="CHA Max"
                      value={String(draftAttr.charisma_max ?? "")}
                      onCommit={(v) => setAttrNum("charisma_max", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Base Magic"
                      value={String(draftAttr.base_magic ?? "")}
                      onCommit={(v) => setAttrNum("base_magic", v)}
                      type="number"
                    />
                    <FormField
                      label="Base Movement"
                      value={String(draftAttr.base_movement ?? "")}
                      onCommit={(v) => setAttrNum("base_movement", v)}
                      type="number"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bonuses */}
          {tab === "bonuses" && (
            <div className="grid gap-6">
              {!race ? (
                <div className="p-4 text-zinc-400">Select or create a race to get started.</div>
              ) : (
                <>
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-zinc-200">Bonus Skills (Tier 1 only)</h3>
                    <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                      <div className="grid gap-2">
                        {draftBonus.map((row) => (
                          <div key={row.slot_idx} className="flex items-center gap-3">
                            <select
                              className="flex-1 rounded-md bg-neutral-900/50 border border-white/15 px-3 py-2 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-400/40"
                              value={row.skill_name ?? "(none)"}
                              onChange={(e) => setBonusName(row, e.target.value)}
                            >
                              <option>(none)</option>
                              {skillCandidates.map((o) => (
                                <option key={o.id}>{o.name}</option>
                              ))}
                            </select>
                            <span className="text-sm text-zinc-400">pts</span>
                            <input
                              type="number"
                              min={0}
                              className="w-20 rounded-md bg-neutral-900/50 border border-white/15 px-2 py-2 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-400/40"
                              value={row.points}
                              onChange={(e) => setBonusPoints(row, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-zinc-200">Racial Special Abilities</h3>
                    <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                      <div className="grid gap-2">
                        {draftSpecial.map((row) => (
                          <div key={row.slot_idx} className="flex items-center gap-3">
                            <select
                              className="flex-1 rounded-md bg-neutral-900/50 border border-white/15 px-3 py-2 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-400/40"
                              value={row.skill_name ?? "(none)"}
                              onChange={(e) => setSpecialName(row, e.target.value)}
                            >
                              <option>(none)</option>
                              {specialCandidates.map((o) => (
                                <option key={o.id}>{o.name}</option>
                              ))}
                            </select>
                            <span className="text-sm text-zinc-400">pts</span>
                            <input
                              type="number"
                              min={0}
                              className="w-20 rounded-md bg-neutral-900/50 border border-white/15 px-2 py-2 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-400/40"
                              value={row.points}
                              onChange={(e) => setSpecialPoints(row, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {/* Preview */}
          {tab === "preview" && (
            <div>
              <textarea
                readOnly
                value={previewText}
                className="w-full h-[600px] rounded-lg border border-white/15 bg-neutral-950/50 px-4 py-3 text-sm text-zinc-200 font-mono"
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
