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
  current = "creatures",
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
type TabKey = "identity" | "stats" | "combat" | "behavior" | "preview";

type Creature = {
  id: number;
  name: string;
  alt_names?: string | null;
  challenge_rating?: string | null;
  encounter_scale?: string | null;
  type?: string | null;
  role?: string | null;
  size?: string | null;
  genre_tags?: string | null;
  description_short?: string | null;
  strength?: number | null;
  dexterity?: number | null;
  constitution?: number | null;
  intelligence?: number | null;
  wisdom?: number | null;
  charisma?: number | null;
  hp_total?: number | null;
  initiative?: number | null;
  hp_by_location?: string | null;
  armor_soak?: string | null;
  attack_modes?: string | null;
  damage?: string | null;
  range_text?: string | null;
  special_abilities?: string | null;
  magic_resonance_interaction?: string | null;
  behavior_tactics?: string | null;
  habitat?: string | null;
  diet?: string | null;
  variants?: string | null;
  loot_harvest?: string | null;
  story_hooks?: string | null;
  notes?: string | null;
};

type CreatureLite = { id: number; name: string };

/* ---------- Constants ---------- */
const TAB_SECTIONS = [
  { id: "identity", label: "Identity" },
  { id: "stats", label: "Stats" },
  { id: "combat", label: "Combat" },
  { id: "behavior", label: "Behavior & Lore" },
  { id: "preview", label: "Preview" },
];

/* ---------- Helpers ---------- */
function nz(v: string | null | undefined): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

function nn(v: number | null | undefined): number | null {
  return v == null || Number.isNaN(Number(v)) ? null : Number(v);
}

