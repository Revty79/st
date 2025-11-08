"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Import form components
import BasicInfoForm, { BasicInfoData } from "@/components/worldbuilder/world-details/BasicInfoForm";
import AstralBodiesForm, { AstralBodiesData } from "@/components/worldbuilder/world-details/AstralBodiesForm";
import TimeCalendarForm, { TimeCalendarData } from "@/components/worldbuilder/world-details/TimeCalendarForm";
import PlanetProfileForm, { PlanetProfileData } from "@/components/worldbuilder/world-details/PlanetProfileForm";
import MagicModelForm, { MagicModelData } from "@/components/worldbuilder/world-details/MagicModelForm";
import GeographyFoundationForm, { GeographyFoundationData } from "@/components/worldbuilder/world-details/GeographyFoundationForm";
import TechnologyWindowForm, { TechnologyWindowData } from "@/components/worldbuilder/world-details/TechnologyWindowForm";
import ToneCanonForm, { ToneCanonData } from "@/components/worldbuilder/world-details/ToneCanonForm";
import CosmologyRealmsForm, { CosmologyRealmsData } from "@/components/worldbuilder/world-details/CosmologyRealmsForm";
import MasterCatalogsForm, { MasterCatalogsData } from "@/components/worldbuilder/world-details/MasterCatalogsForm";

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
const NavigationTabs = ({ currentSection, onSectionChange }: {
  currentSection: string;
  onSectionChange: (section: string) => void;
}) => {
  const sections = [
    { id: "basic", label: "Basic Info", icon: "📋" },
    { id: "astral", label: "Astral Bodies", icon: "☀️" },
    { id: "time", label: "Time & Calendar", icon: "📅" },
    { id: "planet", label: "Planet Profile", icon: "🌍" },
    { id: "geography", label: "Geography", icon: "🏔️" },
    { id: "magic", label: "Magic Model", icon: "✨" },
    { id: "technology", label: "Technology", icon: "⚙️" },
    { id: "tone", label: "Tone & Canon", icon: "📜" },
    { id: "cosmology", label: "Cosmology", icon: "🌌" },
    { id: "catalogs", label: "Master Catalogs", icon: "📚" }
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
                  : "border-transparent text-zinc-300 hover:text-zinc-100 hover:border-white/30"
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
const SaveIndicator = ({ isSaving, lastSaved }: {
  isSaving: boolean;
  lastSaved: Date | null;
}) => {
  if (isSaving) {
    return (
      <div className="flex items-center text-amber-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent mr-2"></div>
        <span className="text-sm">Saving...</span>
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

// Main data interface combining all form data
interface WorldDetailsData {
  basic: BasicInfoData;
  astral: AstralBodiesData;
  time: TimeCalendarData;
  planet: PlanetProfileData;
  magic: MagicModelData;
  geography: GeographyFoundationData;
  technology: TechnologyWindowData;
  tone: ToneCanonData;
  cosmology: CosmologyRealmsData;
  catalogs: MasterCatalogsData;
}

export default function WorldDetailsPage() {
  const searchParams = useSearchParams();
  const worldId = searchParams.get("worldId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSection, setCurrentSection] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [worldName, setWorldName] = useState("");

  const [data, setData] = useState<WorldDetailsData>({
    basic: { name: "", pitch: "", tags: [] },
    astral: { sunsCount: 1, moons: [] },
    time: { dayHours: null, yearDays: null, months: [], weekdays: [], leapRule: "" },
    planet: { 
      planetType: "Terrestrial", 
      planetTypeNote: "", 
      sizeClass: "", 
      gravityVsEarth: null, 
      waterPct: null, 
      climateBands: [], 
      tectonics: "Medium" 
    },
    magic: { 
      magicSystems: [], 
      magicCustoms: [], 
      sourceStatement: "", 
      unbreakableRules: [], 
      corruptionLevel: "Moderate", 
      corruptionNote: "", 
      magicRarity: "Uncommon" 
    },
    geography: {
      worldShape: "",
      worldSize: "",
      continents: [],
      regions: [],
      biomes: [],
      landmarks: [],
      tradeRoutes: [],
      notes: ""
    },
    technology: {
      overallLevel: "",
      availableCategories: [],
      customCategories: [],
      progressionRules: "",
      restrictedTechnologies: [],
      advancementMechanism: "",
      magicTechInteraction: "",
      notes: ""
    },
    tone: {
      toneFlags: [],
      contentRating: "",
      contentWarnings: [],
      narrativeStyle: "",
      customNarrativeStyles: [],
      canonicalRules: [],
      thematicElements: [],
      conflictTypes: [],
      moodAtmosphere: "",
      playerExpectations: "",
      gmGuidance: ""
    },
    cosmology: {
      cosmicStructure: "",
      planesOfExistence: [],
      dimensionalRules: [],
      deities: [],
      afterlifeSystem: "",
      afterlifeRealms: [],
      planarTravel: "",
      cosmicThreats: "",
      universalLaws: "",
      notes: ""
    },
    catalogs: {
      languageFamilies: [],
      currencySystems: [],
      organizations: [],
      commonItems: [],
      organizationTypes: [],
      itemCategories: [],
      rarityLevels: [],
      notes: ""
    }
  });

  // Load world details from API
  useEffect(() => {
    if (!worldId) {
      setError("No world ID provided");
      setLoading(false);
      return;
    }

    const loadWorldDetails = async () => {
      try {
        setLoading(true);
        
        // First get the world name
        const worldResponse = await fetch(`/api/world?id=${worldId}`);
        if (!worldResponse.ok) {
          throw new Error("Failed to fetch world");
        }
        const worldResult = await worldResponse.json();
        if (!worldResult.ok) {
          throw new Error(worldResult.error || "Failed to fetch world");
        }
        setWorldName(worldResult.data.name);

        // Then get the world details
        const detailsResponse = await fetch(`/api/world-details?worldId=${worldId}`);
        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch world details");
        }
        const result = await detailsResponse.json();
        
        if (!result.ok) {
          throw new Error(result.error || "Failed to fetch world details");
        }

        const details = result.data;
        
        // Map API data to our form structure
        setData({
          basic: {
            name: worldResult.data.name,
            pitch: details.pitch || "",
            tags: details.tags || []
          },
          astral: {
            sunsCount: details.suns_count || 1,
            moons: details.moons || []
          },
          time: {
            dayHours: details.day_hours,
            yearDays: details.year_days,
            months: details.months || [],
            weekdays: details.weekdays || [],
            leapRule: details.leap_rule || ""
          },
          planet: {
            planetType: details.planet_type || "Terrestrial",
            planetTypeNote: details.planet_type_note || "",
            sizeClass: details.size_class || "",
            gravityVsEarth: details.gravity_vs_earth,
            waterPct: details.water_pct,
            climateBands: details.climates || [],
            tectonics: details.tectonics || "Medium"
          },
          magic: {
            magicSystems: details.magicSystems || [],
            magicCustoms: details.magicCustoms || [],
            sourceStatement: details.source_statement || "",
            unbreakableRules: details.unbreakables || [],
            corruptionLevel: details.corruption_level || "Moderate",
            corruptionNote: details.corruption_note || "",
            magicRarity: details.magic_rarity || "Uncommon"
          },
          geography: {
            worldShape: details.geography_world_shape || "",
            worldSize: details.geography_world_size || "",
            continents: details.geographyRegions || [],
            regions: details.geographyRegions || [],
            biomes: details.geographyBiomes || [],
            landmarks: details.geographyLandmarks || [],
            tradeRoutes: details.geographyTradeRoutes || [],
            notes: details.geography_notes || ""
          },
          technology: {
            overallLevel: details.tech_from || "",
            availableCategories: details.technologyCategories || [],
            customCategories: details.technologyInnovations || [],
            progressionRules: details.technology_progression || "",
            restrictedTechnologies: details.technologyRestrictions || [],
            advancementMechanism: details.technology_advancement || "",
            magicTechInteraction: details.technology_magic_interaction || "",
            notes: details.technology_notes || ""
          },
          tone: {
            toneFlags: details.toneFlags || [],
            contentRating: details.tone_content_rating || "",
            contentWarnings: details.toneContentWarnings || [],
            narrativeStyle: details.tone_narrative_style || "",
            customNarrativeStyles: details.toneNarrativeStyles || [],
            canonicalRules: details.toneCanonicalRules || [],
            thematicElements: details.toneThematicElements || [],
            conflictTypes: details.tone_conflict_types || [],
            moodAtmosphere: details.tone_mood || "",
            playerExpectations: details.tone_expectations || "",
            gmGuidance: details.tone_guidance || ""
          },
          cosmology: {
            cosmicStructure: details.cosmology_structure || "",
            planesOfExistence: details.cosmologyPlanes || [],
            dimensionalRules: details.cosmologyDimensionalRules || [],
            deities: details.cosmologyDeities || [],
            afterlifeSystem: details.cosmology_afterlife_system || "",
            afterlifeRealms: details.cosmologyAfterlifeRealms || [],
            planarTravel: details.cosmology_planar_travel || "",
            cosmicThreats: details.cosmology_cosmic_threats || "",
            universalLaws: details.cosmology_universal_laws || "",
            notes: details.cosmology_notes || ""
          },
          catalogs: {
            languageFamilies: details.catalogLanguageFamilies || [],
            currencySystems: details.catalogCurrencySystems || [],
            organizations: details.catalogOrganizations || [],
            commonItems: details.catalogCommonItems || [],
            organizationTypes: details.catalogOrganizationTypes || [],
            itemCategories: details.catalogItemCategories || [],
            rarityLevels: details.catalogRarityLevels || [],
            notes: details.catalog_notes || ""
          }
        });

      } catch (err) {
        console.error("Error loading world details:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadWorldDetails();
  }, [worldId]);

  // Auto-save function
  const saveChanges = async (sectionData: any, section: string) => {
    if (!worldId || isSaving) return;

    try {
      setIsSaving(true);

      // Map our form data back to API format
      let updateData: any = { worldId: Number(worldId) };

      if (section === "basic") {
        updateData.op = "updateBasicInfo";
        updateData.pitch = sectionData.pitch;
        // Handle world name update separately via world API
        if (sectionData.name !== worldName) {
          const worldUpdateResponse = await fetch("/api/world", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateWorld",
              id: Number(worldId),
              name: sectionData.name
            })
          });
          if (worldUpdateResponse.ok) {
            setWorldName(sectionData.name);
          }
        }
        // Handle tags update
        if (JSON.stringify(sectionData.tags) !== JSON.stringify(data.basic.tags)) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateTags",
              worldId: Number(worldId),
              tags: sectionData.tags
            })
          });
        }
      } else if (section === "astral") {
        updateData.op = "updateBasicInfo";
        updateData.sunsCount = sectionData.sunsCount;
        // Handle moons separately
        if (JSON.stringify(sectionData.moons) !== JSON.stringify(data.astral.moons)) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateMoons",
              worldId: Number(worldId),
              moons: sectionData.moons
            })
          });
        }
      } else if (section === "time") {
        updateData.op = "updateBasicInfo";
        updateData.dayHours = sectionData.dayHours;
        updateData.yearDays = sectionData.yearDays;
        updateData.leapRule = sectionData.leapRule;
        // TODO: Handle months and weekdays updates
      } else if (section === "planet") {
        updateData.op = "updateBasicInfo";
        updateData.planetType = sectionData.planetType;
        updateData.planetTypeNote = sectionData.planetTypeNote;
        updateData.sizeClass = sectionData.sizeClass;
        updateData.gravityVsEarth = sectionData.gravityVsEarth;
        updateData.waterPct = sectionData.waterPct;
        updateData.tectonics = sectionData.tectonics;
        // TODO: Handle climate bands
      } else if (section === "magic") {
        updateData.op = "updateBasicInfo";
        updateData.sourceStatement = sectionData.sourceStatement;
        updateData.corruptionLevel = sectionData.corruptionLevel;
        updateData.corruptionNote = sectionData.corruptionNote;
        updateData.magicRarity = sectionData.magicRarity;
        // TODO: Handle magic systems and unbreakable rules
      } else if (section === "geography") {
        updateData.op = "updateBasicInfo";
        updateData.geographyNotes = sectionData.notes;
        
        // Handle geography data updates separately
        if (sectionData.regions && sectionData.regions.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateGeographyRegions",
              worldId: Number(worldId),
              regions: sectionData.regions
            })
          });
        }
        
        if (sectionData.biomes && sectionData.biomes.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateGeographyBiomes", 
              worldId: Number(worldId),
              biomes: sectionData.biomes
            })
          });
        }
        
        if (sectionData.landmarks && sectionData.landmarks.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateGeographyLandmarks",
              worldId: Number(worldId),
              landmarks: sectionData.landmarks
            })
          });
        }
        
        if (sectionData.tradeRoutes && sectionData.tradeRoutes.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateGeographyTradeRoutes",
              worldId: Number(worldId),
              tradeRoutes: sectionData.tradeRoutes
            })
          });
        }
      } else if (section === "technology") {
        updateData.op = "updateBasicInfo";
        updateData.technologyNotes = sectionData.notes;
        
        // Handle technology data updates separately
        if (sectionData.customCategories && sectionData.customCategories.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateTechnologyCategories",
              worldId: Number(worldId),
              categories: sectionData.customCategories
            })
          });
        }
      } else if (section === "tone") {
        updateData.op = "updateBasicInfo";
        updateData.toneCanonNotes = sectionData.notes;
        
        // Handle tone & canon data updates separately
        if (sectionData.canonicalRules && sectionData.canonicalRules.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateToneCanonicalRules",
              worldId: Number(worldId),
              rules: sectionData.canonicalRules
            })
          });
        }
      } else if (section === "cosmology") {
        updateData.op = "updateBasicInfo";
        updateData.cosmologyStructure = sectionData.cosmicStructure;
        updateData.cosmologyAfterlifeSystem = sectionData.afterlifeSystem;
        updateData.cosmologyPlanarTravel = sectionData.planarTravel;
        updateData.cosmologyCosmicThreats = sectionData.cosmicThreats;
        updateData.cosmologyUniversalLaws = sectionData.universalLaws;
        updateData.cosmologyNotes = sectionData.notes;
        
        // Handle cosmology data updates separately
        if (sectionData.planesOfExistence && sectionData.planesOfExistence.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCosmologyPlanes",
              worldId: Number(worldId),
              planes: sectionData.planesOfExistence
            })
          });
        }
        
        if (sectionData.dimensionalRules && sectionData.dimensionalRules.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCosmologyDimensionalRules",
              worldId: Number(worldId),
              dimensionalRules: sectionData.dimensionalRules
            })
          });
        }
        
        if (sectionData.deities && sectionData.deities.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCosmologyDeities",
              worldId: Number(worldId),
              deities: sectionData.deities
            })
          });
        }
        
        if (sectionData.afterlifeRealms && sectionData.afterlifeRealms.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCosmologyAfterlifeRealms",
              worldId: Number(worldId),
              afterlifeRealms: sectionData.afterlifeRealms
            })
          });
        }
      } else if (section === "catalogs") {
        updateData.op = "updateBasicInfo";
        updateData.catalogNotes = sectionData.notes;
        
        // Handle catalog data updates separately
        if (sectionData.languageFamilies && sectionData.languageFamilies.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCatalogLanguageFamilies",
              worldId: Number(worldId),
              languageFamilies: sectionData.languageFamilies
            })
          });
        }
        
        if (sectionData.currencySystems && sectionData.currencySystems.length > 0) {
          await fetch("/api/world-details", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCatalogCurrencySystems",
              worldId: Number(worldId),
              currencySystems: sectionData.currencySystems
            })
          });
        }
        
        if (sectionData.organizations && sectionData.organizations.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCatalogOrganizations",
              worldId: Number(worldId),
              organizations: sectionData.organizations
            })
          });
        }
        
        if (sectionData.commonItems && sectionData.commonItems.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCatalogCommonItems",
              worldId: Number(worldId),
              commonItems: sectionData.commonItems
            })
          });
        }
        
        // Handle configuration updates
        if (sectionData.organizationTypes && sectionData.organizationTypes.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCatalogOrganizationTypes",
              worldId: Number(worldId),
              organizationTypes: sectionData.organizationTypes
            })
          });
        }
        
        if (sectionData.itemCategories && sectionData.itemCategories.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCatalogItemCategories",
              worldId: Number(worldId),
              itemCategories: sectionData.itemCategories
            })
          });
        }
        
        if (sectionData.rarityLevels && sectionData.rarityLevels.length > 0) {
          await fetch("/api/world-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              op: "updateCatalogRarityLevels",
              worldId: Number(worldId),
              rarityLevels: sectionData.rarityLevels
            })
          });
        }
      }

      // Only make API call if there are basic updates
      if (Object.keys(updateData).length > 2) {
        const response = await fetch("/api/world-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error("Error saving:", err);
      // TODO: Show error notification
    } finally {
      setIsSaving(false);
    }
  };

  // Update handlers for each section
  const updateBasicInfo = (updates: Partial<BasicInfoData>) => {
    const newData = { ...data.basic, ...updates };
    setData(prev => ({ ...prev, basic: newData }));
    saveChanges(newData, "basic");
  };

  const updateAstralBodies = (updates: Partial<AstralBodiesData>) => {
    const newData = { ...data.astral, ...updates };
    setData(prev => ({ ...prev, astral: newData }));
    saveChanges(newData, "astral");
  };

  const updateTimeCalendar = (updates: Partial<TimeCalendarData>) => {
    const newData = { ...data.time, ...updates };
    setData(prev => ({ ...prev, time: newData }));
    saveChanges(newData, "time");
  };

  const updatePlanetProfile = (updates: Partial<PlanetProfileData>) => {
    const newData = { ...data.planet, ...updates };
    setData(prev => ({ ...prev, planet: newData }));
    saveChanges(newData, "planet");
  };

  const updateMagicModel = (updates: Partial<MagicModelData>) => {
    const newData = { ...data.magic, ...updates };
    setData(prev => ({ ...prev, magic: newData }));
    saveChanges(newData, "magic");
  };

  const updateGeographyFoundation = (updates: Partial<GeographyFoundationData>) => {
    const newData = { ...data.geography, ...updates };
    setData(prev => ({ ...prev, geography: newData }));
    saveChanges(newData, "geography");
  };

  const updateTechnologyWindow = (updates: Partial<TechnologyWindowData>) => {
    const newData = { ...data.technology, ...updates };
    setData(prev => ({ ...prev, technology: newData }));
    saveChanges(newData, "technology");
  };

  const updateToneCanon = (updates: Partial<ToneCanonData>) => {
    const newData = { ...data.tone, ...updates };
    setData(prev => ({ ...prev, tone: newData }));
    saveChanges(newData, "tone");
  };

  const updateCosmologyRealms = (updates: Partial<CosmologyRealmsData>) => {
    const newData = { ...data.cosmology, ...updates };
    setData(prev => ({ ...prev, cosmology: newData }));
    saveChanges(newData, "cosmology");
  };

  const updateMasterCatalogs = (updates: Partial<MasterCatalogsData>) => {
    const newData = { ...data.catalogs, ...updates };
    setData(prev => ({ ...prev, catalogs: newData }));
    saveChanges(newData, "catalogs");
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="min-h-screen px-4 md:px-8 py-8 space-y-6 max-w-6xl mx-auto"
      style={{ overflowAnchor: "none" as any }}
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-evanescent st-title-gradient text-4xl sm:text-5xl tracking-tight">
            World Details: {worldName}
          </h1>
          <p className="text-zinc-300 text-sm mt-2">
            Configure the comprehensive foundation of your world according to the new outline
          </p>
        </div>
        <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      </header>

      {/* Navigation */}
      <NavigationTabs 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />

      {/* Content */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-sm p-6">
        {currentSection === "basic" && (
          <BasicInfoForm data={data.basic} onUpdate={updateBasicInfo} />
        )}
        {currentSection === "astral" && (
          <AstralBodiesForm data={data.astral} onUpdate={updateAstralBodies} />
        )}
        {currentSection === "time" && (
          <TimeCalendarForm data={data.time} onUpdate={updateTimeCalendar} />
        )}
        {currentSection === "planet" && (
          <PlanetProfileForm data={data.planet} onUpdate={updatePlanetProfile} />
        )}
        {currentSection === "magic" && (
          <MagicModelForm data={data.magic} onUpdate={updateMagicModel} />
        )}
        {currentSection === "geography" && (
          <GeographyFoundationForm data={data.geography} onUpdate={updateGeographyFoundation} />
        )}
        {currentSection === "technology" && (
          <TechnologyWindowForm data={data.technology} onUpdate={updateTechnologyWindow} />
        )}
        {currentSection === "tone" && (
          <ToneCanonForm data={data.tone} onUpdate={updateToneCanon} />
        )}
        {currentSection === "cosmology" && (
          <CosmologyRealmsForm data={data.cosmology} onUpdate={updateCosmologyRealms} />
        )}
        {currentSection === "catalogs" && (
          <MasterCatalogsForm data={data.catalogs} onUpdate={updateMasterCatalogs} />
        )}
      </div>
    </form>
  );
}