// Settings Data Types
export interface FrontMatterData {
  name: string;
  summary: string;
  eraAnchor: string; // Display only
  selectedRegion: string; // Region/Kingdom name from Era (replaces manual regionScope)
  selectedGovernment: string; // Government name from Era (for context)
  toneWords: string[]; // 2-3 words
  tags: string[]; // 5-7 tags
  activeRealms: string[]; // Subset of Era realms
}

export interface TimeAndPlaceData {
  localDateSpan: {
    start: string;
    end: string;
  };
  calendarQuirks: string[]; // 2-3 quirks
}

export interface RegionOverviewData {
  senses: string[]; // 2-3 vivid lines
  localValues: {
    pride: string[]; // 1-2 lines
    shame: string[]; // 1-2 lines
  };
  whyNow: string; // ≤180 chars
}

export interface GeographyEnvironmentData {
  travelTacticsBullets: string[]; // 4-7 bullets
  resourcesHazards: Array<{
    resource: string;
    hazard: string;
  }>;
  signatureFeatures: string[]; // 3-5 features
}

export interface BuiltEnvironmentData {
  settlements: Array<{
    name: string;
    role: string;
    populationBand: 'outpost' | 'small' | 'medium' | 'large' | 'metro';
    notable: string;
    risk: string;
    hook: string;
  }>;
  movement: {
    routes: string[]; // Taxed, patrolled, broken routes
    bottleneck: string; // One chokepoint
  };
  utilities: {
    waterControl: string;
    powerControl: string;
    manaControl: string;
    failureModes: string[];
  };
}

export interface PowerFactionsData {
  activeFactions: Array<{
    id: string;
    name: string;
    publicGoal: string;
    hiddenAgenda: string;
    assets: string[];
    leverage: string;
    vulnerability: string;
    face: {
      name: string;
      vibe: string;
    };
  }>;
  relationshipMap: Record<string, Record<string, 'Allied' | 'Friendly' | 'Neutral' | 'Tense' | 'Hostile' | 'At War'>>;
  monthlySwayActions: Record<string, string>; // Faction ID -> sway action
}

export interface PlacesOfInterestData {
  sites: Array<{
    name: string;
    function: string;
    vibe: string;
    gatekeepers: string;
    risks: string;
    rewards: string;
    rumor: string;
    truth: string;
    twist: string;
    hooks: string[]; // 2-3 hooks
    decisionPoint: string;
    realmTouchpoints?: string;
  }>;
}

export interface CampaignSeedsData {
  seeds: Array<{
    premise: string; // One line
    beats: string[]; // 4-6 beats
    ties: {
      npcs: string[]; // 2 named NPCs
      places: string[]; // 2 places
    };
    stakesAndClocks: string;
    pivotVariants: string[];
  }>;
}

// Advanced sections
export interface MagicProfileData {
  systemsInUse: string[]; // Subset of Era systems
  availabilityNotes: string;
  localTaboos: string[];
  corruptionPace: string; // Local modifier
  cosmicEventHooks: string[];
}

export interface RacesBeingsData {
  raceAvailability: Record<string, 'Playable' | 'NPC-only' | 'Other'>;
  raceNotes: Record<string, string>;
}

export interface CreaturesData {
  creatureStatus: Record<string, 'Common' | 'Uncommon' | 'Rare' | 'Protected' | 'Hunted'>;
  regionalAreas: Record<string, string[]>;
  localModifiers: {
    encounterDifficulty: string;
    seasonalWindow: string;
    lawsProtections: string;
  };
}

export interface DeitiesBeliefData {
  chosenDeities: Record<string, 'Low' | 'Medium' | 'High' | 'Dominant'>;
  teachingsWorship: Record<string, string>;
}

export interface RelationsLawData {
  factionRelations: Record<string, Record<string, 'Allied' | 'Friendly' | 'Neutral' | 'Tense' | 'Hostile' | 'At War'>>;
  governance: {
    whoDecides: string;
    howItReachesStreets: string;
    enforcementStyle: string;
    courts: string[];
    fairExample: string;
    unfairExample: string;
  };
  consequencesTable: Record<string, string>; // "If PC does X" -> "likely Y"
}

export interface CurrencyData {
  resolvedDenominations: Record<string, number>; // Read-only from Region/Kingdom
  barterQuirks: string;
  currencySlang: Record<string, string>;
}

// Main Settings data interface
export interface SettingsData {
  frontMatter: FrontMatterData;
  timeAndPlace: TimeAndPlaceData;
  regionOverview: RegionOverviewData;
  geographyEnvironment: GeographyEnvironmentData;
  builtEnvironment: BuiltEnvironmentData;
  powerFactions: PowerFactionsData;
  placesOfInterest: PlacesOfInterestData;
  campaignSeeds: CampaignSeedsData;
  // Advanced sections
  magicProfile: MagicProfileData;
  racesBeings: RacesBeingsData;
  creatures: CreaturesData;
  deitiesBelief: DeitiesBeliefData;
  relationsLaw: RelationsLawData;
  currency: CurrencyData;
}