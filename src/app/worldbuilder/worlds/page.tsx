// src/app/worldbuilder/worlds/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TimelineV2 } from "../../../components/TimelineV2";

/* ---------- server API shapes (snake_case from /api/world) ---------- */
type ApiWorld = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  eras: ApiEra[];
  settings: ApiSetting[];
  markers: ApiMarker[];
};
type ApiEra = {
  id: number;
  world_id: number;
  name: string;
  description: string | null;
  start_year: number | null;
  end_year: number | null;
  color: string | null;
  order_index: number;
};
type ApiSetting = {
  id: number;
  world_id: number;
  era_id: number | null;
  name: string;
  description: string | null;
  start_year: number | null;
  end_year: number | null;
};
type ApiMarker = {
  id: number;
  world_id: number;
  era_id: number | null;
  name: string;
  description: string | null;
  year: number | null;
};

/* ---------- client UI shapes (camelCase) ---------- */
type Era = {
  id: number;
  name: string;
  description?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  color?: string | null;
  orderIndex: number;
};
type Setting = {
  id: number;
  name: string;
  description?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  eraId: number | null;
};
type Marker = {
  id: number;
  name: string;
  description?: string | null;
  year?: number | null;
  eraId: number | null;
};
type World = {
  id: number;
  name: string;
  description?: string | null;
  eras: Era[];
  settings: Setting[];
  markers: Marker[];
};

/* ---------- mappers ---------- */
function mapWorld(api: ApiWorld): World {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    eras: api.eras
      .sort((a, b) => a.order_index - b.order_index)
      .map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        startYear: e.start_year,
        endYear: e.end_year,
        color: e.color,
        orderIndex: e.order_index,
      })),
    settings: api.settings.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      startYear: s.start_year,
      endYear: s.end_year,
      eraId: s.era_id,
    })),
    markers: api.markers.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      year: m.year,
      eraId: m.era_id,
    })),
  };
}

/* ---------- utils ---------- */
const intOrNull = (s: string): number | null =>
  s === "" ? null : Number.isFinite(Number(s)) ? Number(s) : null;

/* ---------- API helper ---------- */
const API = "/api/world"; // ✅ singular path to match your route.ts

