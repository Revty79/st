"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Import form components (in MVS fill order)
import FrontMatterForm from "@/components/worldbuilder/setting-details/FrontMatterForm";
import TimeAndPlaceForm from "@/components/worldbuilder/setting-details/TimeAndPlaceForm";
import RegionOverviewForm from "@/components/worldbuilder/setting-details/RegionOverviewForm";
import GeographyAndClimateForm from "@/components/worldbuilder/setting-details/GeographyAndClimateForm";
import BuiltEnvironmentForm from "@/components/worldbuilder/setting-details/BuiltEnvironmentForm";
import PowerFactionsForm from "@/components/worldbuilder/setting-details/PowerFactionsForm";
import { 
  PlacesOfInterestForm,
  CampaignSeedsForm,
  MagicProfileForm,
  RacesBeingsForm,
  CreaturesForm,
  DeitiesBeliefForm,
  RelationsLawForm,
  CurrencyForm 
} from "@/components/worldbuilder/setting-details/PlacesOfInterestForm";

import { SettingsData } from "@/types/settings";

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

// Error component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
      <div className="text-gray-700">{message}</div>
    </div>
  </div>
);

// Navigation tabs component
const NavigationTabs = ({ currentSection, onSectionChange, mvsSections }: {
  currentSection: string;
  onSectionChange: (section: string) => void;
  mvsSections: Set<string>;
}) => {
  // MVS sections (required for publish) come first
  const mvs_sections = [
    { id: "frontmatter", label: "Front Matter", icon: "📋", mvs: true },
    { id: "timeplace", label: "Time & Place", icon: "📅", mvs: true },
    { id: "overview", label: "Region Overview", icon: "🏞️", mvs: true },
    { id: "geography", label: "Geography", icon: "🗺️", mvs: true },
    { id: "builtenvironment", label: "Infrastructure", icon: "🏗️", mvs: true },
    { id: "factions", label: "Power & Factions", icon: "⚔️", mvs: true },
    { id: "places", label: "Places", icon: "🏛️", mvs: true },
    { id: "seeds", label: "Campaign Seeds", icon: "🌱", mvs: true }
  ];

  const advanced_sections = [
    { id: "magic", label: "Magic Profile", icon: "✨", mvs: false },
    { id: "races", label: "Races & Beings", icon: "👥", mvs: false },
    { id: "creatures", label: "Creatures", icon: "🐉", mvs: false },
    { id: "deities", label: "Deities", icon: "⛪", mvs: false },
    { id: "relationslaw", label: "Relations & Law", icon: "⚖️", mvs: false },
    { id: "currency", label: "Currency", icon: "💰", mvs: false }
  ];

  const sections = [...mvs_sections, ...advanced_sections];

  return (
    <div className="border-b border-white/15 bg-white/10 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative ${
                currentSection === section.id
                  ? "border-amber-400 text-amber-100"
                  : "border-transparent text-zinc-100 hover:text-white hover:border-white/30"
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
              {section.mvs && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs px-1 rounded">
                  MVS
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* MVS Progress indicator */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="text-xs text-zinc-400">
          MVS Progress: {mvsSections.size}/8 sections completed
          {mvsSections.size === 8 && (
            <span className="text-green-400 ml-2">✓ Ready to Publish</span>
          )}
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

export default function SettingDetailsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SettingDetailsContent />
    </Suspense>
  );
}

function SettingDetailsContent() {
  const searchParams = useSearchParams();
  const settingId = searchParams.get("settingId");
  const eraId = searchParams.get("eraId");
  const worldId = searchParams.get("worldId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSection, setCurrentSection] = useState("frontmatter");
  const [isSaving, setIsSaving] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settingName, setSettingName] = useState("");
  const [eraName, setEraName] = useState("");
  const [worldName, setWorldName] = useState("");

  // Track which MVS sections are completed
  const [mvsSections, setMvsSections] = useState<Set<string>>(new Set());

  // Era data for inheritance
  const [eraData, setEraData] = useState<any>(null);

  const [data, setData] = useState<SettingsData>({
    frontMatter: {
      name: "",
      summary: "",
      eraAnchor: "",
      regionScope: "city",
      toneWords: [],
      tags: [],
      activeRealms: []
    },
    timeAndPlace: {
      localDateSpan: { start: "", end: "" },
      calendarQuirks: []
    },
    regionOverview: {
      senses: [],
      localValues: { pride: [], shame: [] },
      whyNow: ""
    },
    geographyEnvironment: {
      travelTacticsBullets: [],
      resourcesHazards: [],
      signatureFeatures: []
    },
    builtEnvironment: {
      settlements: [],
      movement: { routes: [], bottleneck: "" },
      utilities: { waterControl: "", powerControl: "", manaControl: "", failureModes: [] }
    },
    powerFactions: {
      activeFactions: [],
      relationshipMap: {},
      monthlySwayActions: {}
    },
    placesOfInterest: {
      sites: []
    },
    campaignSeeds: {
      seeds: []
    },
    magicProfile: {
      systemsInUse: [],
      availabilityNotes: "",
      localTaboos: [],
      corruptionPace: "",
      cosmicEventHooks: []
    },
    racesBeings: {
      raceAvailability: {},
      raceNotes: {}
    },
    creatures: {
      creatureStatus: {},
      regionalAreas: {},
      localModifiers: { encounterDifficulty: "", seasonalWindow: "", lawsProtections: "" }
    },
    deitiesBelief: {
      chosenDeities: {},
      teachingsWorship: {}
    },
    relationsLaw: {
      factionRelations: {},
      governance: {
        whoDecides: "",
        howItReachesStreets: "",
        enforcementStyle: "",
        courts: [],
        fairExample: "",
        unfairExample: ""
      },
      consequencesTable: {}
    },
    currency: {
      resolvedDenominations: {},
      barterQuirks: "",
      currencySlang: {}
    }
  });

  // Load setting details
  useEffect(() => {
    if (!settingId && !worldId) {
      setError("No setting or world ID provided");
      setLoading(false);
      return;
    }

    const loadSettingDetails = async () => {
      try {
        setLoading(true);
        
        // Load Era data first for inheritance
        if (eraId) {
          // TODO: Load actual Era data from API when ready
          const mockEraData = {
            basicInfo: {
              name: "Age of Steel and Steam",
              shortSummary: "An era of technological advancement and industrial growth",
            },
            backdropDefaults: {
              activeRealms: ["material-plane", "shadow-realm"],
              typicalTechLevel: "Industrial Age",
              magicTide: "Low" as const,
              stabilityConflict: "Tense" as const,
              economy: "Boom" as const
            },
            governments: [
              {
                name: "Valerian Empire",
                regionsKingdoms: [
                  {
                    name: "Northern Provinces",
                    kind: "Region" as const,
                    localCurrency: {
                      denominations: [
                        { name: "Gold Crown", valueInWorldAnchor: 10 },
                        { name: "Silver Mark", valueInWorldAnchor: 1 },
                        { name: "Copper Bit", valueInWorldAnchor: 0.1 }
                      ]
                    }
                  }
                ]
              }
            ],
            catalogs: {
              races: [
                { raceId: "human", raceName: "Human", status: "Present" },
                { raceId: "elf", raceName: "Elf", status: "Uncommon" },
                { raceId: "dwarf", raceName: "Dwarf", status: "Present" }
              ],
              creatures: [
                { creatureId: "wolf", creatureName: "Wolf", status: "Present", dangerShift: 0 },
                { creatureId: "dragon", creatureName: "Dragon", status: "Rare", dangerShift: 10 }
              ],
              deities: [
                { deityId: "forge-father", deityName: "The Forge Father", influence: "High" },
                { deityId: "wind-dancer", deityName: "Wind Dancer", influence: "Med" }
              ],
              factions: [
                { factionId: "merchants-guild", factionName: "Merchants Guild", type: "Trade", scope: "Regional", posture: "Growing", oneLineAim: "Control all trade routes" },
                { factionId: "steel-legion", factionName: "Steel Legion", type: "Military", scope: "National", posture: "Aggressive", oneLineAim: "Expand empire borders" }
              ]
            }
          };
          
          setEraData(mockEraData);
          setEraName(mockEraData.basicInfo.name);
          
          // Populate inherited fields in frontMatter
          setData(prev => ({
            ...prev,
            frontMatter: {
              ...prev.frontMatter,
              eraAnchor: mockEraData.basicInfo.name,
              activeRealms: mockEraData.backdropDefaults.activeRealms
            },
            // Populate resolved currency from Era
            currency: {
              resolvedDenominations: mockEraData.governments[0]?.regionsKingdoms[0]?.localCurrency.denominations.reduce((acc: any, denom: any) => {
                acc[denom.name] = denom.valueInWorldAnchor;
                return acc;
              }, {}),
              barterQuirks: "",
              currencySlang: {}
            }
          }));
        }
        
        // TODO: Load Setting data if editing existing
        if (settingId) {
          // Load setting-specific data from API
          setSettingName("Sample Setting");
        } else {
          setSettingName("New Setting");
        }
        
        setWorldName("Sample World");
        
        // Set initial MVS progress
        const completedSections = new Set<string>();
        if (data.frontMatter.name) completedSections.add("frontmatter");
        setMvsSections(completedSections);

      } catch (err) {
        console.error("Error loading setting details:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadSettingDetails();
  }, [settingId, worldId]);

  // Auto-save function
  const saveChanges = async (sectionData: any, section: string) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      
      // TODO: Implement API save when ready
      console.log(`Saving ${section}:`, sectionData);
      
      setLastSaved(new Date());
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save function for save buttons
  const manualSave = () => {
    setManualSaving(true);
    console.log("Manual save triggered for Setting data:", data);
    setTimeout(() => {
      setManualSaving(false);
      setLastSaved(new Date());
    }, 800);
  };

  // Update handlers for each section
  const updateSection = (section: keyof SettingsData) => (updates: any) => {
    const newData = { ...data[section], ...updates };
    setData(prev => ({ ...prev, [section]: newData }));
    saveChanges(newData, section);

    // Update MVS progress
    const sectionMap: Record<string, string> = {
      frontMatter: "frontmatter",
      timeAndPlace: "timeplace", 
      regionOverview: "overview",
      geographyEnvironment: "geography",
      builtEnvironment: "builtenvironment",
      powerFactions: "factions",
      placesOfInterest: "places",
      campaignSeeds: "seeds"
    };

    if (sectionMap[section]) {
      const isComplete = checkSectionComplete(section, newData);
      setMvsSections(prev => {
        const newSet = new Set(prev);
        if (isComplete) {
          newSet.add(sectionMap[section]);
        } else {
          newSet.delete(sectionMap[section]);
        }
        return newSet;
      });
    }
  };

  // Check if a section meets MVS requirements
  const checkSectionComplete = (section: keyof SettingsData, sectionData: any): boolean => {
    switch (section) {
      case "frontMatter":
        return !!(sectionData.name && sectionData.summary && sectionData.regionScope);
      case "timeAndPlace":
        return !!(sectionData.localDateSpan.start && sectionData.calendarQuirks.length >= 2);
      case "regionOverview":
        return !!(sectionData.senses.length >= 2 && sectionData.whyNow);
      case "geographyEnvironment":
        return !!(sectionData.travelTacticsBullets.length >= 4 && sectionData.signatureFeatures.length >= 3);
      case "builtEnvironment":
        return !!(sectionData.settlements.length > 0 && sectionData.movement.bottleneck);
      case "powerFactions":
        return !!(sectionData.activeFactions.length >= 5);
      case "placesOfInterest":
        return !!(sectionData.sites.length >= 12);
      case "campaignSeeds":
        return !!(sectionData.seeds.length >= 6);
      default:
        return false;
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div
      className="min-h-screen px-4 md:px-8 py-8 space-y-6 max-w-6xl mx-auto"
      style={{ overflowAnchor: "none" as any }}
    >
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/worldbuilder/worlds"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Worlds</span>
            </Link>
            <div>
              <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
                Setting: {settingName}
              </h1>
              <p className="text-zinc-300 text-sm mt-2">
                {worldName} → {eraName} → {settingName}
              </p>
              <p className="text-zinc-400 text-xs mt-1">
                All changes auto-save when you navigate away from fields
              </p>
            </div>
          </div>
          <SaveIndicator isSaving={isSaving} isManualSaving={manualSaving} lastSaved={lastSaved} />
        </div>
      </header>

      {/* Navigation */}
      <NavigationTabs 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        mvsSections={mvsSections}
      />

      {/* Content */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-sm p-6">
        {currentSection === "frontmatter" && (
          <FrontMatterForm 
            data={data.frontMatter} 
            onUpdate={updateSection("frontMatter")}
            eraData={eraData}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "timeplace" && (
          <TimeAndPlaceForm 
            data={data.timeAndPlace} 
            onUpdate={updateSection("timeAndPlace")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "overview" && (
          <RegionOverviewForm 
            data={data.regionOverview} 
            onUpdate={updateSection("regionOverview")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "geography" && (
          <GeographyAndClimateForm 
            data={data.geographyEnvironment} 
            onUpdate={updateSection("geographyEnvironment")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "builtenvironment" && (
          <BuiltEnvironmentForm 
            data={data.builtEnvironment} 
            onUpdate={updateSection("builtEnvironment")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "factions" && (
          <PowerFactionsForm 
            data={data.powerFactions} 
            onUpdate={updateSection("powerFactions")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "places" && (
          <PlacesOfInterestForm 
            data={data.placesOfInterest} 
            onUpdate={updateSection("placesOfInterest")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "seeds" && (
          <CampaignSeedsForm 
            data={data.campaignSeeds} 
            onUpdate={updateSection("campaignSeeds")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "magic" && (
          <MagicProfileForm 
            data={data.magicProfile} 
            onUpdate={updateSection("magicProfile")} 
            eraData={eraData}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "races" && (
          <RacesBeingsForm 
            data={data.racesBeings} 
            onUpdate={updateSection("racesBeings")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "creatures" && (
          <CreaturesForm 
            data={data.creatures} 
            onUpdate={updateSection("creatures")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "deities" && (
          <DeitiesBeliefForm 
            data={data.deitiesBelief} 
            onUpdate={updateSection("deitiesBelief")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "relationslaw" && (
          <RelationsLawForm 
            data={data.relationsLaw} 
            onUpdate={updateSection("relationsLaw")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
        {currentSection === "currency" && (
          <CurrencyForm 
            data={data.currency} 
            onUpdate={updateSection("currency")}
            onManualSave={manualSave}
            isManualSaving={manualSaving}
          />
        )}
      </div>
    </div>
  );
}