/* ---------- Page ---------- */
export default function CreaturesPage() {
  // Lists/selection
  const [creatures, setCreatures] = useState<CreatureLite[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creature, setCreature] = useState<Creature | null>(null);

  // Draft state
  const [draft, setDraft] = useState<Partial<Creature>>({});

  // UI
  const [tab, setTab] = useState<TabKey>("identity");
  const [loading, setLoading] = useState(false);

  // Auto-save
  const { save, isSaving, lastSaved } = useAutoSave({
    onSave: async () => {
      if (!creature) return;
      await saveCreature(creature.id);
    },
  });

  // --- load initial ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient<{ ok: true; data: Creature[] }>("/api/creatures");
        const lite = (res.data || []).map((c) => ({ id: c.id, name: c.name }));
        setCreatures(lite);
        const chosen = selectedId ?? lite[0]?.id ?? null;
        if (chosen != null) await loadCreature(chosen);
      } catch (e: any) {
        alert(`Load failed: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCreature(id: number) {
    const res = await apiClient<{ ok: true; data: Creature[] }>("/api/creatures");
    const c = (res.data || []).find((cr) => cr.id === id);
    if (!c) return;
    setCreature(c);
    setSelectedId(id);
    setDraft(c);
  }

  async function refreshAndMaybeSelect(idToSelect?: number | null) {
    const res = await apiClient<{ ok: true; data: Creature[] }>("/api/creatures");
    const lite = (res.data || []).map((c) => ({ id: c.id, name: c.name }));
    setCreatures(lite);
    const pick = idToSelect ?? (lite.find((c) => c.id === selectedId)?.id ?? lite[0]?.id ?? null);
    if (pick != null) await loadCreature(pick);
    else {
      setCreature(null);
      setSelectedId(null);
      setDraft({});
    }
  }

  // --- CRUD ---
  async function handleSelectCreature(id: number | null) {
    if (id === null) return;
    setLoading(true);
    try {
      await loadCreature(id);
    } catch (e: any) {
      alert(`Failed to load creature: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCreature(name: string): Promise<void> {
    setLoading(true);
    try {
      const res = await apiClient<Creature>("/api/creatures", { method: "POST", body: JSON.stringify({ name }) });
      await refreshAndMaybeSelect(res.id);
    } catch (e: any) {
      alert(`Create failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRenameCreature(id: number, newName: string): Promise<void> {
    setLoading(true);
    try {
      await apiClient("/api/creatures", { method: "POST", body: JSON.stringify({ id, name: newName }) });
      await refreshAndMaybeSelect(id);
    } catch (e: any) {
      alert(`Rename failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCreature(id: number): Promise<void> {
    if (!confirm(`Delete this creature?`)) return;
    setLoading(true);
    try {
      await apiClient(`/api/creatures?id=${id}`, { method: "DELETE" });
      await refreshAndMaybeSelect(null);
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Save ---------- */
  async function saveCreature(id: number) {
    await apiClient("/api/creatures", {
      method: "POST",
      body: JSON.stringify({
        id,
        alt_names: nz(draft.alt_names),
        challenge_rating: nz(draft.challenge_rating),
        encounter_scale: nz(draft.encounter_scale),
        type: nz(draft.type),
        role: nz(draft.role),
        size: nz(draft.size),
        genre_tags: nz(draft.genre_tags),
        description_short: nz(draft.description_short),
        strength: nn(draft.strength),
        dexterity: nn(draft.dexterity),
        constitution: nn(draft.constitution),
        intelligence: nn(draft.intelligence),
        wisdom: nn(draft.wisdom),
        charisma: nn(draft.charisma),
        hp_total: nn(draft.hp_total),
        initiative: nn(draft.initiative),
        hp_by_location: nz(draft.hp_by_location),
        armor_soak: nz(draft.armor_soak),
        attack_modes: nz(draft.attack_modes),
        damage: nz(draft.damage),
        range_text: nz(draft.range_text),
        special_abilities: nz(draft.special_abilities),
        magic_resonance_interaction: nz(draft.magic_resonance_interaction),
        behavior_tactics: nz(draft.behavior_tactics),
        habitat: nz(draft.habitat),
        diet: nz(draft.diet),
        variants: nz(draft.variants),
        loot_harvest: nz(draft.loot_harvest),
        story_hooks: nz(draft.story_hooks),
        notes: nz(draft.notes),
      }),
    });
  }

  /* ---------- Draft setters with auto-save ---------- */
  const setField = (key: keyof Creature, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    save();
  };

  /* ---------- Preview ---------- */
  const previewText = useMemo(() => {
    if (!creature) return "";
    const nv = (x: any) => (x == null || x === "" ? "—" : x);

    return [
      `Creature: ${creature.name}`,
      `Alt Names: ${nv(draft.alt_names)}`,
      `CR / Scale / Type / Role: ${nv(draft.challenge_rating)} / ${nv(draft.encounter_scale)} / ${nv(draft.type)} / ${nv(draft.role)}`,
      `Size: ${nv(draft.size)}   Tags: ${nv(draft.genre_tags)}`,
      "",
      "— Description —",
      nv(draft.description_short),
      "",
      "— Stats —",
      `STR ${nv(draft.strength)}  DEX ${nv(draft.dexterity)}  CON ${nv(draft.constitution)}  INT ${nv(draft.intelligence)}  WIS ${nv(draft.wisdom)}  CHA ${nv(draft.charisma)}`,
      `HP ${nv(draft.hp_total)}   Initiative ${nv(draft.initiative)}`,
      `HP by Location: ${nv(draft.hp_by_location)}`,
      `Armor/Soak: ${nv(draft.armor_soak)}`,
      "",
      "— Combat —",
      `Attack Modes: ${nv(draft.attack_modes)}`,
      `Damage: ${nv(draft.damage)}`,
      `Range: ${nv(draft.range_text)}`,
      `Special Abilities: ${nv(draft.special_abilities)}`,
      `Magic/Resonance Interaction: ${nv(draft.magic_resonance_interaction)}`,
      "",
      "— Behavior & Lore —",
      `Behavior & Tactics: ${nv(draft.behavior_tactics)}`,
      `Habitat: ${nv(draft.habitat)}`,
      `Diet: ${nv(draft.diet)}`,
      `Variants: ${nv(draft.variants)}`,
      `Loot/Harvest: ${nv(draft.loot_harvest)}`,
      `Story Hooks: ${nv(draft.story_hooks)}`,
      `Notes: ${nv(draft.notes)}`,
    ].join("\n");
  }, [creature, draft]);

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
              Creature Designer
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => save()}
              disabled={!creature || isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Save Now
            </button>
            <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
            <WBNav current="creatures" />
          </div>
        </div>
        <p className="text-sm text-zinc-300">
          Design monsters, NPCs, and creatures. Changes save automatically.
        </p>
      </header>

      {/* Record Selector */}
      <div className="max-w-7xl mx-auto mb-6">
        <RecordSelector
          records={creatures}
          selectedId={selectedId}
          onSelect={handleSelectCreature}
          onCreate={handleCreateCreature}
          onRename={handleRenameCreature}
          onDelete={handleDeleteCreature}
          loading={loading}
          recordType="Creature"
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
              {!creature ? (
                <div className="p-4 text-zinc-400">Select or create a creature to get started.</div>
              ) : (
                <>
                  <FormField
                    label="Alt Names"
                    value={draft.alt_names ?? ""}
                    onCommit={(v) => setField("alt_names", v)}
                    type="text"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Challenge Rating"
                      value={draft.challenge_rating ?? ""}
                      onCommit={(v) => setField("challenge_rating", v)}
                      type="text"
                    />
                    <FormField
                      label="Encounter Scale"
                      value={draft.encounter_scale ?? ""}
                      onCommit={(v) => setField("encounter_scale", v)}
                      type="text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Type"
                      value={draft.type ?? ""}
                      onCommit={(v) => setField("type", v)}
                      type="text"
                    />
                    <FormField
                      label="Role"
                      value={draft.role ?? ""}
                      onCommit={(v) => setField("role", v)}
                      type="text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Size"
                      value={draft.size ?? ""}
                      onCommit={(v) => setField("size", v)}
                      type="text"
                    />
                    <FormField
                      label="Genre Tags"
                      value={draft.genre_tags ?? ""}
                      onCommit={(v) => setField("genre_tags", v)}
                      type="text"
                    />
                  </div>
                  <FormField
                    label="Description"
                    value={draft.description_short ?? ""}
                    onCommit={(v) => setField("description_short", v)}
                    type="textarea"
                    rows={4}
                  />
                </>
              )}
            </div>
          )}

          {/* Stats */}
          {tab === "stats" && (
            <div className="grid gap-6">
              {!creature ? (
                <div className="p-4 text-zinc-400">Select or create a creature to get started.</div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      label="Strength"
                      value={String(draft.strength ?? "")}
                      onCommit={(v) => setField("strength", v)}
                      type="number"
                    />
                    <FormField
                      label="Dexterity"
                      value={String(draft.dexterity ?? "")}
                      onCommit={(v) => setField("dexterity", v)}
                      type="number"
                    />
                    <FormField
                      label="Constitution"
                      value={String(draft.constitution ?? "")}
                      onCommit={(v) => setField("constitution", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      label="Intelligence"
                      value={String(draft.intelligence ?? "")}
                      onCommit={(v) => setField("intelligence", v)}
                      type="number"
                    />
                    <FormField
                      label="Wisdom"
                      value={String(draft.wisdom ?? "")}
                      onCommit={(v) => setField("wisdom", v)}
                      type="number"
                    />
                    <FormField
                      label="Charisma"
                      value={String(draft.charisma ?? "")}
                      onCommit={(v) => setField("charisma", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="HP Total"
                      value={String(draft.hp_total ?? "")}
                      onCommit={(v) => setField("hp_total", v)}
                      type="number"
                    />
                    <FormField
                      label="Initiative"
                      value={String(draft.initiative ?? "")}
                      onCommit={(v) => setField("initiative", v)}
                      type="number"
                    />
                  </div>
                  <FormField
                    label="HP by Location"
                    value={draft.hp_by_location ?? ""}
                    onCommit={(v) => setField("hp_by_location", v)}
                    type="textarea"
                    rows={2}
                  />
                  <FormField
                    label="Armor/Soak"
                    value={draft.armor_soak ?? ""}
                    onCommit={(v) => setField("armor_soak", v)}
                    type="textarea"
                    rows={2}
                  />
                </>
              )}
            </div>
          )}

          {/* Combat */}
          {tab === "combat" && (
            <div className="grid gap-4">
              {!creature ? (
                <div className="p-4 text-zinc-400">Select or create a creature to get started.</div>
              ) : (
                <>
                  <FormField
                    label="Attack Modes"
                    value={draft.attack_modes ?? ""}
                    onCommit={(v) => setField("attack_modes", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Damage"
                    value={draft.damage ?? ""}
                    onCommit={(v) => setField("damage", v)}
                    type="textarea"
                    rows={2}
                  />
                  <FormField
                    label="Range"
                    value={draft.range_text ?? ""}
                    onCommit={(v) => setField("range_text", v)}
                    type="text"
                  />
                  <FormField
                    label="Special Abilities"
                    value={draft.special_abilities ?? ""}
                    onCommit={(v) => setField("special_abilities", v)}
                    type="textarea"
                    rows={4}
                  />
                  <FormField
                    label="Magic/Resonance Interaction"
                    value={draft.magic_resonance_interaction ?? ""}
                    onCommit={(v) => setField("magic_resonance_interaction", v)}
                    type="textarea"
                    rows={3}
                  />
                </>
              )}
            </div>
          )}

          {/* Behavior & Lore */}
          {tab === "behavior" && (
            <div className="grid gap-4">
              {!creature ? (
                <div className="p-4 text-zinc-400">Select or create a creature to get started.</div>
              ) : (
                <>
                  <FormField
                    label="Behavior & Tactics"
                    value={draft.behavior_tactics ?? ""}
                    onCommit={(v) => setField("behavior_tactics", v)}
                    type="textarea"
                    rows={4}
                  />
                  <FormField
                    label="Habitat"
                    value={draft.habitat ?? ""}
                    onCommit={(v) => setField("habitat", v)}
                    type="textarea"
                    rows={2}
                  />
                  <FormField
                    label="Diet"
                    value={draft.diet ?? ""}
                    onCommit={(v) => setField("diet", v)}
                    type="textarea"
                    rows={2}
                  />
                  <FormField
                    label="Variants"
                    value={draft.variants ?? ""}
                    onCommit={(v) => setField("variants", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Loot/Harvest"
                    value={draft.loot_harvest ?? ""}
                    onCommit={(v) => setField("loot_harvest", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Story Hooks"
                    value={draft.story_hooks ?? ""}
                    onCommit={(v) => setField("story_hooks", v)}
                    type="textarea"
                    rows={4}
                  />
                  <FormField
                    label="Notes"
                    value={draft.notes ?? ""}
                    onCommit={(v) => setField("notes", v)}
                    type="textarea"
                    rows={4}
                  />
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
