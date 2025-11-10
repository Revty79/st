"use client";

import React, { useState } from "react";

// Section header component with save button
const SectionHeader = ({ title, onSave, isSaving }: {
  title: string;
  onSave?: () => void;
  isSaving?: boolean;
}) => (
  <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/20">
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    {onSave && (
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
          isSaving
            ? 'bg-amber-600/20 border-amber-400/30 text-amber-300 cursor-not-allowed'
            : 'bg-amber-600/10 hover:bg-amber-600/20 border-amber-400/20 hover:border-amber-400/40 text-amber-200 hover:text-amber-100'
        } flex items-center gap-2`}
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent"></div>
            Saving...
          </>
        ) : (
          <>
            💾 Save Changes
          </>
        )}
      </button>
    )}
  </div>
);

// ============================================================================
// INTERFACES
// ============================================================================

// 1) Basic Info
export interface EraBasicInfo {
  name: string; // ≤60
  shortSummary: string; // ≤240
  ongoing: boolean;
  startDate: { year: string; month: string; day: string };
  endDate: { year: string; month: string; day: string } | 'Ongoing';
  transitionIn: string; // ≤240
  transitionOut: string; // ≤240
}

// 2) Backdrop Defaults
export interface EraBackdropDefaults {
  activeRealms: string[]; // IDs from World realms
  typicalTechLevel: string;
  magicTide: 'Dormant' | 'Low' | 'Normal' | 'High' | 'Surging';
  stabilityConflict: 'Peaceful' | 'Tense' | 'Cold War' | 'Open War' | 'Collapse';
  travelSafety: -20 | -10 | 0 | 10 | 20;
  economy: 'Bust' | 'Strained' | 'Stable' | 'Boom' | 'Speculative';
  lawOrder: 'Lawless' | 'Loose' | 'Mixed' | 'Strict' | 'Martial';
  religiousTemperature: 'Dormant' | 'Steady' | 'Revival' | 'Schism' | 'Crusade';
  rulesStyleNudges: {
    restRecovery: 'Standard' | 'Gritty' | 'Heroic';
    difficultyBias: -10 | 0 | 10;
  };
}

// 3) Governments & Currency
export interface EraCurrencyDenomination {
  name: string;
  valueInWorldAnchor: number;
}

export interface EraRegionKingdom {
  name: string;
  kind: 'Region' | 'Kingdom' | 'City-State';
  parent?: string; // Optional parent
  localCurrency: {
    denominations: EraCurrencyDenomination[];
    barterExchangeQuirks?: string;
    currencySlang?: string;
    aliases?: string;
    notes?: string;
  };
}

export interface EraGovernment {
  name: string;
  type: string; // Monarchy, Republic, etc.
  oneLineNote: string;
  territoryTags?: string;
  currentRuler?: string;
  stability?: 'Strong' | 'Stable' | 'Shaky' | 'Failing' | 'In Crisis';
  military?: 'Weak' | 'Moderate' | 'Strong' | 'Dominant';
  regionsKingdoms: EraRegionKingdom[];
}

// 4) Trade & Economics
export interface EraTradeEconomics {
  tradeRoutes: string; // active / disrupted / new
  majorTradeGoods: string;
  crisesBoom: string;
  embargosSanctions: string;
}

// 5) Era Catalogs
export interface EraRaceEntry {
  raceId: string;
  raceName: string;
  status: 'Present' | 'Uncommon' | 'Rare' | 'Banned' | 'Extinct' | 'Legend-only';
}

export interface EraCreatureEntry {
  creatureId: string;
  creatureName: string;
  status: 'Present' | 'Uncommon' | 'Rare' | 'Banned' | 'Extinct' | 'Legend-only';
  dangerShift: -10 | 0 | 10;
  migrationTrend?: string;
  seasonalWindow?: string;
  lawsProtections?: string;
}

export interface EraLanguageEntry {
  languageId: string;
  languageName: string;
  active: boolean;
}

export interface EraDeityEntry {
  deityId: string;
  deityName: string;
  influence: 'Low' | 'Med' | 'High' | 'Dominant';
}

export interface EraFactionEntry {
  factionId: string;
  factionName: string;
  type: string;
  scope: string;
  posture: 'Aggressive' | 'Covert' | 'Stagnant' | 'Growing' | 'Fragmenting';
  oneLineAim: string;
}

export interface EraCatalogs {
  races: EraRaceEntry[];
  creatures: EraCreatureEntry[];
  languages: EraLanguageEntry[];
  deities: EraDeityEntry[];
  factions: EraFactionEntry[];
}

// 6) Catalyst Events
export interface EraCatalystEvent {
  id: string;
  title: string;
  type: 'Discovery' | 'Founding' | 'Conflict' | 'Disaster' | 'Edict' | 'Migration' | 'Phenomenon' | 'Miracle' | 'Quest' | 'Other';
  dateOrSpan: string;
  playerVisible: boolean;
  shortSummary: string;
  fullGODNotes: string;
  impacts: string; // tags
  mechanicalTags: string; // e.g., Economy −10, Magic Tide +10
  rippleEffects?: string;
  anniversaries?: string;
  relatedCatalysts?: string;
  settlementReactions?: string;
  attachments?: string;
}

// 7) Setting Vertebrae (stubs)
export interface EraSettingStub {
  id: string;
  settingName: string; // ≤60
  regionScope: string; // link to Region/Kingdom
  localDateSpan: string; // within Era
  toneWords: string; // 2-3
  tags: string; // 5-7
  whyNow: string; // ≤180
  activeRealms: string[]; // subset of Era
}

// Main Era Data
export interface EraDetailsData {
  basicInfo: EraBasicInfo;
  backdropDefaults: EraBackdropDefaults;
  governments: EraGovernment[];
  tradeEconomics: EraTradeEconomics;
  catalogs: EraCatalogs;
  catalystEvents: EraCatalystEvent[];
  settingStubs: EraSettingStub[];
}

interface EraDetailsFormProps {
  data: EraDetailsData;
  onUpdate: (data: Partial<EraDetailsData>) => void;
  worldRealms: Array<{ id: string; name: string }>; // Available realms from World
  currentSection: string;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const Input = ({ value, onChange, onBlur, placeholder, maxLength, className = "" }: any) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    placeholder={placeholder}
    maxLength={maxLength}
    className={`w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
  />
);

const Textarea = ({ value, onChange, onBlur, placeholder, rows = 3, maxLength, className = "" }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}) => {
  return React.createElement('textarea', {
    value,
    onChange,
    onBlur,
    placeholder,
    maxLength,
    rows,
    className: `w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${className}`
  });
};

