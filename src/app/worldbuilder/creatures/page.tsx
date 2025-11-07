// src/app/worldbuilder/creatures/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ---------- Types ----------
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

const EMPTY: Creature = { id: 0, name: "" };

// ---------- Small UI ----------
const Field = React.memo(({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block text-sm">
    <span className="text-neutral-400">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
));

const TabButton = ({
  k,
  current,
  setTab,
  label,
}: {
  k: TabKey;
  current: TabKey;
  setTab: (t: TabKey) => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={() => setTab(k)}
    disabled={current === k}
    className={`rounded-xl border px-3 py-1.5 text-sm ${
      current === k
        ? "bg-amber-500/10 border-amber-500 text-amber-300"
        : "border-neutral-800 hover:bg-neutral-950/40"
    }`}
  >
    {label}
  </button>
);

// ---------- Page ----------
export default function CreaturesPage() {
  const [items, setItems] = useState<Creature[]>([]);
  const [activeId, setActiveId] = useState<number>(0);
  const [active, setActive] = useState<Creature>(EMPTY);

  const [tab, setTab] = useState<TabKey>("identity");
  const [filter, setFilter] = useState("");
  const [newName, setNewName] = useState("");
  const [rename, setRename] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "info" | "err"; text: string } | null>(null);

  // Real form ref (Skills pattern)
  const formRef = useRef<HTMLFormElement | null>(null);

  // ---------- Data I/O ----------
  const loadList = useCallback(
    async (preserveSelection = true) => {
      try {
        setMsg(null);
        const res = await fetch("/api/creatures", { cache: "no-store" });
        if (!res.ok) throw new Error(`GET /api/creatures ${res.status}`);
        const rows = (await res.json()) as Creature[];
        rows.sort((a, b) => a.name.localeCompare(b.name));
        setItems(rows);

        if (rows.length === 0) {
          setActiveId(0);
          setActive(EMPTY);
          return;
        }

        if (!preserveSelection || !activeId) {
          setActiveId(rows[0].id);
          setActive(rows[0]);
          return;
        }

        const hit = rows.find((r) => r.id === activeId);
        if (hit) setActive(hit);
        else {
          setActiveId(rows[0].id);
          setActive(rows[0]);
        }
      } catch (e: any) {
        setMsg({ kind: "err", text: e.message || String(e) });
      }
    },
    [activeId]
  );

  useEffect(() => {
    loadList(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.name.toLowerCase().includes(q));
  }, [items, filter]);

  // ---------- List/select ----------
  function select(idStr: string) {
    const id = Number(idStr);
    setActiveId(id);
    const hit = items.find((c) => c.id === id) || EMPTY;
    setActive(hit);
    // form is keyed by activeId so defaultValues refresh without unmounting the page
  }

  // ---------- Form helpers (convert FormData → payload) ----------
  const sOrNull = (v: FormDataEntryValue | null) => {
    const s = (v ?? "").toString().trim();
    return s === "" ? null : s;
  };
  const nOrNull = (v: FormDataEntryValue | null) => {
    const s = (v ?? "").toString().trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  function buildPayloadFromFormData(fd: FormData, id: number) {
    return {
      id,
      // identity
      alt_names: sOrNull(fd.get("alt_names")),
      challenge_rating: sOrNull(fd.get("challenge_rating")),
      encounter_scale: sOrNull(fd.get("encounter_scale")),
      type: sOrNull(fd.get("type")),
      role: sOrNull(fd.get("role")),
      size: sOrNull(fd.get("size")),
      genre_tags: sOrNull(fd.get("genre_tags")),
      description_short: sOrNull(fd.get("description_short")),
      // stats
      strength: nOrNull(fd.get("strength")),
      dexterity: nOrNull(fd.get("dexterity")),
      constitution: nOrNull(fd.get("constitution")),
      intelligence: nOrNull(fd.get("intelligence")),
      wisdom: nOrNull(fd.get("wisdom")),
      charisma: nOrNull(fd.get("charisma")),
      hp_total: nOrNull(fd.get("hp_total")),
      initiative: nOrNull(fd.get("initiative")),
      hp_by_location: sOrNull(fd.get("hp_by_location")),
      armor_soak: sOrNull(fd.get("armor_soak")),
      // combat
      attack_modes: sOrNull(fd.get("attack_modes")),
      damage: sOrNull(fd.get("damage")),
      range_text: sOrNull(fd.get("range_text")),
      // behavior
      special_abilities: sOrNull(fd.get("special_abilities")),
      magic_resonance_interaction: sOrNull(fd.get("magic_resonance_interaction")),
      behavior_tactics: sOrNull(fd.get("behavior_tactics")),
      habitat: sOrNull(fd.get("habitat")),
      diet: sOrNull(fd.get("diet")),
      variants: sOrNull(fd.get("variants")),
      loot_harvest: sOrNull(fd.get("loot_harvest")),
      story_hooks: sOrNull(fd.get("story_hooks")),
      notes: sOrNull(fd.get("notes")),
    } as Partial<Creature> & { id: number };
  }

  const previewValue = () => {
    const fd = new FormData(formRef.current!);
    const nv = (x: any) => (x == null || x === "" ? "—" : x);

    return [
      `Creature: ${active.name}`,
      `Alt Names: ${nv(sOrNull(fd.get("alt_names")))}`,
      `CR / Scale / Type / Role: ${nv(sOrNull(fd.get("challenge_rating")))} / ${nv(
        sOrNull(fd.get("encounter_scale"))
      )} / ${nv(sOrNull(fd.get("type")))} / ${nv(sOrNull(fd.get("role")))}`,
      `Size: ${nv(sOrNull(fd.get("size")))}   Tags: ${nv(sOrNull(fd.get("genre_tags")))}`,
      "",
      "— Description —",
      nv(sOrNull(fd.get("description_short"))),
      "",
      "— Stats —",
      `STR ${nv(sOrNull(fd.get("strength")))}  DEX ${nv(sOrNull(fd.get("dexterity")))}  CON ${nv(
        sOrNull(fd.get("constitution"))
      )}  INT ${nv(sOrNull(fd.get("intelligence")))}  WIS ${nv(sOrNull(fd.get("wisdom")))}  CHA ${nv(
        sOrNull(fd.get("charisma"))
      )}`,
      `HP ${nv(sOrNull(fd.get("hp_total")))}   Initiative ${nv(sOrNull(fd.get("initiative")))}`,
      `HP by Location: ${nv(sOrNull(fd.get("hp_by_location")))}`,
      `Armor/Soak: ${nv(sOrNull(fd.get("armor_soak")))}`,
      "",
      "— Combat —",
      `Attack Modes: ${nv(sOrNull(fd.get("attack_modes")))}`,
      `Damage: ${nv(sOrNull(fd.get("damage")))}`,
      `Range: ${nv(sOrNull(fd.get("range_text")))}`,
      `Special Abilities: ${nv(sOrNull(fd.get("special_abilities")))}`,
      `Magic/Resonance Interaction: ${nv(sOrNull(fd.get("magic_resonance_interaction")))}`,
      "",
      "— Behavior & Lore —",
      `Behavior & Tactics: ${nv(sOrNull(fd.get("behavior_tactics")))}`,
      `Habitat: ${nv(sOrNull(fd.get("habitat")))}`,
      `Diet: ${nv(sOrNull(fd.get("diet")))}`,
      `Variants: ${nv(sOrNull(fd.get("variants")))}`,
      `Loot/Harvest: ${nv(sOrNull(fd.get("loot_harvest")))}`,
      `Story Hooks: ${nv(sOrNull(fd.get("story_hooks")))}`,
      `Notes: ${nv(sOrNull(fd.get("notes")))}`,
    ].join("\n");
  };

  // ---------- Mutations ----------
  async function create() {
    if (!newName.trim()) return;
    try {
      setBusy(true);
      const res = await fetch("/api/creatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `POST /api/creatures ${res.status}`);
      }
      const created = (await res.json()) as Creature;
      setNewName("");
      await loadList(false);
      setActiveId(created.id);
      setActive(created);
      setMsg({ kind: "info", text: "Creature created." });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function applyRename() {
    if (!activeId || !rename.trim()) return;
    try {
      setBusy(true);
      const res = await fetch("/api/creatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeId, name: rename.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `POST /api/creatures rename ${res.status}`);
      }
      const updated = (await res.json()) as Creature;
      setRename("");
      await loadList(false);
      setActiveId(updated.id);
      setActive((prev) => ({ ...prev, name: updated.name }));
      setMsg({ kind: "info", text: "Renamed." });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!activeId) return;
    try {
      setBusy(true);
      const fd = new FormData(formRef.current!);
      const payload = buildPayloadFromFormData(fd, activeId);
      const res = await fetch("/api/creatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `POST /api/creatures save ${res.status}`);
      }
      const updated = (await res.json()) as Creature;
      await loadList(false);
      setActiveId(updated.id);
      setActive(updated);
      setMsg({ kind: "info", text: "Saved." });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!activeId) return;
    const current = items.find((i) => i.id === activeId);
    if (!current) return;
    if (!confirm(`Delete ${current.name}?`)) return;
    try {
      setBusy(true);
      const res = await fetch(`/api/creatures?id=${activeId}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `DELETE /api/creatures ${res.status}`);
      }
      await loadList(false);
      setMsg({ kind: "info", text: "Deleted." });
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  // ---------- Render ----------
  return (
    <main className="min-h-screen px-6 py-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 flex items-center gap-3">
        <Link
          href="/worldbuilder"
          className="inline-flex items-center rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-950/40 border-neutral-800"
        >
          ← World Builder
        </Link>
        <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">Creatures</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={busy || !activeId}
            className="rounded-xl border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/20"
          >
            Save
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={!activeId}
            className="rounded-xl border border-red-700/40 bg-red-600/10 px-3 py-2 text-sm text-red-300 hover:bg-red-600/20"
          >
            Delete
          </button>
        </div>
      </header>

      {/* Controls */}
      <section className="max-w-7xl mx-auto mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-neutral-400">Creature:</label>
        <select
          value={activeId ? String(activeId) : ""}
          onChange={(e) => select(e.target.value)}
          className="min-w-64 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
        >
          {filtered.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search…"
          className="w-52 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
        />

        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New creature name…"
          className="w-56 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
        />
        <button
          type="button"
          onClick={create}
          disabled={busy}
          className="rounded-xl border border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-900"
        >
          Add
        </button>

        <input
          value={rename}
          onChange={(e) => setRename(e.target.value)}
          placeholder={active?.name ? `Rename “${active.name}”…` : "Rename…"}
          className="w-56 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
        />
        <button
          type="button"
          onClick={applyRename}
          disabled={busy || !activeId}
          className="rounded-xl border border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-900"
        >
          Apply
        </button>
      </section>

      {/* Editor — form is keyed to activeId so defaultValues refresh cleanly */}
      <section className="max-w-7xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-950/30 p-4">
        <form ref={formRef} key={activeId || "editor"}>
          <div className="mb-4 flex flex-wrap gap-2">
            <TabButton k="identity" current={tab} setTab={setTab} label="Identity" />
            <TabButton k="stats" current={tab} setTab={setTab} label="Stats" />
            <TabButton k="combat" current={tab} setTab={setTab} label="Combat" />
            <TabButton k="behavior" current={tab} setTab={setTab} label="Behavior/Lore" />
            <TabButton k="preview" current={tab} setTab={setTab} label="Preview" />
          </div>

          <div className="border border-neutral-800 rounded-2xl p-4 bg-neutral-950/30">
            {/* Identity */}
            <div className={tab === "identity" ? "block" : "hidden"}>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Alt Names">
                    <input name="alt_names" defaultValue={active.alt_names ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
                  </Field>
                  <Field label="Challenge Rating">
                    <input name="challenge_rating" defaultValue={active.challenge_rating ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
                  </Field>
                  <Field label="Encounter Scale">
                    <input name="encounter_scale" defaultValue={active.encounter_scale ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Type"><input name="type" defaultValue={active.type ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="Role"><input name="role" defaultValue={active.role ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="Size"><input name="size" defaultValue={active.size ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                </div>
                <Field label="Genre Tags (comma-separated)">
                  <textarea name="genre_tags" defaultValue={active.genre_tags ?? ""} rows={2} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
                </Field>
                <Field label="Description (Short)">
                  <textarea name="description_short" defaultValue={active.description_short ?? ""} rows={4} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" />
                </Field>
              </div>
            </div>

            {/* Stats */}
            <div className={tab === "stats" ? "block" : "hidden"}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  <Field label="STR"><input type="number" name="strength" defaultValue={active.strength ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="DEX"><input type="number" name="dexterity" defaultValue={active.dexterity ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="CON"><input type="number" name="constitution" defaultValue={active.constitution ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="INT"><input type="number" name="intelligence" defaultValue={active.intelligence ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="WIS"><input type="number" name="wisdom" defaultValue={active.wisdom ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="CHA"><input type="number" name="charisma" defaultValue={active.charisma ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="HP (Total)"><input type="number" name="hp_total" defaultValue={active.hp_total ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                  <Field label="Initiative"><input type="number" name="initiative" defaultValue={active.initiative ?? ""} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                </div>
                <Field label="HP by Location"><textarea name="hp_by_location" defaultValue={active.hp_by_location ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Armor/Soak"><textarea name="armor_soak" defaultValue={active.armor_soak ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
              </div>
            </div>

            {/* Combat */}
            <div className={tab === "combat" ? "block" : "hidden"}>
              <div className="grid gap-4">
                <Field label="Attack Modes"><textarea name="attack_modes" defaultValue={active.attack_modes ?? ""} rows={4} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Damage"><textarea name="damage" defaultValue={active.damage ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Range"><textarea name="range_text" defaultValue={active.range_text ?? ""} rows={2} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Special Abilities"><textarea name="special_abilities" defaultValue={active.special_abilities ?? ""} rows={4} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Magic/Resonance Interaction"><textarea name="magic_resonance_interaction" defaultValue={active.magic_resonance_interaction ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
              </div>
            </div>

            {/* Behavior */}
            <div className={tab === "behavior" ? "block" : "hidden"}>
              <div className="grid gap-4">
                <Field label="Behavior & Tactics"><textarea name="behavior_tactics" defaultValue={active.behavior_tactics ?? ""} rows={4} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Habitat"><textarea name="habitat" defaultValue={active.habitat ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Diet"><textarea name="diet" defaultValue={active.diet ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Variants"><textarea name="variants" defaultValue={active.variants ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Loot/Harvest"><textarea name="loot_harvest" defaultValue={active.loot_harvest ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Story Hooks"><textarea name="story_hooks" defaultValue={active.story_hooks ?? ""} rows={4} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
                <Field label="Notes"><textarea name="notes" defaultValue={active.notes ?? ""} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2" /></Field>
              </div>
            </div>

            {/* Preview */}
            <div className={tab === "preview" ? "block" : "hidden"}>
              <textarea
                readOnly
                value={formRef.current ? previewValue() : ""}
                className="w-full h-[520px] rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </form>

        <div className="mt-3 min-h-6 text-sm">
          {msg?.kind === "err" && <span className="text-red-400">{msg.text}</span>}
          {msg?.kind === "info" && <span className="text-emerald-400">{msg.text}</span>}
        </div>
      </section>
    </main>
  );
}
