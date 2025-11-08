"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ---------- Types ---------- */
type Era = {
  id: number;
  world_id: number;
  name: string;
  short_summary: string | null;
  ongoing: boolean;
  start_year: number | null;
  start_month: number | null;
  start_day: number | null;
  end_year: number | null;
  end_month: number | null;
  end_day: number | null;
  tech_level: string | null;
  magic_tide: string | null;
  stability_conflict: string | null;
  travel_safety: number | null;
  economy: string | null;
  law_order: string | null;
  religious_temperature: string | null;
  rules_rest_recovery: string | null;
  rules_difficulty_bias: number | null;
  transition_in: string | null;
  transition_out: string | null;
  color: string | null;
  friendly_label: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

type Government = {
  id?: number;
  era_id: number;
  name: string;
  gov_type: string | null;
  territory_controlled: string | null;
  current_ruler: string | null;
  stability_status: string | null;
  military_strength: string | null;
};

type TradeRoute = {
  id?: number;
  era_id: number;
  name: string;
  status: string;
  start_point: string | null;
  end_point: string | null;
  trade_goods: string | null;
};

type EconomicCondition = {
  id?: number;
  era_id: number;
  condition_type: string;
  description: string | null;
  affected_regions: string | null;
};

type Catalyst = {
  id?: number;
  era_id: number;
  title: string;
  catalyst_type: string;
  start_date_year: number | null;
  start_date_month: number | null;
  start_date_day: number | null;
  end_date_year: number | null;
  end_date_month: number | null;
  end_date_day: number | null;
  player_visible: boolean;
  short_summary: string | null;
  full_notes: string | null;
  impacts: string | null;
  mechanical_tags: string | null;
  ripple_effects: string | null;
  anniversary_date: string | null;
  related_catalysts: string | null;
  settlement_reactions: string | null;
  attachment_url: string | null;
};

type Currency = {
  id?: number;
  era_id: number;
  region_id: number | null;
  coin_name: string;
  value_in_credits: number;
};

type Region = {
  id?: number;
  era_id: number;
  name: string;
  kind: string;
  parent_govt: string | null;
  currency_rule: string;
  local_coins: string | null;
};

/* ---------- Constants ---------- */
const MAGIC_TIDE_OPTIONS = ["Dormant", "Low", "Normal", "High", "Surging"];
const STABILITY_OPTIONS = ["Peaceful", "Tense", "Cold War", "Open War", "Collapse"];
const TRAVEL_SAFETY_OPTIONS = [
  { label: "Very Risky", value: -2 },
  { label: "Risky", value: -1 },
  { label: "Normal", value: 0 },
  { label: "Safe", value: 1 },
  { label: "Very Safe", value: 2 },
];
const ECONOMY_OPTIONS = ["Bust", "Strained", "Stable", "Boom", "Speculative"];
const LAW_ORDER_OPTIONS = ["Lawless", "Loose", "Mixed", "Strict", "Martial"];
const RELIGIOUS_TEMP_OPTIONS = ["Dormant", "Steady", "Revival", "Schism", "Crusade"];
const REST_RECOVERY_OPTIONS = ["Standard", "Gritty", "Heroic"];
const DIFFICULTY_BIAS_OPTIONS = [
  { label: "-1", value: -1 },
  { label: "0", value: 0 },
  { label: "+1", value: 1 },
];
const GOVERNMENT_TYPES = ["Monarchy", "Republic", "Theocracy", "Oligarchy", "Anarchy", "Empire", "Federation", "Tribal", "Other"];
const STABILITY_STATUS_OPTIONS = ["Strong", "Stable", "Shaky", "Failing", "In Crisis"];
const MILITARY_STRENGTH_OPTIONS = ["Weak", "Moderate", "Strong", "Dominant"];
const TRADE_ROUTE_STATUS = ["Active", "Disrupted", "New", "Abandoned"];
const ECONOMIC_CONDITION_TYPES = ["Boom", "Bust", "Crisis", "Embargo", "Trade War", "Market Manipulation", "Resource Scarcity"];
const CATALYST_TYPE_OPTIONS = [
  "Discovery", "Founding", "Conflict", "Disaster", "Edict", 
  "Migration", "Phenomenon", "Miracle", "Quest", "Other"
];
const REGION_KIND_OPTIONS = ["Region", "Kingdom", "City-State", "Territory", "Province"];
const CURRENCY_RULE_OPTIONS = ["Use Era", "Copy & Edit", "Custom"];

const TAB_SECTIONS = [
  { id: "basic", label: "Basic Info" },
  { id: "backdrop", label: "Backdrop Defaults" },
  { id: "governments", label: "Governments & Trade" },
  { id: "catalogs", label: "Catalogs" },
  { id: "economy", label: "Economy & Regions" },
  { id: "catalysts", label: "Catalyst Events" },
];

/* ---------- Main Component ---------- */
export default function EraDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldId = searchParams.get("worldId");
  const eraId = searchParams.get("eraId");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [era, setEra] = useState<Era | null>(null);
  const [tab, setTab] = useState<string>("basic");

  // Related data
  const [governments, setGovernments] = useState<Government[]>([]);
  const [tradeRoutes, setTradeRoutes] = useState<TradeRoute[]>([]);
  const [economicConditions, setEconomicConditions] = useState<EconomicCondition[]>([]);
  const [catalysts, setCatalysts] = useState<Catalyst[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  // Load era data
  useEffect(() => {
    if (!eraId || !worldId) return;
    loadEra();
  }, [eraId, worldId]);

  async function loadEra() {
    setLoading(true);
    try {
      const res = await fetch(`/api/world/eras?id=${eraId}`);
      const data = await res.json();
      if (data.ok) {
        setEra(data.data.era);
        setGovernments(data.data.governments || []);
        setTradeRoutes(data.data.tradeRoutes || []);
        setEconomicConditions(data.data.economicConditions || []);
        setCatalysts(data.data.catalysts || []);
        setCurrencies(data.data.currencies || []);
        setRegions(data.data.regions || []);
      } else {
        throw new Error(data.error || "Failed to load era");
      }
    } catch (e: any) {
      alert(`Failed to load era: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveEra() {
    if (!era) return;
    setSaving(true);
    try {
      const res = await fetch("/api/world/eras", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(era),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed");
      setEra(data.data); // Update with saved data
      alert("Era saved successfully!");
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  const updateEra = (field: keyof Era, value: any) => {
    setEra((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-7xl mx-auto text-center text-zinc-400">Loading era...</div>
      </main>
    );
  }

  if (!era) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-7xl mx-auto text-center text-zinc-400">
          Era not found. <Link href="/worldbuilder/worlds" className="text-violet-400 hover:underline">Return to Worlds</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/worldbuilder/worlds/worlddetails?worldId=${worldId}`}
              className="rounded-xl border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
            >
              ← World Details
            </Link>
            <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
              Era Details: {era.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={saveEra}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors font-medium text-sm"
            >
              {saving ? "Saving..." : "Save Era"}
            </button>
          </div>
        </div>
        <p className="text-sm text-zinc-300">
          Configure era backdrop, catalogs, economy, and catalyst events.
        </p>
      </header>

      {/* Tabs */}
      <nav className="max-w-7xl mx-auto mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {TAB_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setTab(section.id)}
            className={[
              "px-4 py-2 rounded-t-lg text-sm font-medium transition-colors",
              tab === section.id
                ? "bg-white/10 text-white border-b-2 border-violet-400"
                : "text-zinc-400 hover:text-white hover:bg-white/5",
            ].join(" ")}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <section className="max-w-7xl mx-auto rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-6">
        {/* Basic Info */}
        {tab === "basic" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Basic Info</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Era Name (≤60 chars)</label>
              <input
                type="text"
                maxLength={60}
                value={era.name}
                onChange={(e) => updateEra("name", e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Short Summary (≤240 chars)</label>
              <textarea
                maxLength={240}
                value={era.short_summary || ""}
                onChange={(e) => updateEra("short_summary", e.target.value)}
                className="w-full h-24 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ongoing"
                checked={era.ongoing}
                onChange={(e) => updateEra("ongoing", e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-violet-600 focus:ring-2 focus:ring-amber-400"
              />
              <label htmlFor="ongoing" className="text-sm text-zinc-300">
                Ongoing (no end date)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Year"
                    value={era.start_year || ""}
                    onChange={(e) => updateEra("start_year", e.target.value ? Number(e.target.value) : null)}
                    className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="number"
                    placeholder="Month"
                    min={1}
                    max={12}
                    value={era.start_month || ""}
                    onChange={(e) => updateEra("start_month", e.target.value ? Number(e.target.value) : null)}
                    className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="number"
                    placeholder="Day"
                    min={1}
                    max={31}
                    value={era.start_day || ""}
                    onChange={(e) => updateEra("start_day", e.target.value ? Number(e.target.value) : null)}
                    className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {!era.ongoing && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">End Date</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Year"
                      value={era.end_year || ""}
                      onChange={(e) => updateEra("end_year", e.target.value ? Number(e.target.value) : null)}
                      className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input
                      type="number"
                      placeholder="Month"
                      min={1}
                      max={12}
                      value={era.end_month || ""}
                      onChange={(e) => updateEra("end_month", e.target.value ? Number(e.target.value) : null)}
                      className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input
                      type="number"
                      placeholder="Day"
                      min={1}
                      max={31}
                      value={era.end_day || ""}
                      onChange={(e) => updateEra("end_day", e.target.value ? Number(e.target.value) : null)}
                      className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Transition In (≤240 chars)</label>
              <textarea
                maxLength={240}
                value={era.transition_in || ""}
                onChange={(e) => updateEra("transition_in", e.target.value)}
                placeholder="What ended the last era..."
                className="w-full h-20 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Transition Out (≤240 chars)</label>
              <textarea
                maxLength={240}
                value={era.transition_out || ""}
                onChange={(e) => updateEra("transition_out", e.target.value)}
                placeholder="What force will end this era..."
                className="w-full h-20 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Backdrop Defaults */}
        {tab === "backdrop" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Backdrop Defaults</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Magic Tide</label>
              <select
                value={era.magic_tide || ""}
                onChange={(e) => updateEra("magic_tide", e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select...</option>
                {MAGIC_TIDE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Stability & Conflict</label>
              <select
                value={era.stability_conflict || ""}
                onChange={(e) => updateEra("stability_conflict", e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select...</option>
                {STABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Travel Safety</label>
              <select
                value={era.travel_safety ?? ""}
                onChange={(e) => updateEra("travel_safety", e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select...</option>
                {TRAVEL_SAFETY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label} ({opt.value >= 0 ? '+' : ''}{opt.value})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Economy</label>
              <select
                value={era.economy || ""}
                onChange={(e) => updateEra("economy", e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select...</option>
                {ECONOMY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Law & Order</label>
              <select
                value={era.law_order || ""}
                onChange={(e) => updateEra("law_order", e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select...</option>
                {LAW_ORDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Religious Temperature</label>
              <select
                value={era.religious_temperature || ""}
                onChange={(e) => updateEra("religious_temperature", e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Select...</option>
                {RELIGIOUS_TEMP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Default Rules Style</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Rest & Recovery</label>
                  <select
                    value={era.rules_rest_recovery || ""}
                    onChange={(e) => updateEra("rules_rest_recovery", e.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select...</option>
                    {REST_RECOVERY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Difficulty Bias</label>
                  <select
                    value={era.rules_difficulty_bias ?? ""}
                    onChange={(e) => updateEra("rules_difficulty_bias", e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select...</option>
                    {DIFFICULTY_BIAS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Governments & Trade */}
        {tab === "governments" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Governments & Trade</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Define the political landscape and trade networks for this era.
            </p>

            {/* Governments */}
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Governments ({governments.length}/20)</h3>
                <button
                  onClick={() => {
                    if (governments.length >= 20) {
                      alert("Maximum 20 governments per era");
                      return;
                    }
                    setGovernments([...governments, {
                      era_id: Number(eraId),
                      name: "",
                      gov_type: "Monarchy",
                      territory_controlled: "",
                      current_ruler: "",
                      stability_status: "Stable",
                      military_strength: "Medium"
                    }]);
                  }}
                  className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded"
                >
                  + Add Government
                </button>
              </div>

              {governments.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No governments defined yet</p>
              ) : (
                <div className="space-y-3">
                  {governments.map((gov, idx) => (
                    <div key={gov.id || `new-${idx}`} className="border border-white/10 rounded p-3 bg-black/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Name *</label>
                          <input
                            type="text"
                            value={gov.name}
                            onChange={(e) => {
                              const updated = [...governments];
                              updated[idx].name = e.target.value;
                              setGovernments(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., Kingdom of Aldor"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Type</label>
                          <select
                            value={gov.gov_type || ""}
                            onChange={(e) => {
                              const updated = [...governments];
                              updated[idx].gov_type = e.target.value;
                              setGovernments(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          >
                            {GOVERNMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Current Ruler</label>
                          <input
                            type="text"
                            value={gov.current_ruler || ""}
                            onChange={(e) => {
                              const updated = [...governments];
                              updated[idx].current_ruler = e.target.value;
                              setGovernments(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., Queen Elara III"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Stability</label>
                          <select
                            value={gov.stability_status || ""}
                            onChange={(e) => {
                              const updated = [...governments];
                              updated[idx].stability_status = e.target.value;
                              setGovernments(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          >
                            {STABILITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Military Strength</label>
                          <select
                            value={gov.military_strength || ""}
                            onChange={(e) => {
                              const updated = [...governments];
                              updated[idx].military_strength = e.target.value;
                              setGovernments(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          >
                            {MILITARY_STRENGTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs text-zinc-400 mb-1">Territory Controlled</label>
                        <textarea
                          value={gov.territory_controlled || ""}
                          onChange={(e) => {
                            const updated = [...governments];
                            updated[idx].territory_controlled = e.target.value;
                            setGovernments(updated);
                          }}
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          placeholder="Describe territory..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!gov.name.trim()) {
                              alert("Name is required");
                              return;
                            }
                            try {
                              const res = await fetch("/api/world/eras", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  type: "government",
                                  eraId: Number(eraId),
                                  id: gov.id,
                                  data: gov
                                })
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                              alert(gov.id ? "Government updated!" : "Government added!");
                            } catch (e: any) {
                              alert(`Failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          {gov.id ? "Update" : "Save"}
                        </button>
                        <button
                          onClick={async () => {
                            if (!gov.id) {
                              // Remove unsaved
                              setGovernments(governments.filter((_, i) => i !== idx));
                              return;
                            }
                            if (!confirm("Delete this government?")) return;
                            try {
                              const res = await fetch(`/api/world/eras?type=government&id=${gov.id}`, {
                                method: "DELETE"
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                            } catch (e: any) {
                              alert(`Delete failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trade Routes */}
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Trade Routes ({tradeRoutes.length})</h3>
                <button
                  onClick={() => {
                    setTradeRoutes([...tradeRoutes, {
                      era_id: Number(eraId),
                      name: "",
                      status: "Active",
                      start_point: "",
                      end_point: "",
                      trade_goods: ""
                    }]);
                  }}
                  className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded"
                >
                  + Add Route
                </button>
              </div>

              {tradeRoutes.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No trade routes defined yet</p>
              ) : (
                <div className="space-y-3">
                  {tradeRoutes.map((route, idx) => (
                    <div key={route.id || `new-${idx}`} className="border border-white/10 rounded p-3 bg-black/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Route Name *</label>
                          <input
                            type="text"
                            value={route.name}
                            onChange={(e) => {
                              const updated = [...tradeRoutes];
                              updated[idx].name = e.target.value;
                              setTradeRoutes(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., Silk Road"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Status</label>
                          <select
                            value={route.status}
                            onChange={(e) => {
                              const updated = [...tradeRoutes];
                              updated[idx].status = e.target.value;
                              setTradeRoutes(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          >
                            {TRADE_ROUTE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Start Point</label>
                          <input
                            type="text"
                            value={route.start_point || ""}
                            onChange={(e) => {
                              const updated = [...tradeRoutes];
                              updated[idx].start_point = e.target.value;
                              setTradeRoutes(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., Port City"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">End Point</label>
                          <input
                            type="text"
                            value={route.end_point || ""}
                            onChange={(e) => {
                              const updated = [...tradeRoutes];
                              updated[idx].end_point = e.target.value;
                              setTradeRoutes(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., Mountain Keep"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs text-zinc-400 mb-1">Trade Goods</label>
                        <input
                          type="text"
                          value={route.trade_goods || ""}
                          onChange={(e) => {
                            const updated = [...tradeRoutes];
                            updated[idx].trade_goods = e.target.value;
                            setTradeRoutes(updated);
                          }}
                          className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          placeholder="e.g., Spices, Silk, Iron"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!route.name.trim()) {
                              alert("Route name is required");
                              return;
                            }
                            try {
                              const res = await fetch("/api/world/eras", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  type: "tradeRoute",
                                  eraId: Number(eraId),
                                  id: route.id,
                                  data: route
                                })
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                              alert(route.id ? "Route updated!" : "Route added!");
                            } catch (e: any) {
                              alert(`Failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          {route.id ? "Update" : "Save"}
                        </button>
                        <button
                          onClick={async () => {
                            if (!route.id) {
                              setTradeRoutes(tradeRoutes.filter((_, i) => i !== idx));
                              return;
                            }
                            if (!confirm("Delete this trade route?")) return;
                            try {
                              const res = await fetch(`/api/world/eras?type=tradeRoute&id=${route.id}`, {
                                method: "DELETE"
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                            } catch (e: any) {
                              alert(`Delete failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Economic Conditions */}
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Economic Conditions ({economicConditions.length})</h3>
                <button
                  onClick={() => {
                    setEconomicConditions([...economicConditions, {
                      era_id: Number(eraId),
                      condition_type: "Boom",
                      description: "",
                      affected_regions: ""
                    }]);
                  }}
                  className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded"
                >
                  + Add Condition
                </button>
              </div>

              {economicConditions.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No economic conditions defined yet</p>
              ) : (
                <div className="space-y-3">
                  {economicConditions.map((cond, idx) => (
                    <div key={cond.id || `new-${idx}`} className="border border-white/10 rounded p-3 bg-black/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Type</label>
                          <select
                            value={cond.condition_type}
                            onChange={(e) => {
                              const updated = [...economicConditions];
                              updated[idx].condition_type = e.target.value;
                              setEconomicConditions(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          >
                            {ECONOMIC_CONDITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Affected Regions</label>
                          <input
                            type="text"
                            value={cond.affected_regions || ""}
                            onChange={(e) => {
                              const updated = [...economicConditions];
                              updated[idx].affected_regions = e.target.value;
                              setEconomicConditions(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., Northern Territories"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs text-zinc-400 mb-1">Description</label>
                        <textarea
                          value={cond.description || ""}
                          onChange={(e) => {
                            const updated = [...economicConditions];
                            updated[idx].description = e.target.value;
                            setEconomicConditions(updated);
                          }}
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          placeholder="Describe the condition..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/world/eras", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  type: "economicCondition",
                                  eraId: Number(eraId),
                                  id: cond.id,
                                  data: cond
                                })
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                              alert(cond.id ? "Condition updated!" : "Condition added!");
                            } catch (e: any) {
                              alert(`Failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          {cond.id ? "Update" : "Save"}
                        </button>
                        <button
                          onClick={async () => {
                            if (!cond.id) {
                              setEconomicConditions(economicConditions.filter((_, i) => i !== idx));
                              return;
                            }
                            if (!confirm("Delete this condition?")) return;
                            try {
                              const res = await fetch(`/api/world/eras?type=economicCondition&id=${cond.id}`, {
                                method: "DELETE"
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                            } catch (e: any) {
                              alert(`Delete failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Catalogs */}
        {tab === "catalogs" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Era Catalogs</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Filter from World catalogs. Settings will inherit from these selections. 
              <span className="block mt-2 text-xs text-yellow-400">
                ⚠️ These catalog management features will be implemented once World catalogs (Races, Creatures, Languages, Deities, Factions, Organizations) 
                are fully developed. The database tables are ready and waiting.
              </span>
            </p>

            <div className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Races in this Era</h3>
                <p className="text-sm text-zinc-400">
                  Future: Status matrix (Present/Uncommon/Rare/Banned/Extinct/Legend-only) with filtering from World races catalog. 
                  Table: <code className="text-xs bg-black/40 px-1 rounded">era_catalog_races</code>
                </p>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Creatures in this Era</h3>
                <p className="text-sm text-zinc-400">
                  Future: Status matrix with danger modifiers, migration trends, seasonal windows, and law protections. 
                  Table: <code className="text-xs bg-black/40 px-1 rounded">era_catalog_creatures</code>
                </p>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Languages in this Era</h3>
                <p className="text-sm text-zinc-400">
                  Future: Checklist from World languages with prevalence tracking. 
                  Table: <code className="text-xs bg-black/40 px-1 rounded">era_catalog_languages</code>
                </p>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Deities in this Era</h3>
                <p className="text-sm text-zinc-400">
                  Future: Influence matrix (Low/Medium/High/Dominant) with regional variations. 
                  Table: <code className="text-xs bg-black/40 px-1 rounded">era_catalog_deities</code>
                </p>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Factions in this Era</h3>
                <p className="text-sm text-zinc-400">
                  Future: Posture tracking (Aggressive/Covert/Stagnant/Growing/Fragmenting) with regional presence. 
                  Table: <code className="text-xs bg-black/40 px-1 rounded">era_catalog_factions</code>
                </p>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Organizations in this Era</h3>
                <p className="text-sm text-zinc-400">
                  Future: Activity level and leadership tracking with membership notes. 
                  Table: <code className="text-xs bg-black/40 px-1 rounded">era_catalog_organizations</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Economy & Regions */}
        {tab === "economy" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Economy & Regions</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Define regions/kingdoms with their own currency systems. Remember: 1 Credit always = 1 Credit across all systems.
            </p>

            {/* Regions/Kingdoms */}
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Regions/Kingdoms ({regions.length})</h3>
                <button
                  onClick={() => {
                    setRegions([...regions, {
                      era_id: Number(eraId),
                      name: "",
                      kind: "Region",
                      parent_govt: "",
                      currency_rule: "Custom",
                      local_coins: ""
                    }]);
                  }}
                  className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded"
                >
                  + Add Region/Kingdom
                </button>
              </div>

              {regions.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No regions defined yet. Add one to start building currencies.</p>
              ) : (
                <div className="space-y-4">
                  {regions.map((region, regionIdx) => {
                    const regionCurrencies = currencies.filter(c => c.region_id === region.id);
                    return (
                      <div key={region.id || `new-region-${regionIdx}`} className="border border-white/10 rounded-lg p-4 bg-black/30">
                        {/* Region Header */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Name *</label>
                            <input
                              type="text"
                              value={region.name}
                              onChange={(e) => {
                                const updated = [...regions];
                                updated[regionIdx].name = e.target.value;
                                setRegions(updated);
                              }}
                              className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="e.g., Kingdom of Aldor"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Type</label>
                            <select
                              value={region.kind}
                              onChange={(e) => {
                                const updated = [...regions];
                                updated[regionIdx].kind = e.target.value;
                                setRegions(updated);
                              }}
                              className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            >
                              {REGION_KIND_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Parent Government</label>
                            <input
                              type="text"
                              value={region.parent_govt || ""}
                              onChange={(e) => {
                                const updated = [...regions];
                                updated[regionIdx].parent_govt = e.target.value;
                                setRegions(updated);
                              }}
                              className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        {/* Region Actions */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={async () => {
                              if (!region.name.trim()) {
                                alert("Region name is required");
                                return;
                              }
                              try {
                                const res = await fetch("/api/world/eras", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    type: "region",
                                    eraId: Number(eraId),
                                    id: region.id,
                                    data: region
                                  })
                                });
                                const data = await res.json();
                                if (!data.ok) throw new Error(data.error);
                                await loadEra();
                                alert(region.id ? "Region updated!" : "Region saved!");
                              } catch (e: any) {
                                alert(`Failed: ${e.message}`);
                              }
                            }}
                            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                          >
                            {region.id ? "Update Region" : "Save Region"}
                          </button>
                          <button
                            onClick={async () => {
                              if (!region.id) {
                                setRegions(regions.filter((_, i) => i !== regionIdx));
                                return;
                              }
                              if (!confirm("Delete this region and all its currencies?")) return;
                              try {
                                const res = await fetch(`/api/world/eras?type=region&id=${region.id}`, {
                                  method: "DELETE"
                                });
                                const data = await res.json();
                                if (!data.ok) throw new Error(data.error);
                                await loadEra();
                              } catch (e: any) {
                                alert(`Delete failed: ${e.message}`);
                              }
                            }}
                            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            Delete Region
                          </button>
                        </div>

                        {/* Currency System for this Region */}
                        {region.id ? (
                          <div className="border-t border-white/10 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-white">Currency System ({regionCurrencies.length} coins)</h4>
                              <button
                                onClick={() => {
                                  setCurrencies([...currencies, {
                                    era_id: Number(eraId),
                                    region_id: region.id || null,
                                    coin_name: "",
                                    value_in_credits: 1
                                  }]);
                                }}
                                className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded"
                              >
                                + Add Coin
                              </button>
                            </div>
                            <p className="text-xs text-zinc-500 mb-3">
                              Define coins and their credit values. Example: 1 Gold = 1 Credit, 1 Silver = 0.1 Credits, 1 Copper = 0.01 Credits
                            </p>

                            {regionCurrencies.length === 0 ? (
                              <p className="text-xs text-zinc-500 italic">No currency defined for this region yet</p>
                            ) : (
                              <div className="space-y-2">
                                {regionCurrencies.map((curr, currIdx) => {
                                  const globalIdx = currencies.findIndex(c => c.id === curr.id || (c === curr));
                                  return (
                                    <div key={curr.id || `new-curr-${currIdx}`} className="flex items-center gap-2 border border-white/5 rounded p-2 bg-black/20">
                                      <div className="flex-1">
                                        <input
                                          type="text"
                                          value={curr.coin_name}
                                          onChange={(e) => {
                                            const updated = [...currencies];
                                            updated[globalIdx].coin_name = e.target.value;
                                            setCurrencies(updated);
                                          }}
                                          className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white"
                                          placeholder="Coin name (e.g., Gold Piece)"
                                        />
                                      </div>
                                      <div className="w-28">
                                        <input
                                          type="number"
                                          value={curr.value_in_credits}
                                          onChange={(e) => {
                                            const updated = [...currencies];
                                            updated[globalIdx].value_in_credits = Number(e.target.value);
                                            setCurrencies(updated);
                                          }}
                                          className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white"
                                          placeholder="Credits"
                                          min="0.001"
                                          step="0.001"
                                        />
                                      </div>
                                      <span className="text-xs text-zinc-500">= Credits</span>
                                      <button
                                        onClick={async () => {
                                          if (!curr.coin_name.trim()) {
                                            alert("Coin name is required");
                                            return;
                                          }
                                          try {
                                            const res = await fetch("/api/world/eras", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                type: "currency",
                                                eraId: Number(eraId),
                                                id: curr.id,
                                                data: { ...curr, region_id: region.id }
                                              })
                                            });
                                            const data = await res.json();
                                            if (!data.ok) throw new Error(data.error);
                                            await loadEra();
                                            alert(curr.id ? "Coin updated!" : "Coin added!");
                                          } catch (e: any) {
                                            alert(`Failed: ${e.message}`);
                                          }
                                        }}
                                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                                      >
                                        {curr.id ? "Update" : "Save"}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (!curr.id) {
                                            setCurrencies(currencies.filter((_, i) => i !== globalIdx));
                                            return;
                                          }
                                          if (!confirm("Delete this coin?")) return;
                                          try {
                                            const res = await fetch(`/api/world/eras?type=currency&id=${curr.id}`, {
                                              method: "DELETE"
                                            });
                                            const data = await res.json();
                                            if (!data.ok) throw new Error(data.error);
                                            await loadEra();
                                          } catch (e: any) {
                                            alert(`Delete failed: ${e.message}`);
                                          }
                                        }}
                                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-zinc-500 italic">Save the region first to add currencies</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Catalyst Events */}
        {tab === "catalysts" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Catalyst Events (Markers)</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Major events that drive Setting kick-offs and campaign clocks.
            </p>

            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Catalysts ({catalysts.length})</h3>
                <button
                  onClick={() => {
                    setCatalysts([...catalysts, {
                      era_id: Number(eraId),
                      title: "",
                      catalyst_type: "Discovery",
                      start_date_year: null,
                      start_date_month: null,
                      start_date_day: null,
                      end_date_year: null,
                      end_date_month: null,
                      end_date_day: null,
                      player_visible: true,
                      short_summary: "",
                      full_notes: "",
                      impacts: "",
                      mechanical_tags: "",
                      ripple_effects: "",
                      anniversary_date: "",
                      related_catalysts: "",
                      settlement_reactions: "",
                      attachment_url: ""
                    }]);
                  }}
                  className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded"
                >
                  + Add Catalyst
                </button>
              </div>

              {catalysts.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No catalyst events defined yet</p>
              ) : (
                <div className="space-y-4">
                  {catalysts.map((cat, idx) => (
                    <div key={cat.id || `new-${idx}`} className="border border-white/10 rounded p-4 bg-black/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Title *</label>
                          <input
                            type="text"
                            value={cat.title}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].title = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., The Great Awakening"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Type</label>
                          <select
                            value={cat.catalyst_type}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].catalyst_type = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          >
                            {CATALYST_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
                        <div className="col-span-2 md:col-span-3">
                          <label className="block text-xs text-zinc-400 mb-1">Start Date (Year/Month/Day)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={cat.start_date_year || ""}
                              onChange={(e) => {
                                const updated = [...catalysts];
                                updated[idx].start_date_year = e.target.value ? Number(e.target.value) : null;
                                setCatalysts(updated);
                              }}
                              className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="Year"
                            />
                            <input
                              type="number"
                              value={cat.start_date_month || ""}
                              onChange={(e) => {
                                const updated = [...catalysts];
                                updated[idx].start_date_month = e.target.value ? Number(e.target.value) : null;
                                setCatalysts(updated);
                              }}
                              className="w-20 px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="Mo"
                              min="1"
                              max="12"
                            />
                            <input
                              type="number"
                              value={cat.start_date_day || ""}
                              onChange={(e) => {
                                const updated = [...catalysts];
                                updated[idx].start_date_day = e.target.value ? Number(e.target.value) : null;
                                setCatalysts(updated);
                              }}
                              className="w-20 px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="Day"
                              min="1"
                              max="31"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <label className="block text-xs text-zinc-400 mb-1">End Date (Optional)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={cat.end_date_year || ""}
                              onChange={(e) => {
                                const updated = [...catalysts];
                                updated[idx].end_date_year = e.target.value ? Number(e.target.value) : null;
                                setCatalysts(updated);
                              }}
                              className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="Year"
                            />
                            <input
                              type="number"
                              value={cat.end_date_month || ""}
                              onChange={(e) => {
                                const updated = [...catalysts];
                                updated[idx].end_date_month = e.target.value ? Number(e.target.value) : null;
                                setCatalysts(updated);
                              }}
                              className="w-20 px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="Mo"
                              min="1"
                              max="12"
                            />
                            <input
                              type="number"
                              value={cat.end_date_day || ""}
                              onChange={(e) => {
                                const updated = [...catalysts];
                                updated[idx].end_date_day = e.target.value ? Number(e.target.value) : null;
                                setCatalysts(updated);
                              }}
                              className="w-20 px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                              placeholder="Day"
                              min="1"
                              max="31"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center gap-2 text-xs text-zinc-400">
                          <input
                            type="checkbox"
                            checked={cat.player_visible}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].player_visible = e.target.checked;
                              setCatalysts(updated);
                            }}
                            className="rounded"
                          />
                          Player Visible
                        </label>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs text-zinc-400 mb-1">Short Summary</label>
                        <input
                          type="text"
                          value={cat.short_summary || ""}
                          onChange={(e) => {
                            const updated = [...catalysts];
                            updated[idx].short_summary = e.target.value;
                            setCatalysts(updated);
                          }}
                          className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          placeholder="Brief description for timeline..."
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs text-zinc-400 mb-1">Full Notes (GM Only)</label>
                        <textarea
                          value={cat.full_notes || ""}
                          onChange={(e) => {
                            const updated = [...catalysts];
                            updated[idx].full_notes = e.target.value;
                            setCatalysts(updated);
                          }}
                          rows={3}
                          className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          placeholder="Detailed notes, secrets, context..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Impacts (Regions/Factions/etc.)</label>
                          <input
                            type="text"
                            value={cat.impacts || ""}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].impacts = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="Comma-separated tags"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Mechanical Tags</label>
                          <input
                            type="text"
                            value={cat.mechanical_tags || ""}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].mechanical_tags = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., +2 to diplomacy checks"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Ripple Effects</label>
                          <input
                            type="text"
                            value={cat.ripple_effects || ""}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].ripple_effects = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="Long-term consequences..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Anniversary Date</label>
                          <input
                            type="text"
                            value={cat.anniversary_date || ""}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].anniversary_date = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="e.g., 3rd of Harvest Moon"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Related Catalysts</label>
                          <input
                            type="text"
                            value={cat.related_catalysts || ""}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].related_catalysts = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="IDs or names, comma-separated"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Attachment URL</label>
                          <input
                            type="text"
                            value={cat.attachment_url || ""}
                            onChange={(e) => {
                              const updated = [...catalysts];
                              updated[idx].attachment_url = e.target.value;
                              setCatalysts(updated);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                            placeholder="Link to map, image, etc."
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs text-zinc-400 mb-1">Settlement Reactions</label>
                        <textarea
                          value={cat.settlement_reactions || ""}
                          onChange={(e) => {
                            const updated = [...catalysts];
                            updated[idx].settlement_reactions = e.target.value;
                            setCatalysts(updated);
                          }}
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded text-white"
                          placeholder="How different settlements or factions reacted..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!cat.title.trim()) {
                              alert("Title is required");
                              return;
                            }
                            try {
                              const res = await fetch("/api/world/eras", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  type: "catalyst",
                                  eraId: Number(eraId),
                                  id: cat.id,
                                  data: cat
                                })
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                              alert(cat.id ? "Catalyst updated!" : "Catalyst added!");
                            } catch (e: any) {
                              alert(`Failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          {cat.id ? "Update" : "Save"}
                        </button>
                        <button
                          onClick={async () => {
                            if (!cat.id) {
                              setCatalysts(catalysts.filter((_, i) => i !== idx));
                              return;
                            }
                            if (!confirm("Delete this catalyst?")) return;
                            try {
                              const res = await fetch(`/api/world/eras?type=catalyst&id=${cat.id}`, {
                                method: "DELETE"
                              });
                              const data = await res.json();
                              if (!data.ok) throw new Error(data.error);
                              await loadEra();
                            } catch (e: any) {
                              alert(`Delete failed: ${e.message}`);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Save Button (sticky bottom) */}
      <div className="max-w-7xl mx-auto mt-6 flex justify-end">
        <button
          onClick={saveEra}
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors font-medium"
        >
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </main>
  );
}