const Select = ({ value, onChange, options, className = "" }: any) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
  >
    {options.map((opt: any) => (
      <option key={opt.value} value={opt.value} className="bg-zinc-800 text-white">
        {opt.label}
      </option>
    ))}
  </select>
);

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

// Section 3: Governments
function GovernmentsSection({ 
  governments, 
  onUpdate 
}: { 
  governments: EraGovernment[]; 
  onUpdate: (govs: EraGovernment[]) => void;
}) {
  const [expandedGov, setExpandedGov] = useState<number | null>(null);

  const addGovernment = () => {
    const newGov: EraGovernment = {
      name: "",
      type: "",
      oneLineNote: "",
      regionsKingdoms: []
    };
    onUpdate([...governments, newGov]);
  };

  const removeGovernment = (index: number) => {
    onUpdate(governments.filter((_, i) => i !== index));
  };

  const updateGovernment = (index: number, field: keyof EraGovernment, value: any) => {
    onUpdate(governments.map((gov, i) => i === index ? { ...gov, [field]: value } : gov));
  };

  const addRegion = (govIndex: number) => {
    const newRegion: EraRegionKingdom = {
      name: "",
      kind: 'Region',
      localCurrency: {
        denominations: [{ name: "", valueInWorldAnchor: 1.0 }]
      }
    };
    const updated = [...governments];
    updated[govIndex].regionsKingdoms.push(newRegion);
    onUpdate(updated);
  };

  const removeRegion = (govIndex: number, regionIndex: number) => {
    const updated = [...governments];
    updated[govIndex].regionsKingdoms.splice(regionIndex, 1);
    onUpdate(updated);
  };

  const updateRegion = (govIndex: number, regionIndex: number, field: keyof EraRegionKingdom, value: any) => {
    const updated = [...governments];
    updated[govIndex].regionsKingdoms[regionIndex] = {
      ...updated[govIndex].regionsKingdoms[regionIndex],
      [field]: value
    };
    onUpdate(updated);
  };

  const addDenomination = (govIndex: number, regionIndex: number) => {
    const updated = [...governments];
    updated[govIndex].regionsKingdoms[regionIndex].localCurrency.denominations.push({
      name: "",
      valueInWorldAnchor: 1.0
    });
    onUpdate(updated);
  };

  const removeDenomination = (govIndex: number, regionIndex: number, denomIndex: number) => {
    const updated = [...governments];
    updated[govIndex].regionsKingdoms[regionIndex].localCurrency.denominations.splice(denomIndex, 1);
    onUpdate(updated);
  };

  const updateDenomination = (govIndex: number, regionIndex: number, denomIndex: number, field: 'name' | 'valueInWorldAnchor', value: any) => {
    const updated = [...governments];
    updated[govIndex].regionsKingdoms[regionIndex].localCurrency.denominations[denomIndex] = {
      ...updated[govIndex].regionsKingdoms[regionIndex].localCurrency.denominations[denomIndex],
      [field]: value
    };
    onUpdate(updated);
  };

  return (
    <div className="space-y-4 bg-white/5 border border-white/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">3) Governments (Regions & Currency)</h3>
        <button
          onClick={addGovernment}
          className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 text-sm font-medium"
        >
          + Add Government
        </button>
      </div>

      {governments.length === 0 ? (
        <div className="text-white/60 text-center py-8">No governments defined yet</div>
      ) : (
        <div className="space-y-4">
          {governments.map((gov, govIdx) => (
            <div key={govIdx} className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setExpandedGov(expandedGov === govIdx ? null : govIdx)}
                  className="flex-1 text-left"
                >
                  <div className="text-lg font-semibold text-white">
                    {gov.name || `Government ${govIdx + 1}`}
                  </div>
                  <div className="text-sm text-white/60">
                    {gov.type} • {gov.regionsKingdoms.length} regions
                  </div>
                </button>
                <button
                  onClick={() => removeGovernment(govIdx)}
                  className="px-3 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 text-sm"
                >
                  Remove
                </button>
              </div>

              {expandedGov === govIdx && (
                <div className="space-y-4 border-t border-white/20 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">Name</label>
                      <Input
                        value={gov.name}
                        onChange={(e: any) => updateGovernment(govIdx, 'name', e.target.value)}
                        placeholder="e.g., Aurelian Throne"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">Type</label>
                      <Input
                        value={gov.type}
                        onChange={(e: any) => updateGovernment(govIdx, 'type', e.target.value)}
                        placeholder="e.g., Monarchy, Republic"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">One-line Note</label>
                    <Input
                      value={gov.oneLineNote}
                      onChange={(e: any) => updateGovernment(govIdx, 'oneLineNote', e.target.value)}
                      placeholder="e.g., Magisterium-backed crown"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">Territory Tags (optional)</label>
                      <Input
                        value={gov.territoryTags || ""}
                        onChange={(e: any) => updateGovernment(govIdx, 'territoryTags', e.target.value)}
                        placeholder="e.g., Northern Continent, Islands"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">Current Ruler (optional)</label>
                      <Input
                        value={gov.currentRuler || ""}
                        onChange={(e: any) => updateGovernment(govIdx, 'currentRuler', e.target.value)}
                        placeholder="e.g., Queen Elara III"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">Stability (optional)</label>
                      <Select
                        value={gov.stability || ''}
                        onChange={(e: any) => updateGovernment(govIdx, 'stability', e.target.value || undefined)}
                        options={[
                          { value: '', label: 'Not set' },
                          { value: 'Strong', label: 'Strong' },
                          { value: 'Stable', label: 'Stable' },
                          { value: 'Shaky', label: 'Shaky' },
                          { value: 'Failing', label: 'Failing' },
                          { value: 'In Crisis', label: 'In Crisis' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">Military (optional)</label>
                      <Select
                        value={gov.military || ''}
                        onChange={(e: any) => updateGovernment(govIdx, 'military', e.target.value || undefined)}
                        options={[
                          { value: '', label: 'Not set' },
                          { value: 'Weak', label: 'Weak' },
                          { value: 'Moderate', label: 'Moderate' },
                          { value: 'Strong', label: 'Strong' },
                          { value: 'Dominant', label: 'Dominant' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Regions/Kingdoms */}
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-white">Regions/Kingdoms</h4>
                      <button
                        onClick={() => addRegion(govIdx)}
                        className="px-3 py-1 bg-green-600/20 text-green-300 rounded hover:bg-green-600/30 text-sm"
                      >
                        + Add Region
                      </button>
                    </div>

                    {gov.regionsKingdoms.length === 0 ? (
                      <div className="text-white/60 text-sm py-2">No regions yet</div>
                    ) : (
                      <div className="space-y-3">
                        {gov.regionsKingdoms.map((region, regionIdx) => (
                          <div key={regionIdx} className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-white text-sm">
                                {region.name || `Region ${regionIdx + 1}`}
                              </div>
                              <button
                                onClick={() => removeRegion(govIdx, regionIdx)}
                                className="px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 text-xs"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Name</label>
                                <input
                                  type="text"
                                  value={region.name}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegion(govIdx, regionIdx, 'name', e.target.value)}
                                  placeholder="Region name"
                                  className="w-full rounded bg-white/10 text-white text-sm px-2 py-1 border border-white/20"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Kind</label>
                                <select
                                  value={region.kind}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRegion(govIdx, regionIdx, 'kind', e.target.value)}
                                  className="w-full rounded bg-white/10 text-white text-sm px-2 py-1 border border-white/20"
                                >
                                  <option value="Region" className="bg-zinc-800">Region</option>
                                  <option value="Kingdom" className="bg-zinc-800">Kingdom</option>
                                  <option value="City-State" className="bg-zinc-800">City-State</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-white/60 mb-1">Parent (opt)</label>
                                <input
                                  type="text"
                                  value={region.parent || ""}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegion(govIdx, regionIdx, 'parent', e.target.value || undefined)}
                                  placeholder="Parent region"
                                  className="w-full rounded bg-white/10 text-white text-sm px-2 py-1 border border-white/20"
                                />
                              </div>
                            </div>

                            {/* Local Currency */}
                            <div className="bg-white/5 rounded p-2 mt-2">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-white">Local Currency</label>
                                <button
                                  onClick={() => addDenomination(govIdx, regionIdx)}
                                  className="px-2 py-1 bg-amber-600/20 text-amber-300 rounded hover:bg-amber-600/30 text-xs"
                                >
                                  + Denomination
                                </button>
                              </div>
                              
                              <div className="space-y-1">
                                {region.localCurrency.denominations.map((denom, denomIdx) => (
                                  <div key={denomIdx} className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={denom.name}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDenomination(govIdx, regionIdx, denomIdx, 'name', e.target.value)}
                                      placeholder="Name (e.g., Dollar)"
                                      className="flex-1 rounded bg-white/10 text-white text-xs px-2 py-1 border border-white/20"
                                    />
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={denom.valueInWorldAnchor}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDenomination(govIdx, regionIdx, denomIdx, 'valueInWorldAnchor', parseFloat(e.target.value) || 1.0)}
                                      placeholder="1.0"
                                      className="w-20 rounded bg-white/10 text-white text-xs px-2 py-1 border border-white/20"
                                    />
                                    <button
                                      onClick={() => removeDenomination(govIdx, regionIdx, denomIdx)}
                                      className="px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-2 space-y-1">
                                <input
                                  type="text"
                                  value={region.localCurrency.barterExchangeQuirks || ""}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegion(govIdx, regionIdx, 'localCurrency', {
                                    ...region.localCurrency,
                                    barterExchangeQuirks: e.target.value
                                  })}
                                  placeholder="Barter quirks (opt)"
                                  className="w-full rounded bg-white/10 text-white text-xs px-2 py-1 border border-white/20"
                                />
                                <input
                                  type="text"
                                  value={region.localCurrency.currencySlang || ""}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRegion(govIdx, regionIdx, 'localCurrency', {
                                    ...region.localCurrency,
                                    currencySlang: e.target.value
                                  })}
                                  placeholder="Currency slang (opt)"
                                  className="w-full rounded bg-white/10 text-white text-xs px-2 py-1 border border-white/20"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section 5: Era Catalogs
function EraCatalogsSection({ 
  catalogs, 
  onUpdate 
}: { 
  catalogs: EraCatalogs; 
  onUpdate: (cats: EraCatalogs) => void;
}) {
  return (
    <div className="space-y-4 bg-white/5 border border-white/20 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">5) Era Catalogs</h3>
      <p className="text-sm text-white/60 mb-4">
        Subsets of World catalogs — who's on the board now (Settings can only pick from these)
      </p>
      
      <div className="text-white/60 text-sm bg-amber-900/20 border border-amber-500/30 rounded p-3 mb-4">
        <strong>Note:</strong> Full catalog management UI coming soon. For now, this will fetch and filter from World catalogs.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="font-semibold text-white mb-2">Races</div>
          <div className="text-sm text-white/60">{catalogs.races.length} configured</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="font-semibold text-white mb-2">Creatures</div>
          <div className="text-sm text-white/60">{catalogs.creatures.length} configured</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="font-semibold text-white mb-2">Languages</div>
          <div className="text-sm text-white/60">{catalogs.languages.length} configured</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="font-semibold text-white mb-2">Deities</div>
          <div className="text-sm text-white/60">{catalogs.deities.length} configured</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="font-semibold text-white mb-2">Factions</div>
          <div className="text-sm text-white/60">{catalogs.factions.length} configured</div>
        </div>
      </div>
    </div>
  );
}

// Section 6: Catalyst Events
function CatalystEventsSection({ 
  events, 
  onUpdate 
}: { 
  events: EraCatalystEvent[]; 
  onUpdate: (events: EraCatalystEvent[]) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const addEvent = () => {
    const newEvent: EraCatalystEvent = {
      id: `event-${Date.now()}`,
      title: "",
      type: 'Discovery',
      dateOrSpan: "",
      playerVisible: true,
      shortSummary: "",
      fullGODNotes: "",
      impacts: "",
      mechanicalTags: ""
    };
    onUpdate([...events, newEvent]);
  };

  const removeEvent = (index: number) => {
    onUpdate(events.filter((_, i) => i !== index));
  };

  const updateEvent = (index: number, field: keyof EraCatalystEvent, value: any) => {
    onUpdate(events.map((evt, i) => i === index ? { ...evt, [field]: value } : evt));
  };

  return (
    <div className="space-y-4 bg-white/5 border border-white/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">6) Catalyst Events (Era markers)</h3>
        <button
          onClick={addEvent}
          className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 text-sm font-medium"
        >
          + Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-white/60 text-center py-8">No catalyst events yet</div>
      ) : (
        <div className="space-y-3">
          {events.map((evt, idx) => (
            <div key={evt.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="flex-1 text-left"
                >
                  <div className="font-semibold text-white">{evt.title || `Event ${idx + 1}`}</div>
                  <div className="text-sm text-white/60">{evt.type} • {evt.dateOrSpan}</div>
                </button>
                <button
                  onClick={() => removeEvent(idx)}
                  className="px-3 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 text-sm"
                >
                  Remove
                </button>
              </div>

              {expanded === idx && (
                <div className="space-y-3 border-t border-white/20 pt-3 mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/80 mb-1">Title (required)</label>
                      <Input
                        value={evt.title}
                        onChange={(e: any) => updateEvent(idx, 'title', e.target.value)}
                        placeholder="e.g., Blood Knot Eclipse"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/80 mb-1">Type</label>
                      <Select
                        value={evt.type}
                        onChange={(e: any) => updateEvent(idx, 'type', e.target.value)}
                        options={[
                          { value: 'Discovery', label: 'Discovery' },
                          { value: 'Founding', label: 'Founding' },
                          { value: 'Conflict', label: 'Conflict' },
                          { value: 'Disaster', label: 'Disaster' },
                          { value: 'Edict', label: 'Edict' },
                          { value: 'Migration', label: 'Migration' },
                          { value: 'Phenomenon', label: 'Phenomenon' },
                          { value: 'Miracle', label: 'Miracle' },
                          { value: 'Quest', label: 'Quest' },
                          { value: 'Other', label: 'Other' }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/80 mb-1">Date or Span</label>
                      <Input
                        value={evt.dateOrSpan}
                        onChange={(e: any) => updateEvent(idx, 'dateOrSpan', e.target.value)}
                        placeholder="e.g., 312 AF Frostmere"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/80 mb-1">Player-Visible?</label>
                      <Select
                        value={evt.playerVisible ? 'yes' : 'no'}
                        onChange={(e: any) => updateEvent(idx, 'playerVisible', e.target.value === 'yes')}
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No (GM only)' }
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/80 mb-1">Short Summary (one line)</label>
                    <Input
                      value={evt.shortSummary}
                      onChange={(e: any) => updateEvent(idx, 'shortSummary', e.target.value)}
                      placeholder="Brief player-facing description"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/80 mb-1">Full G.O.D Notes</label>
                    <Textarea
                      value={evt.fullGODNotes}
                      onChange={(e: any) => updateEvent(idx, 'fullGODNotes', e.target.value)}
                      placeholder="Detailed GM notes..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/80 mb-1">Impacts (tags)</label>
                    <Input
                      value={evt.impacts}
                      onChange={(e: any) => updateEvent(idx, 'impacts', e.target.value)}
                      placeholder="e.g., regions, factions, races, creatures, magic, tech"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/80 mb-1">Mechanical Tags (percentile)</label>
                    <Input
                      value={evt.mechanicalTags}
                      onChange={(e: any) => updateEvent(idx, 'mechanicalTags', e.target.value)}
                      placeholder="e.g., Economy −10, Magic Tide +10"
                    />
                  </div>

                  <details className="bg-white/5 rounded p-2">
                    <summary className="text-sm text-white/80 cursor-pointer">Optional Fields</summary>
                    <div className="space-y-2 mt-2">
                      <Input
                        value={evt.rippleEffects || ""}
                        onChange={(e: any) => updateEvent(idx, 'rippleEffects', e.target.value)}
                        placeholder="Ripple Effects"
                      />
                      <Input
                        value={evt.anniversaries || ""}
                        onChange={(e: any) => updateEvent(idx, 'anniversaries', e.target.value)}
                        placeholder="Anniversaries"
                      />
                      <Input
                        value={evt.relatedCatalysts || ""}
                        onChange={(e: any) => updateEvent(idx, 'relatedCatalysts', e.target.value)}
                        placeholder="Related Catalysts"
                      />
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section 7: Setting Stubs
function SettingStubsSection({ 
  stubs, 
  eraRealms,
  governments,
  onUpdate 
}: { 
  stubs: EraSettingStub[]; 
  eraRealms: string[];
  governments: EraGovernment[];
  onUpdate: (stubs: EraSettingStub[]) => void;
}) {
  const addStub = () => {
    const newStub: EraSettingStub = {
      id: `stub-${Date.now()}`,
      settingName: "",
      regionScope: "",
      localDateSpan: "",
      toneWords: "",
      tags: "",
      whyNow: "",
      activeRealms: []
    };
    onUpdate([...stubs, newStub]);
  };

  const removeStub = (index: number) => {
    onUpdate(stubs.filter((_, i) => i !== index));
  };

  const updateStub = (index: number, field: keyof EraSettingStub, value: any) => {
    onUpdate(stubs.map((stub, i) => i === index ? { ...stub, [field]: value } : stub));
  };

  return (
    <div className="space-y-4 bg-white/5 border border-white/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">7) Setting Vertebrae (stubs)</h3>
          <p className="text-sm text-white/60 mt-1">Quick stubs to seed Settings later</p>
        </div>
        <button
          onClick={addStub}
          className="px-4 py-2 bg-teal-600/20 text-teal-300 rounded hover:bg-teal-600/30 text-sm font-medium"
        >
          + Add Setting Stub
        </button>
      </div>

      {stubs.length === 0 ? (
        <div className="text-white/60 text-center py-8">No setting stubs yet</div>
      ) : (
        <div className="space-y-3">
          {stubs.map((stub, idx) => (
            <div key={stub.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-white">{stub.settingName || `Setting Stub ${idx + 1}`}</div>
                <button
                  onClick={() => removeStub(idx)}
                  className="px-3 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/80 mb-1">Setting Name (≤60)</label>
                    <Input
                      value={stub.settingName}
                      onChange={(e: any) => updateStub(idx, 'settingName', e.target.value)}
                      placeholder="e.g., Shattersea Freeports"
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/80 mb-1">Region Scope</label>
                    <Input
                      value={stub.regionScope}
                      onChange={(e: any) => updateStub(idx, 'regionScope', e.target.value)}
                      placeholder="Link to Region/Kingdom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/80 mb-1">Local Date Span (within Era)</label>
                    <Input
                      value={stub.localDateSpan}
                      onChange={(e: any) => updateStub(idx, 'localDateSpan', e.target.value)}
                      placeholder="e.g., 318–320 AF"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/80 mb-1">Tone Words (2–3)</label>
                    <Input
                      value={stub.toneWords}
                      onChange={(e: any) => updateStub(idx, 'toneWords', e.target.value)}
                      placeholder="e.g., Swashbuckling, Intrigue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/80 mb-1">Tags (5–7)</label>
                  <Input
                    value={stub.tags}
                    onChange={(e: any) => updateStub(idx, 'tags', e.target.value)}
                    placeholder="e.g., Fantasy, Pulp, Seafaring, Underworld, Faction-Play"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/80 mb-1">Why Now (≤180)</label>
                  <Textarea
                    value={stub.whyNow}
                    onChange={(e: any) => updateStub(idx, 'whyNow', e.target.value)}
                    placeholder="1-line hook explaining why this setting is hot now..."
                    maxLength={180}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/80 mb-2">Active Realms (subset of Era)</label>
                  <div className="bg-white/5 rounded p-2 max-h-32 overflow-y-auto">
                    {eraRealms.length === 0 ? (
                      <div className="text-white/60 text-xs">No realms active in Era</div>
                    ) : (
                      eraRealms.map(realmId => (
                        <label key={realmId} className="flex items-center gap-2 p-1 hover:bg-white/5 cursor-pointer rounded">
                          <input
                            type="checkbox"
                            checked={stub.activeRealms.includes(realmId)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const updated = e.target.checked
                                ? [...stub.activeRealms, realmId]
                                : stub.activeRealms.filter(id => id !== realmId);
                              updateStub(idx, 'activeRealms', updated);
                            }}
                            className="w-3 h-3"
                          />
                          <span className="text-white text-xs">{realmId}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EraDetailsForm({ 
  data, 
  onUpdate, 
  worldRealms, 
  currentSection,
  onManualSave,
  isManualSaving
}: EraDetailsFormProps) {

  // Section 1: Basic Info
  const updateBasicInfo = (field: keyof EraBasicInfo, value: any) => {
    onUpdate({
      basicInfo: { ...data.basicInfo, [field]: value }
    });
  };

  // Section 2: Backdrop Defaults
  const updateBackdrop = (field: keyof EraBackdropDefaults, value: any) => {
    onUpdate({
      backdropDefaults: { ...data.backdropDefaults, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      {currentSection === "basic" && (
        <div className="space-y-4">
          <SectionHeader 
            title="Basic Info (Dates + Transitions)" 
            onSave={onManualSave} 
            isSaving={isManualSaving} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Era Name (≤60)</label>
              <Input
                value={data.basicInfo.name}
                onChange={(e: any) => updateBasicInfo('name', e.target.value)}
                placeholder="e.g., Cold Tides"
                maxLength={60}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Ongoing?</label>
              <Select
                value={data.basicInfo.ongoing ? 'yes' : 'no'}
                onChange={(e: any) => updateBasicInfo('ongoing', e.target.value === 'yes')}
                options={[
                  { value: 'yes', label: 'Yes - Current Age' },
                  { value: 'no', label: 'No - Historical' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Short Summary (≤240)</label>
            <Textarea
              value={data.basicInfo.shortSummary}
              onChange={(e: any) => updateBasicInfo('shortSummary', e.target.value)}
              placeholder="Player-facing vibe + what's happening..."
              maxLength={240}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Start Date</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={data.basicInfo.startDate.year}
                  onChange={(e: any) => updateBasicInfo('startDate', { ...data.basicInfo.startDate, year: e.target.value })}
                  placeholder="Year"
                />
                <Input
                  value={data.basicInfo.startDate.month}
                  onChange={(e: any) => updateBasicInfo('startDate', { ...data.basicInfo.startDate, month: e.target.value })}
                  placeholder="Month"
                />
                <Input
                  value={data.basicInfo.startDate.day}
                  onChange={(e: any) => updateBasicInfo('startDate', { ...data.basicInfo.startDate, day: e.target.value })}
                  placeholder="Day"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">End Date</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={data.basicInfo.endDate === 'Ongoing' ? 'Ongoing' : data.basicInfo.endDate.year}
                  onChange={(e: any) => {
                    if (e.target.value === 'Ongoing') {
                      updateBasicInfo('endDate', 'Ongoing');
                    } else {
                      updateBasicInfo('endDate', { 
                        year: e.target.value, 
                        month: data.basicInfo.endDate !== 'Ongoing' ? data.basicInfo.endDate.month : '', 
                        day: data.basicInfo.endDate !== 'Ongoing' ? data.basicInfo.endDate.day : '' 
                      });
                    }
                  }}
                  placeholder="Year/Ongoing"
                />
                <Input
                  value={data.basicInfo.endDate === 'Ongoing' ? '' : data.basicInfo.endDate.month}
                  onChange={(e: any) => {
                    if (data.basicInfo.endDate !== 'Ongoing') {
                      updateBasicInfo('endDate', { ...data.basicInfo.endDate, month: e.target.value });
                    }
                  }}
                  placeholder="Month"
                  disabled={data.basicInfo.endDate === 'Ongoing'}
                />
                <Input
                  value={data.basicInfo.endDate === 'Ongoing' ? '' : data.basicInfo.endDate.day}
                  onChange={(e: any) => {
                    if (data.basicInfo.endDate !== 'Ongoing') {
                      updateBasicInfo('endDate', { ...data.basicInfo.endDate, day: e.target.value });
                    }
                  }}
                  placeholder="Day"
                  disabled={data.basicInfo.endDate === 'Ongoing'}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Transition In (≤240)</label>
            <Textarea
              value={data.basicInfo.transitionIn}
              onChange={(e: any) => updateBasicInfo('transitionIn', e.target.value)}
              placeholder="What ended the last era..."
              maxLength={240}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Transition Out (≤240)</label>
            <Textarea
              value={data.basicInfo.transitionOut}
              onChange={(e: any) => updateBasicInfo('transitionOut', e.target.value)}
              placeholder="What will likely end this era..."
              maxLength={240}
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Section 2: Backdrop Defaults */}
      {currentSection === "backdrop" && (
        <div className="space-y-4">
          <SectionHeader 
            title="Backdrop Defaults" 
            onSave={onManualSave} 
            isSaving={isManualSaving} 
          />
          <p className="text-sm text-white/60 mb-4">Must sit within World bounds</p>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Active Realms (multi-select from World)</label>
            <div className="bg-white/5 border border-white/20 rounded-lg p-3 max-h-40 overflow-y-auto">
              {worldRealms.map(realm => (
                <label key={realm.id} className="flex items-center gap-2 p-2 hover:bg-white/5 cursor-pointer rounded">
                  <input
                    type="checkbox"
                    checked={data.backdropDefaults.activeRealms.includes(realm.id)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = e.target.checked
                        ? [...data.backdropDefaults.activeRealms, realm.id]
                        : data.backdropDefaults.activeRealms.filter(id => id !== realm.id);
                      updateBackdrop('activeRealms', updated);
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-white text-sm">{realm.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Typical Tech Level</label>
              <Input
                value={data.backdropDefaults.typicalTechLevel}
                onChange={(e: any) => updateBackdrop('typicalTechLevel', e.target.value)}
                placeholder="e.g., Late Medieval, Renaissance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Magic Tide</label>
              <Select
                value={data.backdropDefaults.magicTide}
                onChange={(e: any) => updateBackdrop('magicTide', e.target.value)}
                options={[
                  { value: 'Dormant', label: 'Dormant' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'High', label: 'High' },
                  { value: 'Surging', label: 'Surging' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Stability & Conflict</label>
              <Select
                value={data.backdropDefaults.stabilityConflict}
                onChange={(e: any) => updateBackdrop('stabilityConflict', e.target.value)}
                options={[
                  { value: 'Peaceful', label: 'Peaceful' },
                  { value: 'Tense', label: 'Tense' },
                  { value: 'Cold War', label: 'Cold War' },
                  { value: 'Open War', label: 'Open War' },
                  { value: 'Collapse', label: 'Collapse' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Travel Safety (percentile bias)</label>
              <Select
                value={data.backdropDefaults.travelSafety}
                onChange={(e: any) => updateBackdrop('travelSafety', parseInt(e.target.value))}
                options={[
                  { value: -20, label: '−20 (Very Risky)' },
                  { value: -10, label: '−10 (Risky)' },
                  { value: 0, label: '0 (Neutral)' },
                  { value: 10, label: '+10 (Safe)' },
                  { value: 20, label: '+20 (Very Safe)' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Economy</label>
              <Select
                value={data.backdropDefaults.economy}
                onChange={(e: any) => updateBackdrop('economy', e.target.value)}
                options={[
                  { value: 'Bust', label: 'Bust' },
                  { value: 'Strained', label: 'Strained' },
                  { value: 'Stable', label: 'Stable' },
                  { value: 'Boom', label: 'Boom' },
                  { value: 'Speculative', label: 'Speculative' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Law & Order</label>
              <Select
                value={data.backdropDefaults.lawOrder}
                onChange={(e: any) => updateBackdrop('lawOrder', e.target.value)}
                options={[
                  { value: 'Lawless', label: 'Lawless' },
                  { value: 'Loose', label: 'Loose' },
                  { value: 'Mixed', label: 'Mixed' },
                  { value: 'Strict', label: 'Strict' },
                  { value: 'Martial', label: 'Martial' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Religious Temperature</label>
            <Select
              value={data.backdropDefaults.religiousTemperature}
              onChange={(e: any) => updateBackdrop('religiousTemperature', e.target.value)}
              options={[
                { value: 'Dormant', label: 'Dormant' },
                { value: 'Steady', label: 'Steady' },
                { value: 'Revival', label: 'Revival' },
                { value: 'Schism', label: 'Schism' },
                { value: 'Crusade', label: 'Crusade' }
              ]}
            />
          </div>

          <div className="border-t border-white/20 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-white mb-3">Rules Style Nudges (optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Rest & Recovery</label>
                <Select
                  value={data.backdropDefaults.rulesStyleNudges.restRecovery}
                  onChange={(e: any) => updateBackdrop('rulesStyleNudges', { 
                    ...data.backdropDefaults.rulesStyleNudges, 
                    restRecovery: e.target.value 
                  })}
                  options={[
                    { value: 'Standard', label: 'Standard' },
                    { value: 'Gritty', label: 'Gritty (−10)' },
                    { value: 'Heroic', label: 'Heroic (+10)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Difficulty Bias</label>
                <Select
                  value={data.backdropDefaults.rulesStyleNudges.difficultyBias}
                  onChange={(e: any) => updateBackdrop('rulesStyleNudges', { 
                    ...data.backdropDefaults.rulesStyleNudges, 
                    difficultyBias: parseInt(e.target.value) 
                  })}
                  options={[
                    { value: -10, label: '−10 (Easier)' },
                    { value: 0, label: '0 (Standard)' },
                    { value: 10, label: '+10 (Harder)' }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Governments */}
      {currentSection === "governments" && (
        <div className="space-y-4">
          <SectionHeader 
            title="Governments" 
            onSave={onManualSave} 
            isSaving={isManualSaving} 
          />
          <GovernmentsSection
            governments={data.governments}
            onUpdate={(govs: any) => onUpdate({ governments: govs })}
          />
        </div>
      )}

      {/* Section 4: Trade & Economics */}
      {currentSection === "trade" && (
        <div className="space-y-4">
          <SectionHeader 
            title="Trade & Economics (era level)" 
            onSave={onManualSave} 
            isSaving={isManualSaving} 
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">Trade Routes (active / disrupted / new)</label>
            <Textarea
              value={data.tradeEconomics.tradeRoutes}
              onChange={(e: any) => onUpdate({ 
                tradeEconomics: { ...data.tradeEconomics, tradeRoutes: e.target.value }
              })}
              placeholder="e.g., Shard Keys Eastern Run — disrupted (piracy)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Major Trade Goods (this era)</label>
            <Textarea
              value={data.tradeEconomics.majorTradeGoods}
              onChange={(e: any) => onUpdate({ 
                tradeEconomics: { ...data.tradeEconomics, majorTradeGoods: e.target.value }
              })}
              placeholder="e.g., Embersteel plates; Moon-silk; Tide crystals"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Crises / Booms</label>
            <Textarea
              value={data.tradeEconomics.crisesBoom}
              onChange={(e: any) => onUpdate({ 
                tradeEconomics: { ...data.tradeEconomics, crisesBoom: e.target.value }
              })}
              placeholder="e.g., Salt famine in the north (−10 supply checks)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Embargoes / Sanctions</label>
            <Textarea
              value={data.tradeEconomics.embargosSanctions}
              onChange={(e: any) => onUpdate({ 
                tradeEconomics: { ...data.tradeEconomics, embargosSanctions: e.target.value }
              })}
              placeholder="e.g., Aurelion embargoes Cindervault ore"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Section 5: Era Catalogs */}
      {currentSection === "catalogs" && (
        <div className="space-y-4">
          <SectionHeader 
            title="Era Catalogs" 
            onSave={onManualSave} 
            isSaving={isManualSaving} 
          />
          <EraCatalogsSection
            catalogs={data.catalogs}
            onUpdate={(cats: any) => onUpdate({ catalogs: cats })}
          />
        </div>
      )}

      {/* Section 6: Catalyst Events */}
      {currentSection === "events" && (
        <div className="space-y-4">
          <SectionHeader 
            title="Catalyst Events" 
            onSave={onManualSave} 
            isSaving={isManualSaving} 
          />
          <CatalystEventsSection
            events={data.catalystEvents}
            onUpdate={(events: any) => onUpdate({ catalystEvents: events })}
          />
        </div>
      )}

      {/* Section 7: Setting Stubs */}
      {currentSection === "settings" && (
        <div className="space-y-4">
          <SectionHeader 
            title="Setting Stubs" 
            onSave={onManualSave} 
            isSaving={isManualSaving} 
          />
          <SettingStubsSection
            stubs={data.settingStubs}
            eraRealms={data.backdropDefaults.activeRealms}
            governments={data.governments}
            onUpdate={(stubs: any) => onUpdate({ settingStubs: stubs })}
          />
        </div>
      )}
    </div>
  );
}
