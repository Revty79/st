// src/app/worldbuilder/worlds/eventdetails/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WorldBuilderNavigation from "@/components/worldbuilder/WorldBuilderNavigation";

/* ---------- types ---------- */
type ApiMarker = {
  id: number;
  world_id: number;
  era_id: number | null;
  name: string;
  description: string | null;
  year: number | null;
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

type ApiWorld = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  eras: ApiEra[];
  settings: any[];
  markers: ApiMarker[];
};

type Marker = {
  id: number;
  worldId: number;
  eraId: number | null;
  name: string;
  description?: string | null;
  year?: number | null;
};

type Era = {
  id: number;
  name: string;
  description?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  color?: string | null;
};

type World = {
  id: number;
  name: string;
  description?: string | null;
};

/* ---------- API helpers ---------- */
const API = "/api/world";

async function assertJSON(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Server returned non-JSON response (${res.status}). Body starts with: ${text.slice(0, 120)}`
    );
  }
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

async function apiGetWorld(id: number): Promise<ApiWorld> {
  const res = await fetch(`${API}?id=${id}`, { cache: "no-store" });
  await assertJSON(res);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to fetch world");
  return json.data as ApiWorld;
}

/* ---------- utils ---------- */
const intOrNull = (s: string): number | null =>
  s === "" ? null : Number.isFinite(Number(s)) ? Number(s) : null;

/* ---------- main component ---------- */
function EventDetailsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const worldId = searchParams.get("worldId");
  const eraId = searchParams.get("eraId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [world, setWorld] = useState<World | null>(null);
  const [era, setEra] = useState<Era | null>(null);
  const [marker, setMarker] = useState<Marker | null>(null);
  const [availableEras, setAvailableEras] = useState<Era[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [selectedEraId, setSelectedEraId] = useState<number | null>(null);

  // Load data
  useEffect(() => {
    if (!eventId || !worldId) return;

    (async () => {
      try {
        setLoading(true);
        const worldData = await apiGetWorld(Number(worldId));
        
        // Find the marker
        const foundMarker = worldData.markers.find(m => m.id === Number(eventId));
        if (!foundMarker) {
          throw new Error("Event not found");
        }

        // Map world data
        const mappedWorld: World = {
          id: worldData.id,
          name: worldData.name,
          description: worldData.description
        };

        // Map eras
        const mappedEras: Era[] = worldData.eras.map(e => ({
          id: e.id,
          name: e.name,
          description: e.description,
          startYear: e.start_year,
          endYear: e.end_year,
          color: e.color
        }));

        // Find era if assigned
        const foundEra = foundMarker.era_id 
          ? mappedEras.find(e => e.id === foundMarker.era_id) || null
          : null;

        // Map marker
        const mappedMarker: Marker = {
          id: foundMarker.id,
          worldId: foundMarker.world_id,
          eraId: foundMarker.era_id,
          name: foundMarker.name,
          description: foundMarker.description,
          year: foundMarker.year
        };

        setWorld(mappedWorld);
        setEra(foundEra);
        setMarker(mappedMarker);
        setAvailableEras(mappedEras);

        // Set form state
        setName(mappedMarker.name);
        setDescription(mappedMarker.description || "");
        setYear(mappedMarker.year ?? null);
        setSelectedEraId(mappedMarker.eraId);

      } catch (error: any) {
        console.error("Failed to load event:", error);
        alert(error.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, worldId]);

  // Save changes
  async function handleSave() {
    if (!marker || !name.trim()) return;

    try {
      setSaving(true);
      await apiPost({
        op: "updateMarker",
        id: marker.id,
        name: name.trim(),
        description: description.trim() || null,
        year: year,
        eraId: selectedEraId
      });
      
      alert("Event saved successfully!");
      
      // Refresh the marker data
      const worldData = await apiGetWorld(Number(worldId));
      const updatedMarker = worldData.markers.find(m => m.id === Number(eventId));
      if (updatedMarker) {
        const mappedMarker: Marker = {
          id: updatedMarker.id,
          worldId: updatedMarker.world_id,
          eraId: updatedMarker.era_id,
          name: updatedMarker.name,
          description: updatedMarker.description,
          year: updatedMarker.year
        };
        setMarker(mappedMarker);
        
        // Update era if changed
        const newEra = selectedEraId 
          ? availableEras.find(e => e.id === selectedEraId) || null
          : null;
        setEra(newEra);
      }
      
    } catch (error: any) {
      console.error("Failed to save event:", error);
      alert(error.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  // Delete event
  async function handleDelete() {
    if (!marker || !confirm(`Delete event "${marker.name}"?`)) return;

    try {
      setSaving(true);
      await apiPost({
        op: "deleteMarker",
        id: marker.id
      });
      
      alert("Event deleted successfully!");
      window.location.href = `/worldbuilder/worlds?world=${worldId}`;
      
    } catch (error: any) {
      console.error("Failed to delete event:", error);
      alert(error.message || "Failed to delete event");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-zinc-400">Loading event...</div>
        </div>
      </main>
    );
  }

  if (!marker || !world) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-zinc-400">Event not found</div>
          <div className="mt-4 text-center">
            <Link 
              href="/worldbuilder/worlds"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
            >
              Back to Worlds
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      {/* PAGE HEADER */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/worldbuilder/worlds?world=${worldId}`}
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
            >
              ← {world.name}
            </Link>
            <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
              Event Details
            </h1>
          </div>
          <WorldBuilderNavigation current="worlds" />
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/worldbuilder" className="hover:text-zinc-300">World Builder</Link>
          <span>→</span>
          <Link href="/worldbuilder/worlds" className="hover:text-zinc-300">Worlds</Link>
          <span>→</span>
          <Link href={`/worldbuilder/worlds?world=${worldId}`} className="hover:text-zinc-300">{world.name}</Link>
          {era && (
            <>
              <span>→</span>
              <Link href={`/worldbuilder/worlds/eradetails?worldId=${worldId}&eraId=${era.id}`} className="hover:text-zinc-300">{era.name}</Link>
            </>
          )}
          <span>→</span>
          <span className="text-zinc-200">{marker.name}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          
          {/* Header Info */}
          <div className="mb-6 pb-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold text-zinc-100">{marker.name}</div>
                <div className="text-sm text-zinc-400 mt-1">
                  World: {world.name}
                  {era && <> • Era: {era.name}</>}
                  {marker.year !== null && <> • Year: {marker.year}</>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="rounded-xl border border-emerald-400/40 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-400/10 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="rounded-xl border border-rose-400/40 px-4 py-2 text-sm text-rose-200 hover:bg-rose-400/10 disabled:opacity-50"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                  placeholder="Enter event name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={year ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(intOrNull(e.target.value))}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                  placeholder="Enter year (optional)"
                />
              </div>
            </div>

            {/* Era Assignment */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Assigned Era
              </label>
              <select
                value={selectedEraId ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEraId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
              >
                <option value="">Unassigned</option>
                {availableEras.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                    {(e.startYear || e.endYear) && ` (${e.startYear ?? ""} - ${e.endYear ?? ""})`}
                  </option>
                ))}
              </select>
              <div className="text-xs text-zinc-400 mt-1">
                Assign this event to an era for better timeline organization
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Description
              </label>
              {React.createElement('textarea', {
                rows: 6,
                value: description,
                onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value),
                className: "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 resize-vertical",
                placeholder: "Describe this event, its significance, consequences, or any relevant details..."
              })}
            </div>

            {/* Era Context (if assigned) */}
            {era && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-medium text-zinc-200 mb-2">Era Context</div>
                <div className="text-sm text-zinc-400">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block h-3 w-3 rounded"
                      style={{ backgroundColor: era.color ?? "#8b5cf6" }}
                    />
                    <strong>{era.name}</strong>
                    {(era.startYear || era.endYear) && (
                      <span className="text-zinc-500">
                        ({era.startYear ?? ""} - {era.endYear ?? ""})
                      </span>
                    )}
                  </div>
                  {era.description && (
                    <div className="mt-2 text-zinc-400">{era.description}</div>
                  )}
                </div>
                <div className="mt-3">
                  <Link
                    href={`/worldbuilder/worlds/eradetails?worldId=${worldId}&eraId=${era.id}`}
                    className="text-sm text-violet-300 hover:text-violet-200"
                  >
                    View Era Details →
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-zinc-400">Loading...</div>
        </div>
      </main>
    }>
      <EventDetailsContent />
    </Suspense>
  );
}