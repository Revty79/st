"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NavigationTabs from "@/components/shared/NavigationTabs";
import SaveIndicator from "@/components/shared/SaveIndicator";
import RecordSelector from "@/components/shared/RecordSelector";
import FormField from "@/components/shared/FormField";
import { useAutoSave } from "@/hooks/useAutoSave";
import { apiClient } from "@/lib/api-client";

/* ---------- local nav ---------- */
function WBNav({
  current = "inventory",
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
type TabKey = "items" | "weapons" | "armor" | "preview";

export type ItemRow = {
  id: number;
  name: string;
  timeline_tag?: string | null;
  cost_credits?: number | null;
  category?: string | null;
  subtype?: string | null;
  genre_tags?: string | null;
  mechanical_effect?: string | null;
  weight?: number | null;
  narrative_notes?: string | null;
};

export type WeaponRow = {
  id: number;
  name: string;
  timeline_tag?: string | null;
  cost_credits?: number | null;
  category?: string | null;
  handedness?: string | null;
  dtype?: string | null;
  range_type?: string | null;
  range_text?: string | null;
  genre_tags?: string | null;
  weight?: number | null;
  damage?: number | null;
  effect?: string | null;
  narrative_notes?: string | null;
};

export type ArmorRow = {
  id: number;
  name: string;
  timeline_tag?: string | null;
  cost_credits?: number | null;
  area_covered?: string | null;
  soak?: number | null;
  category?: string | null;
  atype?: string | null;
  genre_tags?: string | null;
  weight?: number | null;
  encumbrance_penalty?: number | null;
  effect?: string | null;
  narrative_notes?: string | null;
};

type AnyRow = ItemRow | WeaponRow | ArmorRow;
type RecordLite = { id: number; name: string };

/* ---------- Constants ---------- */
const TAB_SECTIONS = [
  { id: "items", label: "Items" },
  { id: "weapons", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "preview", label: "Preview" },
];

const API_ENDPOINTS = {
  items: "/api/items",
  weapons: "/api/weapons",
  armor: "/api/armors",
};

/* ---------- Helpers ---------- */
function nz(v: string | null | undefined): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

function nn(v: number | null | undefined): number | null {
  return v == null || Number.isNaN(Number(v)) ? null : Number(v);
}

const nv = (x: unknown) => (x === null || x === undefined || x === "" ? "—" : String(x));

/* ---------- Page ---------- */
export default function InventoryPage() {
  // Tab state
  const [tab, setTab] = useState<TabKey>("items");
  const [recordType, setRecordType] = useState<"items" | "weapons" | "armor">("items");

  // Lists
  const [items, setItems] = useState<ItemRow[]>([]);
  const [weapons, setWeapons] = useState<WeaponRow[]>([]);
  const [armor, setArmor] = useState<ArmorRow[]>([]);

  // Selection
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [record, setRecord] = useState<AnyRow | null>(null);

  // Draft state
  const [draft, setDraft] = useState<Partial<AnyRow>>({});

  // UI
  const [loading, setLoading] = useState(false);

  // Auto-save
  const { save, isSaving, lastSaved } = useAutoSave({
    onSave: async () => {
      if (!record || tab === "preview") return;
      await saveRecord(record.id);
    },
  });

  // Current records based on tab
  const currentRecords = useMemo(() => {
    if (tab === "items") return items.map((i) => ({ id: i.id, name: i.name }));
    if (tab === "weapons") return weapons.map((w) => ({ id: w.id, name: w.name }));
    if (tab === "armor") return armor.map((a) => ({ id: a.id, name: a.name }));
    return [];
  }, [tab, items, weapons, armor]);

  // --- load initial ---
  useEffect(() => {
    loadAllTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tab changes
  useEffect(() => {
    if (tab === "preview") return;
    const records = currentRecords;
    if (records.length === 0) {
      setSelectedId(null);
      setRecord(null);
      setDraft({});
    } else if (!selectedId || !records.find((r) => r.id === selectedId)) {
      const firstId = records[0]?.id;
      if (firstId) {
        setSelectedId(firstId);
        loadRecord(tab, firstId);
      }
    } else {
      loadRecord(tab, selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function loadAllTabs() {
    setLoading(true);
    try {
      const [itemsRes, weaponsRes, armorRes] = await Promise.all([
        apiClient<{ ok: true; rows: ItemRow[] }>(API_ENDPOINTS.items),
        apiClient<{ ok: true; rows: WeaponRow[] }>(API_ENDPOINTS.weapons),
        apiClient<{ ok: true; rows: ArmorRow[] }>(API_ENDPOINTS.armor),
      ]);
      setItems(itemsRes.rows || []);
      setWeapons(weaponsRes.rows || []);
      setArmor(armorRes.rows || []);

      // Select first item in current tab
      if (tab === "items" && (itemsRes.rows || []).length > 0) {
        await loadRecord("items", (itemsRes.rows || [])[0].id);
      } else if (tab === "weapons" && (weaponsRes.rows || []).length > 0) {
        await loadRecord("weapons", (weaponsRes.rows || [])[0].id);
      } else if (tab === "armor" && (armorRes.rows || []).length > 0) {
        await loadRecord("armor", (armorRes.rows || [])[0].id);
      }
    } catch (e: any) {
      alert(`Load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecord(type: "items" | "weapons" | "armor", id: number) {
    const res = await apiClient<{ ok: true; rows: AnyRow[] }>(API_ENDPOINTS[type]);
    const rec = (res.rows || []).find((r) => r.id === id);
    if (rec) {
      setRecord(rec);
      setSelectedId(id);
      setDraft(rec);
      setRecordType(type);
    }
  }

  async function refreshTab() {
    if (tab === "preview") return;
    const res = await apiClient<{ ok: true; rows: AnyRow[] }>(API_ENDPOINTS[tab]);
    if (tab === "items") setItems((res.rows || []) as ItemRow[]);
    else if (tab === "weapons") setWeapons((res.rows || []) as WeaponRow[]);
    else setArmor((res.rows || []) as ArmorRow[]);
  }

  // --- CRUD ---
  async function handleSelectRecord(id: number | null) {
    if (id === null || tab === "preview") return;
    setLoading(true);
    try {
      await loadRecord(tab, id);
    } catch (e: any) {
      alert(`Failed to load record: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRecord(name: string) {
    if (tab === "preview") return;
    setLoading(true);
    try {
      await apiClient(API_ENDPOINTS[tab], { method: "POST", body: JSON.stringify({ name }) });
      await refreshTab();
      const records = currentRecords;
      if (records.length > 0) {
        await loadRecord(tab, records[0].id);
      }
    } catch (e: any) {
      alert(`Create failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRenameRecord(id: number, newName: string) {
    if (tab === "preview") return;
    setLoading(true);
    try {
      await apiClient(API_ENDPOINTS[tab], { method: "PATCH", body: JSON.stringify({ id, name: newName }) });
      await refreshTab();
      await loadRecord(tab, id);
    } catch (e: any) {
      alert(`Rename failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRecord(id: number) {
    if (!confirm(`Delete this ${tab.slice(0, -1)}?`) || tab === "preview") return;
    setLoading(true);
    try {
      await apiClient(`${API_ENDPOINTS[tab]}?id=${id}`, { method: "DELETE" });
      await refreshTab();
      const records = currentRecords;
      if (records.length > 0) {
        await loadRecord(tab, records[0].id);
      } else {
        setSelectedId(null);
        setRecord(null);
        setDraft({});
      }
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Save ---------- */
  async function saveRecord(id: number) {
    if (tab === "preview") return;
    await apiClient(API_ENDPOINTS[tab], {
      method: "PATCH",
      body: JSON.stringify({ id, ...draft }),
    });
  }

  /* ---------- Draft setters with auto-save ---------- */
  const setField = (key: string, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    save();
  };

  /* ---------- Preview ---------- */
  const previewText = useMemo(() => {
    if (!record) return "";
    if (recordType === "items") {
      const i = draft as ItemRow;
      return [
        `Item: ${record.name}`,
        `Timeline: ${nv(i.timeline_tag)}  Cost: ${nv(i.cost_credits)}`,
        `Category/Subtype: ${nv(i.category)} / ${nv(i.subtype)}`,
        `Tags: ${nv(i.genre_tags)}`,
        `Effect: ${nv(i.mechanical_effect)}`,
        `Weight: ${nv(i.weight)}`,
        `Notes: ${nv(i.narrative_notes)}`,
      ].join("\n");
    } else if (recordType === "weapons") {
      const w = draft as WeaponRow;
      return [
        `Weapon: ${record.name}`,
        `Timeline: ${nv(w.timeline_tag)}  Cost: ${nv(w.cost_credits)}`,
        `Category: ${nv(w.category)}  Handedness: ${nv(w.handedness)}`,
        `Damage Type: ${nv(w.dtype)}  Damage: ${nv(w.damage)}`,
        `Range Type: ${nv(w.range_type)}  Range: ${nv(w.range_text)}`,
        `Tags: ${nv(w.genre_tags)}`,
        `Weight: ${nv(w.weight)}`,
        `Effect: ${nv(w.effect)}`,
        `Notes: ${nv(w.narrative_notes)}`,
      ].join("\n");
    } else if (recordType === "armor") {
      const a = draft as ArmorRow;
      return [
        `Armor: ${record.name}`,
        `Timeline: ${nv(a.timeline_tag)}  Cost: ${nv(a.cost_credits)}`,
        `Area Covered: ${nv(a.area_covered)}  Soak: ${nv(a.soak)}`,
        `Category: ${nv(a.category)}  Type: ${nv(a.atype)}`,
        `Tags: ${nv(a.genre_tags)}`,
        `Weight: ${nv(a.weight)}  Encumbrance: ${nv(a.encumbrance_penalty)}`,
        `Effect: ${nv(a.effect)}`,
        `Notes: ${nv(a.narrative_notes)}`,
      ].join("\n");
    }
    return "";
  }, [record, draft, recordType]);

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
              Inventory Designer
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => save()}
              disabled={!record || tab === "preview" || isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Save Now
            </button>
            <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
            <WBNav current="inventory" />
          </div>
        </div>
        <p className="text-sm text-zinc-300">
          Create items, weapons, and armor for your world. Changes save automatically.
        </p>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm overflow-hidden">
        <NavigationTabs
          sections={TAB_SECTIONS}
          currentSection={tab}
          onSectionChange={(id) => setTab(id as TabKey)}
        />

        <div className="p-6">
          {/* Record Selector (not on preview tab) */}
          {tab !== "preview" && (
            <div className="mb-6">
              <RecordSelector
                records={currentRecords}
                selectedId={selectedId}
                onSelect={handleSelectRecord}
                onCreate={handleCreateRecord}
                onRename={handleRenameRecord}
                onDelete={handleDeleteRecord}
                loading={loading}
                recordType={tab === "items" ? "Item" : tab === "weapons" ? "Weapon" : "Armor"}
              />
            </div>
          )}

          {/* Items Tab */}
          {tab === "items" && (
            <div className="grid gap-4">
              {!record ? (
                <div className="p-4 text-zinc-400">Select or create an item to get started.</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Timeline Tag"
                      value={(draft as ItemRow).timeline_tag ?? ""}
                      onCommit={(v) => setField("timeline_tag", v)}
                      type="text"
                    />
                    <FormField
                      label="Cost (Credits)"
                      value={String((draft as ItemRow).cost_credits ?? "")}
                      onCommit={(v) => setField("cost_credits", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Category"
                      value={(draft as ItemRow).category ?? ""}
                      onCommit={(v) => setField("category", v)}
                      type="text"
                    />
                    <FormField
                      label="Subtype"
                      value={(draft as ItemRow).subtype ?? ""}
                      onCommit={(v) => setField("subtype", v)}
                      type="text"
                    />
                  </div>
                  <FormField
                    label="Genre Tags"
                    value={(draft as ItemRow).genre_tags ?? ""}
                    onCommit={(v) => setField("genre_tags", v)}
                    type="text"
                  />
                  <FormField
                    label="Mechanical Effect"
                    value={(draft as ItemRow).mechanical_effect ?? ""}
                    onCommit={(v) => setField("mechanical_effect", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Weight"
                    value={String((draft as ItemRow).weight ?? "")}
                    onCommit={(v) => setField("weight", v)}
                    type="number"
                  />
                  <FormField
                    label="Narrative Notes"
                    value={(draft as ItemRow).narrative_notes ?? ""}
                    onCommit={(v) => setField("narrative_notes", v)}
                    type="textarea"
                    rows={4}
                  />
                </>
              )}
            </div>
          )}

          {/* Weapons Tab */}
          {tab === "weapons" && (
            <div className="grid gap-4">
              {!record ? (
                <div className="p-4 text-zinc-400">Select or create a weapon to get started.</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Timeline Tag"
                      value={(draft as WeaponRow).timeline_tag ?? ""}
                      onCommit={(v) => setField("timeline_tag", v)}
                      type="text"
                    />
                    <FormField
                      label="Cost (Credits)"
                      value={String((draft as WeaponRow).cost_credits ?? "")}
                      onCommit={(v) => setField("cost_credits", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Category"
                      value={(draft as WeaponRow).category ?? ""}
                      onCommit={(v) => setField("category", v)}
                      type="text"
                    />
                    <FormField
                      label="Handedness"
                      value={(draft as WeaponRow).handedness ?? ""}
                      onCommit={(v) => setField("handedness", v)}
                      type="text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Damage Type"
                      value={(draft as WeaponRow).dtype ?? ""}
                      onCommit={(v) => setField("dtype", v)}
                      type="text"
                    />
                    <FormField
                      label="Damage"
                      value={String((draft as WeaponRow).damage ?? "")}
                      onCommit={(v) => setField("damage", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Range Type"
                      value={(draft as WeaponRow).range_type ?? ""}
                      onCommit={(v) => setField("range_type", v)}
                      type="text"
                    />
                    <FormField
                      label="Range"
                      value={(draft as WeaponRow).range_text ?? ""}
                      onCommit={(v) => setField("range_text", v)}
                      type="text"
                    />
                  </div>
                  <FormField
                    label="Genre Tags"
                    value={(draft as WeaponRow).genre_tags ?? ""}
                    onCommit={(v) => setField("genre_tags", v)}
                    type="text"
                  />
                  <FormField
                    label="Weight"
                    value={String((draft as WeaponRow).weight ?? "")}
                    onCommit={(v) => setField("weight", v)}
                    type="number"
                  />
                  <FormField
                    label="Effect"
                    value={(draft as WeaponRow).effect ?? ""}
                    onCommit={(v) => setField("effect", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Narrative Notes"
                    value={(draft as WeaponRow).narrative_notes ?? ""}
                    onCommit={(v) => setField("narrative_notes", v)}
                    type="textarea"
                    rows={4}
                  />
                </>
              )}
            </div>
          )}

          {/* Armor Tab */}
          {tab === "armor" && (
            <div className="grid gap-4">
              {!record ? (
                <div className="p-4 text-zinc-400">Select or create armor to get started.</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Timeline Tag"
                      value={(draft as ArmorRow).timeline_tag ?? ""}
                      onCommit={(v) => setField("timeline_tag", v)}
                      type="text"
                    />
                    <FormField
                      label="Cost (Credits)"
                      value={String((draft as ArmorRow).cost_credits ?? "")}
                      onCommit={(v) => setField("cost_credits", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Area Covered"
                      value={(draft as ArmorRow).area_covered ?? ""}
                      onCommit={(v) => setField("area_covered", v)}
                      type="text"
                    />
                    <FormField
                      label="Soak"
                      value={String((draft as ArmorRow).soak ?? "")}
                      onCommit={(v) => setField("soak", v)}
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Category"
                      value={(draft as ArmorRow).category ?? ""}
                      onCommit={(v) => setField("category", v)}
                      type="text"
                    />
                    <FormField
                      label="Armor Type"
                      value={(draft as ArmorRow).atype ?? ""}
                      onCommit={(v) => setField("atype", v)}
                      type="text"
                    />
                  </div>
                  <FormField
                    label="Genre Tags"
                    value={(draft as ArmorRow).genre_tags ?? ""}
                    onCommit={(v) => setField("genre_tags", v)}
                    type="text"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Weight"
                      value={String((draft as ArmorRow).weight ?? "")}
                      onCommit={(v) => setField("weight", v)}
                      type="number"
                    />
                    <FormField
                      label="Encumbrance Penalty"
                      value={String((draft as ArmorRow).encumbrance_penalty ?? "")}
                      onCommit={(v) => setField("encumbrance_penalty", v)}
                      type="number"
                    />
                  </div>
                  <FormField
                    label="Effect"
                    value={(draft as ArmorRow).effect ?? ""}
                    onCommit={(v) => setField("effect", v)}
                    type="textarea"
                    rows={3}
                  />
                  <FormField
                    label="Narrative Notes"
                    value={(draft as ArmorRow).narrative_notes ?? ""}
                    onCommit={(v) => setField("narrative_notes", v)}
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
