"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import EraDetailsForm, { EraDetailsData, EraBasicInfo, EraBackdropDefaults, EraTradeEconomics, EraCatalogs } from "@/components/worldbuilder/world-details/EraDetailsForm";

// Navigation tabs component
const NavigationTabs = ({ currentSection, onSectionChange }: {
  currentSection: string;
  onSectionChange: (section: string) => void;
}) => {
  const sections = [
    { id: "basic", label: "Basic Info", icon: "📋" },
    { id: "backdrop", label: "Backdrop", icon: "🌍" },
    { id: "governments", label: "Governments", icon: "⚔️" },
    { id: "trade", label: "Trade & Economics", icon: "💰" },
    { id: "catalogs", label: "Era Catalogs", icon: "📚" },
    { id: "events", label: "Catalyst Events", icon: "⚡" },
    { id: "settings", label: "Setting Stubs", icon: "🏛️" }
  ];

  return (
    <div className="border-b border-white/15 bg-white/10 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                currentSection === section.id
                  ? "border-amber-400 text-amber-100"
                  : "border-transparent text-zinc-100 hover:text-white hover:border-white/30"
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Save indicator component
const SaveIndicator = ({ isSaving, isManualSaving, lastSaved }: {
  isSaving: boolean;
  isManualSaving: boolean;
  lastSaved: Date | null;
}) => {
  if (isManualSaving) {
    return (
      <div className="flex items-center text-amber-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent mr-2"></div>
        <span className="text-sm">Saving manually...</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center text-blue-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent mr-2"></div>
        <span className="text-sm">Auto-saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center text-green-400">
        <span className="mr-2">✓</span>
        <span className="text-sm">Saved {lastSaved.toLocaleTimeString()}</span>
      </div>
    );
  }

  return null;
};

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

export default function EraDetailsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EraDetailsContent />
    </Suspense>
  );
}

function EraDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldId = searchParams.get("worldId");
  const eraId = searchParams.get("eraId");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentSection, setCurrentSection] = useState("basic");
  const [worldRealms, setWorldRealms] = useState<Array<{ id: string; name: string }>>([]);
  const [worldContinents, setWorldContinents] = useState<Array<{ name: string; character: string }>>([]);
  
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

  // Load mock world realms and continents (TODO: wire to API later)
  useEffect(() => {
    if (!worldId) return;
    // Mock realms for now
    setWorldRealms([
      { id: "1", name: "Material Plane" },
      { id: "2", name: "Feywild" },
      { id: "3", name: "Shadowfell" },
      { id: "4", name: "Astral Plane" }
    ]);
    // Mock continents from World's Planet Profile
    setWorldContinents([
      { name: "Aurelia", character: "Temperate forests and plains" },
      { name: "Valtor", character: "Mountain ranges and valleys" },
      { name: "Zenithia", character: "Tropical jungles and islands" },
      { name: "Borealis", character: "Frozen tundra and ice caps" }
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
      setLastSaved(new Date());
    }, 300);
  }

  // Manual save function for save buttons
  function manualSave() {
    setManualSaving(true);
    console.log("Manual save triggered for Era data:", eraData);
    setTimeout(() => {
      setManualSaving(false);
      setLastSaved(new Date());
    }, 800);
  }

  // Get section-specific data for saves
  function getSectionData(section: string) {
    switch (section) {
      case "basic":
        return { basicInfo: eraData.basicInfo };
      case "backdrop":
        return { backdropDefaults: eraData.backdropDefaults };
      case "governments":
        return { governments: eraData.governments };
      case "trade":
        return { tradeEconomics: eraData.tradeEconomics };
      case "catalogs":
        return { catalogs: eraData.catalogs };
      case "events":
        return { catalystEvents: eraData.catalystEvents };
      case "settings":
        return { settingStubs: eraData.settingStubs };
      default:
        return eraData;
    }
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
          <SaveIndicator isSaving={saving} isManualSaving={manualSaving} lastSaved={lastSaved} />
        </div>
      </header>

      {/* Navigation */}
      <NavigationTabs 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
      />

      {/* Era Details Form */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-sm p-6">
        <EraDetailsForm
          data={eraData}
          onUpdate={saveEraData}
          worldRealms={worldRealms}
          worldContinents={worldContinents}
          currentSection={currentSection}
          onManualSave={manualSave}
          isManualSaving={manualSaving}
        />
      </div>
    </div>
  );
}
