"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** ---------- types ---------- */
type TabKey = "items" | "weapons" | "armor" | "preview";

export type ItemRow = {
  id: number; // numeric (INTEGER PK)
  name: string;
  timeline_tag?: string | null;
  cost_credits?: number | null;
  category?: string | null;
  subtype?: string | null;
  genre_tags?: string | null;
  mechanical_effect?: string | null;
  weight?: number | null; // float OK
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
  weight?: number | null; // float OK
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
  weight?: number | null; // float OK
  encumbrance_penalty?: number | null;
  effect?: string | null;
  narrative_notes?: string | null;
};

type AnyRow = ItemRow | WeaponRow | ArmorRow;
type RowKey = Extract<keyof ItemRow | keyof WeaponRow | keyof ArmorRow, string>;

/** ---------- style tokens ---------- */
const ACCENT = "text-amber-300";
const BTN = "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition";
const BTN_PRIMARY =
  "rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200 hover:bg-amber-400/20 hover:border-amber-400/40 transition disabled:opacity-50";
const BTN_DANGER =
  "rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-400/20 hover:border-rose-400/40 transition disabled:opacity-50";
const FLD =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300/20";
const CARD = "rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_0_20px_rgba(0,0,0,0.25)]";
const PANEL = "rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-[0_0_40px_rgba(0,0,0,0.35)]";

/** ---------- utils ---------- */
const toIntOrNull = (v: string) => (v.trim() === "" ? null : Number.isFinite(+v) ? Math.trunc(+v) : null);
const toFloatOrNull = (v: string) => (v.trim() === "" ? null : Number.isFinite(+v) ? +v : null);
const nv = (x: unknown) => (x === null || x === undefined || x === "" ? "—" : String(x));

type ApiTab = Exclude<TabKey, "preview">;
const API_BY_TAB: Record<ApiTab, string> = {
  items: "/api/items",
  weapons: "/api/weapons",
  armor: "/api/armors",
};
const hasApi = (t: TabKey): t is ApiTab => t !== "preview";
const apiFor = (t: ApiTab) => API_BY_TAB[t];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok || !data?.ok) {
    const msg = data?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data as T;
}

/** ----- editable key lists for diffing ----- */
const KEYS = {
  items: [
    "name","timeline_tag","cost_credits","category","subtype",
    "genre_tags","mechanical_effect","weight","narrative_notes",
  ] as RowKey[],
  weapons: [
    "name","timeline_tag","cost_credits","category","handedness","dtype",
    "range_type","range_text","genre_tags","weight","damage","effect","narrative_notes",
  ] as RowKey[],
  armor: [
    "name","timeline_tag","cost_credits","area_covered","soak","category","atype",
    "genre_tags","weight","encumbrance_penalty","effect","narrative_notes",
  ] as RowKey[],
} as const;