async function assertJSON(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Server returned non-JSON response (${res.status}). Body starts with: ${text.slice(0, 120)}`
    );
  }
}

async function apiGetAllWorlds(): Promise<World[]> {
  const res = await fetch(API, { cache: "no-store" });
  await assertJSON(res);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to fetch worlds");
  const list: ApiWorld[] = json.data ?? [];
  return list.filter(Boolean).map(mapWorld);
}

async function apiGetWorld(id: number): Promise<World> {
  const res = await fetch(`${API}?id=${id}`, { cache: "no-store" });
  await assertJSON(res);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to fetch world");
  return mapWorld(json.data as ApiWorld);
}

async function apiPost<T>(body: any): Promise<T> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertJSON(res);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Operation failed");
  return json.data as T;
}

/* ---------- local nav ---------- */
function WBNav({
  current = "worlds",
}: {
  current?: "worlds" | "creatures" | "skills" | "races" | "abilities";
}) {
  const items = [
    { href: "/worldbuilder/worlds", key: "worlds", label: "Worlds" },
    { href: "/worldbuilder/creatures", key: "creatures", label: "Creatures" },
    { href: "/worldbuilder/skills", key: "skills", label: "Skills" },
    { href: "/worldbuilder/races", key: "races", label: "Races" },
    { href: "/worldbuilder/abilities", key: "abilities", label: "Special Abilities" },
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

/* ---------- main component ---------- */
export default function WorldsPage() {
  // left rail state
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // left rail UI toggles
  const [showNewWorld, setShowNewWorld] = useState(false);
  const [showEditWorld, setShowEditWorld] = useState(false);

  // right pane UI toggles (inline forms)
  const [showNewEra, setShowNewEra] = useState(false);
  const [showNewMarker, setShowNewMarker] = useState(false);
  const [inlineSettingEraId, setInlineSettingEraId] = useState<number | null>(null);

  // Timeline Viewer (V2) modal toggle
  const [showViewer, setShowViewer] = useState(false);

  // scroll target (still used to anchor the section)
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // initial load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiGetAllWorlds();
        setWorlds(data);
        setSelectedWorldId(data.length ? data[0].id : null);
      } catch (e: any) {
        console.warn(e?.message || e);
        setWorlds([]);
        setSelectedWorldId(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = useMemo(
    () => worlds.find((w) => w.id === selectedWorldId) ?? null,
    [worlds, selectedWorldId]
  );

  // ESC closes Timeline Viewer
  useEffect(() => {
    if (!showViewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowViewer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showViewer]);

  /* ---------- helpers to set/replace a world in list ---------- */
  function upsertWorldInList(w: World) {
    setWorlds((prev) => {
      const i = prev.findIndex((x) => x.id === w.id);
      if (i === -1) return [w, ...prev];
      const copy = [...prev];
      copy[i] = w;
      return copy;
    });
  }
  function removeWorldFromList(id: number) {
    setWorlds((prev) => prev.filter((x) => x.id !== id));
  }

  /* ---------- left rail actions (DB wired) ---------- */
  async function addWorld(name: string, description: string) {
    const nm = name.trim();
    if (!nm) return alert("World name is required.");
    try {
      const created = await apiPost<ApiWorld>({
        op: "createWorld",
        name: nm,
        description: description || null,
      });
      const w = mapWorld(created);
      upsertWorldInList(w);
      setSelectedWorldId(w.id);
      setShowNewWorld(false);
    } catch (e: any) {
      alert(e?.message || "Create failed");
    }
  }

  async function updateWorld(name: string, description: string) {
    if (!active) return;
    const nm = name.trim();
    if (!nm) return alert("World name is required.");
    try {
      const updated = await apiPost<ApiWorld>({
        op: "updateWorld",
        id: active.id,
        name: nm,
        description: description ?? null,
      });
      const w = mapWorld(updated);
      upsertWorldInList(w);
      setShowEditWorld(false);
    } catch (e: any) {
      alert(e?.message || "Update failed");
    }
  }

  async function deleteWorld() {
    if (!active) return;
    if (!confirm(`Delete world "${active.name}"?`)) return;
    try {
      await apiPost<{ id: number }>({ op: "deleteWorld", id: active.id });
      removeWorldFromList(active.id);
      setSelectedWorldId(null);
      setShowNewWorld(false);
      setShowEditWorld(false);
      setShowNewEra(false);
      setShowNewMarker(false);
      setInlineSettingEraId(null);
      setShowViewer(false);
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

  /* ---------- right pane: mutations (DB wired) ---------- */
  // ERA
  async function createEra(patch: {
    name: string;
    description: string;
    startYear: number | null;
    endYear: number | null;
    color?: string;
  }) {
    if (!active) return;
    try {
      const updated = await apiPost<ApiWorld>({
        op: "createEra",
        worldId: active.id,
        name: patch.name.trim() || "New Era",
        description: patch.description || null,
        startYear: patch.startYear,
        endYear: patch.endYear,
        color: patch.color || "#8b5cf6",
      });
      upsertWorldInList(mapWorld(updated));
      setShowNewEra(false);
    } catch (e: any) {
      alert(e?.message || "Create era failed");
    }
  }

  async function deleteEra(eraId: number) {
    try {
      const updated = await apiPost<ApiWorld>({ op: "deleteEra", id: eraId });
      upsertWorldInList(mapWorld(updated));
      if (inlineSettingEraId === eraId) setInlineSettingEraId(null);
    } catch (e: any) {
      alert(e?.message || "Delete era failed");
    }
  }

  async function moveEra(eraId: number, dir: -1 | 1) {
    try {
      const updated = await apiPost<ApiWorld>({ op: "moveEra", id: eraId, dir });
      upsertWorldInList(mapWorld(updated));
    } catch (e: any) {
      alert(e?.message || "Move era failed");
    }
  }

  // MARKER
  async function createMarker(patch: {
    name: string;
    description: string;
    year: number | null;
    eraId: number | null;
  }) {
    if (!active) return;
    try {
      const updated = await apiPost<ApiWorld>({
        op: "createMarker",
        worldId: active.id,
        name: patch.name.trim() || "New Event",
        description: patch.description || null,
        year: patch.year,
        eraId: patch.eraId,
      });
      upsertWorldInList(mapWorld(updated));
      setShowNewMarker(false);
    } catch (e: any) {
      alert(e?.message || "Create event failed");
    }
  }

  async function deleteMarker(markerId: number) {
    try {
      const updated = await apiPost<ApiWorld>({ op: "deleteMarker", id: markerId });
      upsertWorldInList(mapWorld(updated));
    } catch (e: any) {
      alert(e?.message || "Delete event failed");
    }
  }

  async function updateMarker(markerId: number, patch: Partial<Marker>) {
    try {
      const updated = await apiPost<ApiWorld>({
        op: "updateMarker",
        id: markerId,
        ...("name" in patch ? { name: patch.name } : {}),
        ...("description" in patch ? { description: patch.description } : {}),
        ...("year" in patch ? { year: patch.year } : {}),
        ...("eraId" in patch ? { eraId: patch.eraId } : {}),
      });
      upsertWorldInList(mapWorld(updated));
    } catch (e: any) {
      alert(e?.message || "Update event failed");
    }
  }

  // SETTING
  async function createSetting(patch: {
    eraId: number | null;
    name: string;
    description: string;
    startYear: number | null;
    endYear: number | null;
  }) {
    if (!active) return;
    try {
      const updated = await apiPost<ApiWorld>({
        op: "createSetting",
        worldId: active.id,
        eraId: patch.eraId,
        name: patch.name.trim() || "New Setting",
        description: patch.description || null,
        startYear: patch.startYear,
        endYear: patch.endYear,
      });
      upsertWorldInList(mapWorld(updated));
      setInlineSettingEraId(null);
    } catch (e: any) {
      alert(e?.message || "Create setting failed");
    }
  }

  async function deleteSetting(settingId: number) {
    try {
      const updated = await apiPost<ApiWorld>({ op: "deleteSetting", id: settingId });
      upsertWorldInList(mapWorld(updated));
    } catch (e: any) {
      alert(e?.message || "Delete setting failed");
    }
  }

  /* ---------- left rail ---------- */
  const worldsSorted = worlds; // newest first by insert (server returns DESC id but we preserve order)

  function LeftRail() {
    return (
      <div className="w-full md:w-80 shrink-0">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="text-sm font-semibold text-zinc-100 mb-2">Your Worlds</div>

          <select
            className="mb-3 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={selectedWorldId ?? ""}
            onChange={async (e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              setSelectedWorldId(id);
              setShowNewWorld(false);
              setShowEditWorld(false);
              setShowNewEra(false);
              setShowNewMarker(false);
              setInlineSettingEraId(null);
              setShowViewer(false);
              if (id != null) {
                // refresh this world's data from server to ensure freshness
                try {
                  const fresh = await apiGetWorld(id);
                  upsertWorldInList(fresh);
                } catch {}
              }
            }}
          >
            <option value="">{loading ? "(loading…)" : worldsSorted.length ? "(Select a world…)" : "(no worlds)"}</option>
            {worldsSorted.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={() => {
                setShowNewWorld(true);
                setShowEditWorld(false);
              }}
            >
              New
            </button>
            <button
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
              disabled={!active}
              onClick={() => {
                if (!active) return;
                setShowEditWorld(true);
                setShowNewWorld(false);
              }}
            >
              Edit
            </button>
            <button
              className="rounded-xl border border-rose-400/40 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-400/10 disabled:opacity-50"
              disabled={!active}
              onClick={deleteWorld}
            >
              Delete
            </button>
          </div>

          {/* New World form */}
          {showNewWorld && (
            <NewWorldForm
              onCancel={() => setShowNewWorld(false)}
              onCreate={(name, desc) => addWorld(name, desc)}
            />
          )}

          {/* Edit World form */}
          {showEditWorld && active && (
            <EditWorldForm
              initial={{ name: active.name, description: active.description ?? "" }}
              onCancel={() => setShowEditWorld(false)}
              onUpdate={(name, desc) => updateWorld(name, desc)}
            />
          )}

          <Link
            className="mt-2 block w-full text-center rounded-xl border border-amber-300/40 px-3 py-1.5 text-sm text-amber-200/90 hover:bg-amber-300/10"
            href="/worldbuilder"
          >
            ← Back to World Builder
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- right pane ---------- */
  function RightPane() {
    if (!active) {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur text-sm text-zinc-400">
          {loading ? "Loading…" : "Select or create a world on the left."}
        </div>
      );
    }

    const eras = [...active.eras].sort((a, b) => a.orderIndex - b.orderIndex);

    return (
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur space-y-10">
        {/* Header row (title + description + details) */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="text-lg font-semibold text-zinc-100">{active.name}</div>
            {active.description ? (
              <div className="text-sm text-zinc-400">{active.description}</div>
            ) : null}
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-lg border border-violet-400/40 px-3 py-1.5 text-sm text-violet-200 hover:bg-violet-400/10 disabled:opacity-50"
              disabled={!eras.length}
              onClick={() => setShowViewer(true)}
              title={eras.length ? "Open Timeline Viewer" : "Add an era to view the timeline"}
            >
              Timeline Viewer
            </button>
            <button
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={() => alert(`(placeholder) Open world details editor for ${active.name}`)}
            >
              World Details
            </button>
          </div>
        </div>

        {/* ORIGINAL right-panel timeline (cards/columns) */}
        <OriginalTimelineSection
          eras={eras}
          active={active}
          setInlineSettingEraId={setInlineSettingEraId}
          deleteSetting={deleteSetting}
          deleteEra={deleteEra}
          setShowNewEra={setShowNewEra}
          moveEra={moveEra}
          inlineSettingEraId={inlineSettingEraId}
          createSetting={createSetting}
          setShowNewMarker={setShowNewMarker}
          createMarker={createMarker}
          deleteMarker={deleteMarker}
          updateMarker={updateMarker}
        />

        {/* Add Era form (uses parent toggle) */}
        {showNewEra && (
          <EraForm
            onCancel={() => setShowNewEra(false)}
            onCreate={(name, desc, start, end, color) =>
              createEra({ name, description: desc, startYear: start, endYear: end, color })
            }
          />
        )}

        {/* Add Marker form (uses parent toggle) */}
        {showNewMarker && (
          <MarkerForm
            eras={eras}
            onCancel={() => setShowNewMarker(false)}
            onCreate={(name, desc, year, eraId) =>
              createMarker({ name, description: desc, year, eraId: eraId ? Number(eraId) : null })
            }
          />
        )}
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <main className="min-h-screen px-6 py-10">
      {/* PAGE HEADER */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/worldbuilder"
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
            >
              ← World Builder
            </Link>
            <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">Worlds</h1>
          </div>
          <WBNav current="worlds" />
        </div>
      </header>

      {/* BODY */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        <LeftRail />
        <RightPane />
      </div>

      {/* TIMELINE VIEWER MODAL (TimelineV2) */}
      {showViewer && active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowViewer(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-[min(1100px,90vw)] max-h-[85vh] rounded-2xl border border-white/10 bg-black/70 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-zinc-200">
                Timeline Viewer — {active.name}
              </div>
              <button
                className="rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/10"
                onClick={() => setShowViewer(false)}
              >
                ✕ Close
              </button>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3 overflow-hidden">
              <TimelineV2
                eras={active.eras.map((e) => ({
                  id: e.id.toString(),
                  name: e.name,
                  startYear: e.startYear ?? undefined,
                  endYear: e.endYear ?? undefined,
                  color: e.color ?? undefined,
                }))}
                settings={active.settings.map((s) => ({
                  id: s.id.toString(),
                  name: s.name,
                  startYear: s.startYear ?? undefined,
                  endYear: s.endYear ?? undefined,
                }))}
                markers={active.markers.map((m) => ({
                  id: m.id.toString(),
                  name: m.name,
                  year: m.year ?? undefined,
                }))}
                height={420}
                pad={60}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- ORIGINAL timeline section (cards/columns + lists) ---------- */
function OriginalTimelineSection({
  eras,
  active,
  setInlineSettingEraId,
  deleteSetting,
  deleteEra,
  setShowNewEra,
  moveEra,
  inlineSettingEraId,
  createSetting,
  setShowNewMarker,
  createMarker,
  deleteMarker,
  updateMarker,
}: {
  eras: Era[];
  active: World;
  setInlineSettingEraId: (v: number | null) => void;
  deleteSetting: (id: number) => void;
  deleteEra: (id: number) => void;
  setShowNewEra: (v: boolean) => void;
  moveEra: (id: number, dir: -1 | 1) => void;
  inlineSettingEraId: number | null;
  createSetting: (patch: {
    eraId: number | null;
    name: string;
    description: string;
    startYear: number | null;
    endYear: number | null;
  }) => void;
  setShowNewMarker: (v: boolean) => void;
  createMarker: (patch: {
    name: string;
    description: string;
    year: number | null;
    eraId: number | null;
  }) => void;
  deleteMarker: (id: number) => void;
  updateMarker: (id: number, patch: Partial<Marker>) => void;
}) {
  return (
    <>
      {/* Timeline Visualization (cards/columns) */}
      <section>
        <div className="text-base font-semibold text-zinc-100">Timeline Visualization</div>
        <div className="text-sm text-zinc-400">Visual representation of your world's history</div>

        {eras.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-400">Add eras to see the timeline.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <div className="flex gap-6 min-w-max py-2">
              {eras.map((era) => {
                const settings = active.settings.filter((s) => s.eraId === era.id);
                const markers = active.markers.filter((m) => m.eraId === era.id);
                return (
                  <div
                    key={era.id}
                    className="w-80 rounded-xl border border-white/10 bg-black/30 p-3"
                    style={{ boxShadow: `inset 0 0 0 2px ${era.color ?? "#00000000"}` }}
                  >
                    <div className="font-semibold flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded"
                        style={{ backgroundColor: era.color ?? "#8b5cf6" }}
                      />
                      {era.name}
                    </div>
                    {(era.startYear != null || era.endYear != null) && (
                      <div className="text-xs text-zinc-400">
                        {era.startYear != null ? era.startYear : ""}
                        {(era.startYear != null || era.endYear != null) ? " - " : ""}
                        {era.endYear != null ? era.endYear : ""}
                      </div>
                    )}
                    {era.description && (
                      <div className="mt-1 text-xs text-zinc-400">{era.description}</div>
                    )}

                    {/* settings */}
                    {settings.length > 0 && (
                      <>
                        <div className="mt-2 text-xs font-medium text-violet-300">Settings</div>
                        <div className="mt-1 space-y-1">
                          {settings.map((s) => (
                            <div key={s.id} className="flex items-center gap-2 text-xs">
                              <div className="flex-1">
                                {s.name}
                                {(s.startYear != null || s.endYear != null) && (
                                  <>
                                    {" "}
                                    ({s.startYear ?? ""}
                                    {(s.startYear != null || s.endYear != null) ? " - " : ""}
                                    {s.endYear ?? ""})
                                  </>
                                )}
                                {s.description ? ` — ${s.description}` : ""}
                              </div>
                              <button
                                className="rounded border border-white/15 px-2 py-0.5 hover:bg-white/10"
                                onClick={() => alert(`(placeholder) Setting #${s.id}`)}
                              >
                                Details
                              </button>
                              <button
                                className="rounded border border-rose-400/40 px-2 py-0.5 text-rose-200 hover:bg-rose-400/10"
                                onClick={() => deleteSetting(s.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* markers */}
                    {markers.length > 0 && (
                      <>
                        <div className="mt-3 text-xs font-medium text-zinc-300">Events</div>
                        <div className="mt-1 space-y-1">
                          {markers.map((m) => (
                            <div key={m.id} className="flex items-center gap-2 text-xs">
                              <div className="flex-1">
                                {m.name}
                                {m.year != null ? ` (Year ${m.year})` : ""}
                                {m.description ? ` — ${m.description}` : ""}
                              </div>
                              <button
                                className="rounded border border-white/15 px-2 py-0.5 hover:bg-white/10"
                                onClick={() => alert(`(placeholder) Event #${m.id}`)}
                              >
                                Details
                              </button>
                              <button
                                className="rounded border border-rose-400/40 px-2 py-0.5 text-rose-200 hover:bg-rose-400/10"
                                onClick={() => deleteMarker(m.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                        onClick={() => setInlineSettingEraId(era.id)}
                      >
                        + Add Setting
                      </button>
                      <button
                        className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                        onClick={() => alert(`(placeholder) Era #${era.id}`)}
                      >
                        Era Details
                      </button>
                      <button
                        className="rounded border border-rose-400/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-400/10"
                        onClick={() => deleteEra(era.id)}
                      >
                        🗑 Delete Era
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Unassigned events column */}
              {active.markers.some((m) => m.eraId === null) && (
                <div className="w-80 rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="font-semibold text-zinc-300">Unassigned</div>
                  <div className="mt-1 space-y-1 text-xs">
                    {active.markers
                      .filter((m) => m.eraId === null)
                      .map((m) => (
                        <div key={m.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            {m.name}
                            {m.year != null ? ` (Year ${m.year})` : ""}
                            {m.description ? ` — ${m.description}` : ""}
                          </div>
                          <button
                            className="rounded border border-white/15 px-2 py-0.5 hover:bg-white/10"
                            onClick={() => alert(`(placeholder) Event #${m.id}`)}
                          >
                            Details
                          </button>
                          <button
                            className="rounded border border-rose-400/40 px-2 py-0.5 text-rose-200 hover:bg-rose-400/10"
                            onClick={() => deleteMarker(m.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Timeline Eras section (list + inline Setting form) */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-base font-semibold text-zinc-100">Timeline Eras</div>
          <div className="ms-auto flex gap-2">
            <button
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={() => setShowNewEra(true)}
            >
              + Add Era
            </button>
          </div>
        </div>

        {eras.length === 0 ? (
          <div className="text-sm text-zinc-400">
            No eras yet. Add your first era to begin building the timeline.
          </div>
        ) : (
          <div className="space-y-2">
            {eras.map((era) => (
              <div key={era.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-zinc-100 flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded"
                        style={{ backgroundColor: era.color ?? "#8b5cf6" }}
                      />
                      {era.name}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {era.description || ""}
                      {(era.startYear != null || era.endYear != null) && (
                        <>
                          {" "}
                          — Years {era.startYear ?? ""}
                          {(era.startYear != null || era.endYear != null) ? " - " : ""}
                          {era.endYear ?? ""}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                      title="Move up"
                      onClick={() => moveEra(era.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                      title="Move down"
                      onClick={() => moveEra(era.id, +1)}
                    >
                      ↓
                    </button>
                    <button
                      className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                      onClick={() => setInlineSettingEraId(era.id)}
                    >
                      + Add Setting
                    </button>
                    <button
                      className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                      onClick={() => alert(`(placeholder) Era #${era.id}`)}
                    >
                      Era Details
                    </button>
                    <button
                      className="rounded border border-rose-400/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-400/10"
                      onClick={() => deleteEra(era.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* existing era settings */}
                <div className="mt-2 space-y-1">
                  {active.settings
                    .filter((s) => s.eraId === era.id)
                    .map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-sm text-violet-200">
                        <div className="flex-1">
                          • {s.name}
                          {(s.startYear != null || s.endYear != null) && (
                            <>
                              {" "}
                              ({s.startYear ?? ""}
                              {(s.startYear != null || s.endYear != null) ? " - " : ""}
                              {s.endYear ?? ""})
                            </>
                          )}
                          {s.description ? ` — ${s.description}` : ""}
                        </div>
                        <button
                          className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                          onClick={() => alert(`(placeholder) Setting #${s.id}`)}
                        >
                          Details
                        </button>
                        <button
                          className="rounded border border-rose-400/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-400/10"
                          onClick={() => deleteSetting(s.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                </div>

                {/* inline create setting for this era */}
                {inlineSettingEraId === era.id && (
                  <SettingForm
                    onCancel={() => setInlineSettingEraId(null)}
                    onCreate={(name, desc, start, end) =>
                      createSetting({
                        eraId: era.id,
                        name,
                        description: desc,
                        startYear: start,
                        endYear: end,
                      })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Markers section */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-base font-semibold text-zinc-100">Event Markers</div>
          <div className="ms-auto">
            <button
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={() => setShowNewMarker(true)}
            >
              + Add Event
            </button>
          </div>
        </div>

        {active.markers.length === 0 ? (
          <div className="text-sm text-zinc-400">
            No event markers yet. Add events to mark important moments.
          </div>
        ) : (
          <div className="space-y-2">
            {active.markers.map((m) => {
              const eraName = m.eraId
                ? eras.find((e) => e.id === m.eraId)?.name || "Unknown Era"
                : "Unassigned";
              return (
                <div key={m.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm md:col-span-2"
                      value={m.name}
                      onChange={(e) => updateMarker(m.id, { name: e.target.value })}
                    />
                    <input
                      type="number"
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                      placeholder="Year"
                      value={m.year ?? ""}
                      onChange={(e) => updateMarker(m.id, { year: intOrNull(e.target.value) ?? undefined })}
                    />
                    <select
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                      value={m.eraId ?? ""}
                      onChange={(e) =>
                        updateMarker(m.id, { eraId: e.target.value ? Number(e.target.value) : null })
                      }
                    >
                      <option value="">(Unassigned)</option>
                      {eras.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        className="rounded border border-white/15 px-2 text-sm hover:bg-white/10"
                        onClick={() => alert(`(placeholder) Event #${m.id}`)}
                      >
                        Details
                      </button>
                      <button
                        className="rounded border border-rose-400/40 px-2 text-sm text-rose-200 hover:bg-rose-400/10"
                        onClick={() => deleteMarker(m.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                    placeholder="Event description…"
                    value={m.description ?? ""}
                    onChange={(e) => updateMarker(m.id, { description: e.target.value })}
                  />
                  <div className="mt-1 text-xs text-zinc-400">Era: {eraName}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

/* ---------- small subforms ---------- */
function NewWorldForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (name: string, desc: string) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-sm font-semibold text-zinc-100 mb-2">Create World</div>
      <label className="block mb-2">
        <div className="text-xs text-zinc-300 mb-1">Name</div>
        <input
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block">
        <div className="text-xs text-zinc-300 mb-1">Description</div>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-xl border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-400/10"
          onClick={() => onCreate(name, desc)}
        >
          Create
        </button>
      </div>
    </div>
  );
}

function EditWorldForm({
  initial,
  onCancel,
  onUpdate,
}: {
  initial: { name: string; description: string };
  onCancel: () => void;
  onUpdate: (n: string, d: string) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [desc, setDesc] = useState(initial.description);
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-sm font-semibold text-zinc-100 mb-2">Edit World</div>
      <label className="block mb-2">
        <div className="text-xs text-zinc-300 mb-1">Name</div>
        <input
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block">
        <div className="text-xs text-zinc-300 mb-1">Description</div>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-xl border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-400/10"
          onClick={() => onUpdate(name, desc)}
        >
          Update
        </button>
      </div>
    </div>
  );
}

function EraForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (name: string, desc: string, start: number | null, end: number | null, color: string) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [color, setColor] = useState("#8b5cf6");
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-sm font-semibold text-zinc-100 mb-2">Create Era</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="color"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <textarea
        rows={3}
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        placeholder="Description…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input
          type="number"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="Start (optional)"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="number"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="End (optional)"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-xl border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-400/10"
          onClick={() => onCreate(name, desc, intOrNull(start), intOrNull(end), color)}
        >
          Create Era
        </button>
      </div>
    </div>
  );
}

function MarkerForm({
  eras,
  onCancel,
  onCreate,
}: {
  eras: Era[];
  onCancel: () => void;
  onCreate: (name: string, desc: string, year: number | null, eraId: number | null) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [year, setYear] = useState<string>("");
  const [eraId, setEraId] = useState<string>("");
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-sm font-semibold text-zinc-100 mb-2">Create Event Marker</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="Year (optional)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>
      <textarea
        rows={3}
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        placeholder="Description…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <select
        className="mt-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        value={eraId}
        onChange={(e) => setEraId(e.target.value)}
      >
        <option value="">— Unassigned —</option>
        {eras.map((e) => (
          <option key={e.id} value={String(e.id)}>
            {e.name}
          </option>
        ))}
      </select>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-xl border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-400/10"
          onClick={() => onCreate(name, desc, intOrNull(year), eraId ? Number(eraId) : null)}
        >
          Create Event
        </button>
      </div>
    </div>
  );
}

function SettingForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (name: string, desc: string, start: number | null, end: number | null) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-black/25 p-3">
      <div className="text-sm font-semibold text-zinc-100 mb-2">Create Setting</div>
      <input
        className="mb-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        rows={3}
        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        placeholder="Description…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input
          type="number"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="Start (optional)"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="number"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="End (optional)"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded-xl border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-xl border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-400/10"
          onClick={() => onCreate(name, desc, intOrNull(start), intOrNull(end))}
        >
          Create Setting
        </button>
      </div>
    </div>
  );
}
