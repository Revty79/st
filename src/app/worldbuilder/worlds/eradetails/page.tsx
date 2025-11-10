"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import EraDetailsForm, { EraDetailsData, EraBasicInfo, EraBackdropDefaults, EraTradeEconomics, EraCatalogs } from "@/components/worldbuilder/world-details/EraDetailsForm";

export default function EraDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldId = searchParams.get("worldId");
  const eraId = searchParams.get("eraId");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [worldRealms, setWorldRealms] = useState<Array<{ id: string; name: string }>>([]);
  
  const [eraData, setEraData] = useState<EraDetailsData>({
    basicInfo: {
      name: "",
      shortSummary: "",
      ongoing: false,
      startDate: { year: "", month: "", day: "" },
      endDate: { year: "", month: "", day: "" },
      transitionIn: "",
      transitionOut: ""
    },
    backdropDefaults: {
      activeRealms: [],
      typicalTechLevel: "",
      magicTide: 'Normal',
      stabilityConflict: 'Peaceful',
      travelSafety: 0,
      economy: 'Stable',
      lawOrder: 'Mixed',
      religiousTemperature: 'Steady',
      rulesStyleNudges: {
        restRecovery: 'Standard',
        difficultyBias: 0
      }
    },
    governments: [],
    tradeEconomics: {
      tradeRoutes: "",
      majorTradeGoods: "",
      crisesBoom: "",
      embargosSanctions: ""
    },
    catalogs: {
      races: [],
      creatures: [],
      languages: [],
      deities: [],
      factions: []
    },
    catalystEvents: [],
    settingStubs: []
  });

  // Load mock world realms (TODO: wire to API later)
  useEffect(() => {
    if (!worldId) return;
    // Mock realms for now
    setWorldRealms([
      { id: "1", name: "Material Plane" },
      { id: "2", name: "Feywild" },
      { id: "3", name: "Shadowfell" },
      { id: "4", name: "Astral Plane" }
    ]);
  }, [worldId]);

  // Load mock era data (TODO: wire to API later)
  useEffect(() => {
    if (!eraId || !worldId) return;
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      // Era data starts with defaults from initial state
      setLoading(false);
    }, 100);
  }, [eraId, worldId]);

  function saveEraData(updates: Partial<EraDetailsData>) {
    setSaving(true);
    // Mock save - just update local state
    const newData = { ...eraData, ...updates };
    setEraData(newData);
    console.log("Era data updated (mock save):", newData);
    setTimeout(() => {
      setSaving(false);
    }, 300);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/worldbuilder/worlds?worldId=${worldId}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Timeline</span>
            </Link>
            <div>
              <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
                {eraData.basicInfo.name || "Era Details"}
              </h1>
              <p className="text-zinc-300 text-sm mt-2">
                Configure this era's timeframe, active realms, governments, and settings
              </p>
            </div>
          </div>
          {saving && (
            <div className="flex items-center text-amber-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent mr-2"></div>
              <span className="text-sm">Saving...</span>
            </div>
          )}
        </div>
      </header>

      {/* Era Details Form */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-sm p-6">
        <EraDetailsForm
          data={eraData}
          onUpdate={saveEraData}
          worldRealms={worldRealms}
        />
      </div>
    </div>
  );
}