/** ---------- page ---------- */
export default function Page() {
  const [tab, setTab] = useState<TabKey>("items");

  // db-backed state
  const [items, setItems] = useState<ItemRow[]>([]);
  const [weapons, setWeapons] = useState<WeaponRow[]>([]);
  const [armor, setArmor] = useState<ArmorRow[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [newName, setNewName] = useState("");
  const [rename, setRename] = useState("");
  const [pending, setPending] = useState(false);

  // draft buffer for explicit Save
  const rows: AnyRow[] = useMemo(
    () => (tab === "items" ? items : tab === "weapons" ? weapons : armor),
    [tab, items, weapons, armor]
  );
  const active = useMemo(() => rows.find((r) => r.id === activeId) ?? null, [rows, activeId]);

  const [draft, setDraft] = useState<AnyRow | null>(null);

  // when active row changes, reset draft from active
  useEffect(() => {
    setDraft(active ? { ...(active as AnyRow) } : null);
  }, [active?.id, tab]); // reset when switching rows or tabs

  // initial + on-tab-change load
  useEffect(() => {
    if (!hasApi(tab)) {
      setActiveId(null);
      setDraft(null);
      return;
    }
    loadRows(tab).catch((e) => alert(`Load failed: ${e.message}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function loadRows(t: TabKey) {
    if (!hasApi(t)) return;
    const data = await api<{ ok: true; rows: AnyRow[] }>(apiFor(t), { cache: "no-store" });
    if (t === "items") setItems(data.rows as ItemRow[]);
    else if (t === "weapons") setWeapons(data.rows as WeaponRow[]);
    else setArmor(data.rows as ArmorRow[]);
    setActiveId((data.rows?.[0]?.id as number | undefined) ?? null);
  }

  function ensureSelection(nextTab: TabKey) {
    const nextRows = nextTab === "items" ? items : nextTab === "weapons" ? weapons : armor;
    if (!nextRows.length) return setActiveId(null);
    if (!activeId || !nextRows.some((r) => r.id === activeId)) setActiveId(nextRows[0]?.id ?? null);
  }

  /** ---------- CRUD -> API ---------- */
  async function addRecord() {
    if (!hasApi(tab)) return;
    const name = newName.trim();
    if (!name) return;
    setPending(true);
    try {
      const data = await api<{ ok: true; row: AnyRow }>(apiFor(tab), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (tab === "items") setItems((p) => [data.row as ItemRow, ...p]);
      else if (tab === "weapons") setWeapons((p) => [data.row as WeaponRow, ...p]);
      else setArmor((p) => [data.row as ArmorRow, ...p]);
      setActiveId(data.row.id as number);
      setNewName("");
    } catch (e: any) {
      alert(`Add failed: ${e.message}`);
      await loadRows(tab);
    } finally {
      setPending(false);
    }
  }

  async function applyRename() {
    if (!hasApi(tab) || !active) return;
    const nm = rename.trim();
    if (!nm) return;
    setPending(true);
    try {
      const data = await api<{ ok: true; row: AnyRow }>(apiFor(tab), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, name: nm }),
      });
      const patch = (arr: AnyRow[]) => arr.map((r) => (r.id === active.id ? data.row : r));
      if (tab === "items") setItems((p) => patch(p) as ItemRow[]);
      else if (tab === "weapons") setWeapons((p) => patch(p) as WeaponRow[]);
      else setArmor((p) => patch(p) as ArmorRow[]);
      setRename("");
      // reflect into draft
      setDraft(data.row as AnyRow);
    } catch (e: any) {
      alert(`Rename failed: ${e.message}`);
    } finally {
      setPending(false);
    }
  }

  async function deleteRecord() {
    if (!hasApi(tab) || !active) return;
    setPending(true);
    try {
      await api<{ ok: true; deleted: number }>(`${apiFor(tab)}?id=${active.id}`, { method: "DELETE" });
      const drop = (arr: AnyRow[]) => arr.filter((r) => r.id !== active.id);
      if (tab === "items") setItems(drop);
      else if (tab === "weapons") setWeapons(drop as any);
      else setArmor(drop as any);
      const next = (tab === "items" ? items : tab === "weapons" ? weapons : armor).filter((r) => r.id !== active.id);
      setActiveId(next[0]?.id ?? null);
      setDraft(null);
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setPending(false);
    }
  }

  /** ----- Save / Revert using draft ----- */
  const editableKeys = hasApi(tab) ? (KEYS[tab] as RowKey[]) : [];

  function diffRow(orig: AnyRow | null, d: AnyRow | null) {
    const out: Record<string, any> = {};
    if (!orig || !d) return out;
    for (const k of editableKeys) {
      if ((orig as any)[k] !== (d as any)[k]) out[k] = (d as any)[k];
    }
    return out;
  }

  const dirty = useMemo(() => {
    const dif = diffRow(active, draft);
    return Object.keys(dif).length > 0;
  }, [active, draft, tab]);

  async function saveDraft() {
    if (!hasApi(tab) || !active || !draft || !dirty) return;
    setPending(true);
    try {
      const changes = diffRow(active, draft);
      const data = await api<{ ok: true; row: AnyRow }>(apiFor(tab), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, ...changes }),
      });
      // patch the list
      const patch = (arr: AnyRow[]) => arr.map((r) => (r.id === active.id ? data.row : r));
      if (tab === "items") setItems((p) => patch(p) as ItemRow[]);
      else if (tab === "weapons") setWeapons((p) => patch(p) as WeaponRow[]);
      else setArmor((p) => patch(p) as ArmorRow[]);
      // sync draft with saved row
      setDraft(data.row as AnyRow);
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setPending(false);
    }
  }

  function revertDraft() {
    setDraft(active ? { ...(active as AnyRow) } : null);
  }

  // local field change (draft only)
  function setDraftField(key: RowKey, value: any) {
    if (!draft) return;
    setDraft({ ...(draft as any), [key]: value } as AnyRow);
  }

  // preview text uses draft (what you see is what you’ll save)
  function buildPreview() {
    const row = draft;
    if (!row) return "—";
    if (tab === "items") {
      const o = row as ItemRow;
      return [
        `Item: ${o.name}`,
        `Timeline: ${nv(o.timeline_tag)}  Cost: ${nv(o.cost_credits)}`,
        `Category/Subtype: ${nv(o.category)} / ${nv(o.subtype)}`,
        `Tags: ${nv(o.genre_tags)}`,
        `Effect: ${nv(o.mechanical_effect)}`,
        `Weight: ${nv(o.weight)}`,
        `Notes: ${nv(o.narrative_notes)}`,
      ].join("\n");
    } else if (tab === "weapons") {
      const o = row as WeaponRow;
      return [
        `Weapon: ${o.name}`,
        `Timeline: ${nv(o.timeline_tag)}  Cost: ${nv(o.cost_credits)}`,
        `Category / Handedness / Type: ${nv(o.category)} / ${nv(o.handedness)} / ${nv(o.dtype)}`,
        `Range: ${nv(o.range_type)} — ${nv(o.range_text)}`,
        `Tags: ${nv(o.genre_tags)}  Weight: ${nv(o.weight)}`,
        `Damage: ${nv(o.damage)}  Effect: ${nv(o.effect)}`,
        `Notes: ${nv(o.narrative_notes)}`,
      ].join("\n");
    } else {
      const o = row as ArmorRow;
      return [
        `Armor: ${o.name}`,
        `Timeline: ${nv(o.timeline_tag)}  Cost: ${nv(o.cost_credits)}`,
        `Area Covered: ${nv(o.area_covered)}  Soak: ${nv(o.soak)}`,
        `Category / Type: ${nv(o.category)} / ${nv(o.atype)}`,
        `Tags: ${nv(o.genre_tags)}`,
        `Weight: ${nv(o.weight)}  Encumbrance: ${nv(o.encumbrance_penalty)}`,
        `Effect: ${nv(o.effect)}`,
        `Notes: ${nv(o.narrative_notes)}`,
      ].join("\n");
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      {/* breadcrumb */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center gap-3 text-sm text-zinc-400">
        <Link href="/worldbuilder" className="hover:text-white transition">Worldbuilder</Link>
        <span className="opacity-40">/</span>
        <span className="text-zinc-200">Inventories</span>
      </div>

      {/* header */}
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
          <span className="bg-[linear-gradient(90deg,#a78bfa_0%,#fbbf24_50%,#a78bfa_100%)] bg-clip-text text-transparent drop-shadow">
            Create Inventories
          </span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          General Items, Weapons, and Armor · connected to DB. <span className={ACCENT}>GM is G.O.D.</span>
        </p>
      </header>

      {/* panel */}
      <section className={`max-w-7xl mx-auto ${PANEL}`}>
        {/* top controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-400">Record:</label>
          <select
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={activeId ?? ""}
            onChange={(e) => setActiveId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">(none)</option>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-white/10 mx-1" />

          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`New ${tab.slice(0, -1)} name…`}
            className={FLD + " w-56"}
          />
          <button onClick={addRecord} className={BTN_PRIMARY} disabled={pending || !hasApi(tab)}>Add</button>

          <div className="h-6 w-px bg-white/10 mx-1" />

          <input
            value={rename}
            onChange={(e) => setRename(e.target.value)}
            placeholder={active ? `Rename “${active.name}”…` : "Rename…"}
            className={FLD + " w-56"}
            disabled={!active}
          />
          <button onClick={applyRename} className={BTN} disabled={!active || pending || !hasApi(tab)}>
            Apply
          </button>

          {/* Save / Revert */}
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={revertDraft}
              className={BTN}
              disabled={!hasApi(tab) || !active || !dirty || pending}
              title="Discard unsaved changes"
            >
              Revert
            </button>
            <button
              onClick={saveDraft}
              className={BTN_PRIMARY}
              disabled={!hasApi(tab) || !active || !dirty || pending}
              title="Save changes to database"
            >
              Save
            </button>
            <button onClick={deleteRecord} className={BTN_DANGER} disabled={!active || pending || !hasApi(tab)}>
              Delete
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-5">
          <div className="inline-flex overflow-hidden rounded-xl border border-white/10 bg-black/30">
            {(["items", "weapons", "armor", "preview"] as TabKey[]).map((k) => (
              <button
                key={k}
                onClick={() => {
                  setTab(k);
                  ensureSelection(k);
                }}
                className={[
                  "px-4 py-2 text-sm transition",
                  tab === k ? "bg-white/10 text-white" : "text-slate-300 hover:text-white hover:bg-white/5",
                ].join(" ")}
              >
                {{ items: "General Items", weapons: "Weapons", armor: "Armor", preview: "Preview" }[k]}
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* summary */}
          <div className={CARD}>
            <div className="text-sm text-zinc-300 mb-2">Summary</div>
            <SummaryTable tab={tab} rows={rows} activeId={activeId} setActiveId={(v) => setActiveId(Number(v))} />
          </div>

          {/* editor / preview */}
          <div className={CARD}>
            {tab === "preview" ? (
              <div className="space-y-3">
                <textarea readOnly rows={22} className={FLD} value={buildPreview()} />
              </div>
            ) : (
              <RightPanel tab={tab} active={draft} setField={setDraftField} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/** ---------- subcomponents ---------- */

function SummaryTable({
  tab,
  rows,
  activeId,
  setActiveId,
}: {
  tab: TabKey;
  rows: AnyRow[];
  activeId: number | null;
  setActiveId: (v: number) => void;
}) {
  const cell = "px-2 py-1";
  const rowCls = (id: number) =>
    `border-t border-white/10 hover:bg-white/5 cursor-pointer ${activeId === id ? "bg-white/10" : ""}`;

  if (tab === "items") {
    const R = rows as ItemRow[];
    return (
      <div className="overflow-auto rounded-lg border border-white/10">
        <table className="w-[720px] text-sm">
          <thead className="text-left text-zinc-400 bg-white/5">
            <tr>
              <th className={cell}>Item</th>
              <th className={cell}>Cost</th>
              <th className={cell}>Category</th>
              <th className={cell}>Subtype</th>
              <th className={cell}>Weight</th>
              <th className={cell}>Tags</th>
            </tr>
          </thead>
          <tbody>
            {R.map((r) => (
              <tr key={r.id} className={rowCls(r.id)} onClick={() => setActiveId(r.id)}>
                <td className={cell}>{r.name}</td>
                <td className={cell}>{nv(r.cost_credits)}</td>
                <td className={cell}>{nv(r.category)}</td>
                <td className={cell}>{nv(r.subtype)}</td>
                <td className={cell}>{nv(r.weight)}</td>
                <td className={cell}>{nv(r.genre_tags)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "weapons") {
    const R = rows as WeaponRow[];
    return (
      <div className="overflow-auto rounded-lg border border-white/10">
        <table className="w-[900px] text-sm">
          <thead className="text-left text-zinc-400 bg-white/5">
            <tr>
              <th className={cell}>Weapon</th>
              <th className={cell}>Cost</th>
              <th className={cell}>Category</th>
              <th className={cell}>Handed</th>
              <th className={cell}>Type</th>
              <th className={cell}>Range Type</th>
              <th className={cell}>Range</th>
              <th className={cell}>Dmg</th>
              <th className={cell}>Effect</th>
            </tr>
          </thead>
          <tbody>
            {R.map((r) => (
              <tr key={r.id} className={rowCls(r.id)} onClick={() => setActiveId(r.id)}>
                <td className={cell}>{r.name}</td>
                <td className={cell}>{nv(r.cost_credits)}</td>
                <td className={cell}>{nv(r.category)}</td>
                <td className={cell}>{nv(r.handedness)}</td>
                <td className={cell}>{nv(r.dtype)}</td>
                <td className={cell}>{nv(r.range_type)}</td>
                <td className={cell}>{nv(r.range_text)}</td>
                <td className={cell}>{nv(r.damage)}</td>
                <td className={cell}>{nv(r.effect)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // armor
  const R = rows as ArmorRow[];
  return (
    <div className="overflow-auto rounded-lg border border-white/10">
      <table className="w-[880px] text-sm">
        <thead className="text-left text-zinc-400 bg-white/5">
          <tr>
            <th className={cell}>Armor</th>
            <th className={cell}>Cost</th>
            <th className={cell}>Area</th>
            <th className={cell}>Soak</th>
            <th className={cell}>Category</th>
            <th className={cell}>Type</th>
            <th className={cell}>Weight</th>
            <th className={cell}>Enc.</th>
            <th className={cell}>Effect</th>
          </tr>
        </thead>
        <tbody>
          {R.map((r) => (
            <tr key={r.id} className={rowCls(r.id)} onClick={() => setActiveId(r.id)}>
              <td className={cell}>{r.name}</td>
              <td className={cell}>{nv(r.cost_credits)}</td>
              <td className={cell}>{nv(r.area_covered)}</td>
              <td className={cell}>{nv(r.soak)}</td>
              <td className={cell}>{nv(r.category)}</td>
              <td className={cell}>{nv(r.atype)}</td>
              <td className={cell}>{nv(r.weight)}</td>
              <td className={cell}>{nv(r.encumbrance_penalty)}</td>
              <td className={cell}>{nv(r.effect)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RightPanel({
  tab,
  active,
  setField,
}: {
  tab: TabKey;
  active: AnyRow | null; // this is the draft now
  setField: (key: RowKey, value: any) => void;
}) {
  if (!active) return <p className="text-sm text-zinc-400">Select or add a record.</p>;

  if (tab === "items") {
    const o = active as ItemRow;
    return (
      <div className="space-y-4">
        <Grid2>
          <Field label="Name">
            <input className={FLD} value={o.name} onChange={(e) => setField("name", e.target.value)} />
          </Field>
          <Field label="Timeline Tag">
            <input className={FLD} value={o.timeline_tag ?? ""} onChange={(e) => setField("timeline_tag", e.target.value)} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Cost (Credits)">
            <input
              type="number"
              step={1}
              className={FLD}
              value={o.cost_credits ?? ""}
              onChange={(e) => setField("cost_credits", toIntOrNull(e.target.value))}
            />
          </Field>
          <Field label="Category">
            <input className={FLD} placeholder="Tool / Consumable …" value={o.category ?? ""} onChange={(e) => setField("category", e.target.value)} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Subtype">
            <input className={FLD} placeholder="Light Source …" value={o.subtype ?? ""} onChange={(e) => setField("subtype", e.target.value)} />
          </Field>
          <Field label="Weight">
            <input
              type="number"
              step="any" /* floats allowed */
              className={FLD}
              placeholder="e.g., 3 or 0.2"
              value={o.weight ?? ""}
              onChange={(e) => setField("weight", toFloatOrNull(e.target.value))}
            />
          </Field>
        </Grid2>

        <Field label="Genre Tags (comma-separated)">
          <textarea className={FLD} rows={3} value={o.genre_tags ?? ""} onChange={(e) => setField("genre_tags", e.target.value)} />
        </Field>

        <Field label="Mechanical Effect Description">
          <textarea className={FLD} rows={5} value={o.mechanical_effect ?? ""} onChange={(e) => setField("mechanical_effect", e.target.value)} />
        </Field>

        <Field label="Narrative / Variant Notes">
          <textarea className={FLD} rows={5} value={o.narrative_notes ?? ""} onChange={(e) => setField("narrative_notes", e.target.value)} />
        </Field>
      </div>
    );
  }

  if (tab === "weapons") {
    const o = active as WeaponRow;
    return (
      <div className="space-y-4">
        <Grid2>
          <Field label="Name">
            <input className={FLD} value={o.name} onChange={(e) => setField("name", e.target.value)} />
          </Field>
          <Field label="Timeline Tag">
            <input className={FLD} value={o.timeline_tag ?? ""} onChange={(e) => setField("timeline_tag", e.target.value)} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Cost (Credits)">
            <input
              type="number"
              step={1}
              className={FLD}
              value={o.cost_credits ?? ""}
              onChange={(e) => setField("cost_credits", toIntOrNull(e.target.value))}
            />
          </Field>
          <Field label="Category">
            <input className={FLD} placeholder="Sword / Axe …" value={o.category ?? ""} onChange={(e) => setField("category", e.target.value)} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Handedness">
            <input className={FLD} placeholder="1h / 2h / Versatile" value={o.handedness ?? ""} onChange={(e) => setField("handedness", e.target.value)} />
          </Field>
          <Field label="Type">
            <input className={FLD} placeholder="Slashing / Piercing / Bludgeoning" value={o.dtype ?? ""} onChange={(e) => setField("dtype", e.target.value)} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Range Type">
            <input className={FLD} placeholder="Melee / Thrown / Ranged" value={o.range_type ?? ""} onChange={(e) => setField("range_type", e.target.value)} />
          </Field>
          <Field label="Range">
            <input className={FLD} placeholder="Close / 10 ft / 60 ft" value={o.range_text ?? ""} onChange={(e) => setField("range_text", e.target.value)} />
          </Field>
        </Grid2>

        <Field label="Genre Tags">
          <textarea className={FLD} rows={3} value={o.genre_tags ?? ""} onChange={(e) => setField("genre_tags", e.target.value)} />
        </Field>

        <Grid2>
          <Field label="Weight">
            <input
              type="number"
              step="any" /* floats allowed */
              className={FLD}
              placeholder="e.g., 1 or 3.5"
              value={o.weight ?? ""}
              onChange={(e) => setField("weight", toFloatOrNull(e.target.value))}
            />
          </Field>
          <Field label="Damage">
            <input
              type="number"
              step={1}
              className={FLD}
              value={o.damage ?? ""}
              onChange={(e) => setField("damage", toIntOrNull(e.target.value))}
            />
          </Field>
        </Grid2>

        <Field label="Effect">
          <input className={FLD} value={o.effect ?? ""} onChange={(e) => setField("effect", e.target.value)} />
        </Field>
        <Field label="Narrative / Variant Notes">
          <textarea className={FLD} rows={5} value={o.narrative_notes ?? ""} onChange={(e) => setField("narrative_notes", e.target.value)} />
        </Field>
      </div>
    );
  }

  // armor
  const o = active as ArmorRow;
  return (
    <div className="space-y-4">
      <Grid2>
        <Field label="Name">
          <input className={FLD} value={o.name} onChange={(e) => setField("name", e.target.value)} />
        </Field>
        <Field label="Timeline Tag">
          <input className={FLD} value={o.timeline_tag ?? ""} onChange={(e) => setField("timeline_tag", e.target.value)} />
        </Field>
      </Grid2>

      <Grid2>
        <Field label="Cost (Credits)">
          <input
            type="number"
            step={1}
            className={FLD}
            value={o.cost_credits ?? ""}
            onChange={(e) => setField("cost_credits", toIntOrNull(e.target.value))}
          />
        </Field>
        <Field label="Category">
          <input className={FLD} placeholder="Light / Medium / Heavy" value={o.category ?? ""} onChange={(e) => setField("category", e.target.value)} />
        </Field>
      </Grid2>

      <Grid2>
        <Field label="Area Covered">
          <input className={FLD} placeholder="Torso/Arms …" value={o.area_covered ?? ""} onChange={(e) => setField("area_covered", e.target.value)} />
        </Field>
        <Field label="Soak">
          <input
            type="number"
            step={1}
            className={FLD}
            value={o.soak ?? ""}
            onChange={(e) => setField("soak", toIntOrNull(e.target.value))}
          />
        </Field>
      </Grid2>

      <Grid2>
        <Field label="Type">
          <input className={FLD} placeholder="Cloth / Leather / Chain / Scale / Plate" value={o.atype ?? ""} onChange={(e) => setField("atype", e.target.value)} />
        </Field>
        <Field label="Encumbrance Penalty">
          <input
            type="number"
            step={1}
            className={FLD}
            value={o.encumbrance_penalty ?? ""}
            onChange={(e) => setField("encumbrance_penalty", toIntOrNull(e.target.value))}
          />
        </Field>
      </Grid2>

      <Grid2>
        <Field label="Weight">
          <input
            type="number"
            step="any" /* floats allowed */
            className={FLD}
            value={o.weight ?? ""}
            onChange={(e) => setField("weight", toFloatOrNull(e.target.value))}
          />
        </Field>
        <Field label="Effect">
          <input className={FLD} value={o.effect ?? ""} onChange={(e) => setField("effect", e.target.value)} />
        </Field>
      </Grid2>

      <Field label="Genre Tags">
        <textarea className={FLD} rows={3} value={o.genre_tags ?? ""} onChange={(e) => setField("genre_tags", e.target.value)} />
      </Field>
      <Field label="Narrative / Variant Notes">
        <textarea className={FLD} rows={5} value={o.narrative_notes ?? ""} onChange={(e) => setField("narrative_notes", e.target.value)} />
      </Field>
    </div>
  );
}

/** ---------- tiny helpers ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-zinc-300 mb-1">{label}</div>
      {children}
    </label>
  );
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
