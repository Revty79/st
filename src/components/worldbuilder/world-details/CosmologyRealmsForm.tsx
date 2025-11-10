"use client";

import { useState, useEffect } from "react";

// Simple race/creature type for world-level selection (just IDs)
export interface WorldRaceSelection {
  raceId: string;
  raceName: string; // For display purposes
}

export interface WorldCreatureSelection {
  creatureId: string;
  creatureName: string; // For display purposes
}

// Realm-bound catalog interfaces (kept for future use in Eras)
export interface RealmRacePresence {
  raceId: string;
  presence: 'native' | 'migrant' | 'rare' | 'myth' | 'extinct';
  notes: string;
}

export interface RealmCreaturePresence {
  creatureId: string;
  presence: 'native' | 'migrant' | 'rare' | 'myth' | 'extinct';
  notes: string;
}

export interface RealmDeityPresence {
  deityId: string;
  influence: 'none' | 'low' | 'medium' | 'high' | 'dominant';
  notes: string;
}

export interface RealmLanguagePresence {
  languageId: string;
  prevalence: 'dominant' | 'common' | 'uncommon' | 'rare' | 'dead';
  notes: string;
}

// Optional module interfaces
export interface RealmOrganization {
  name: string;
  type: string;
  notes: string;
}

export interface RealmPhenomenon {
  name: string;
  type: string;
  notes: string;
}

export interface RealmTradeGood {
  name: string;
  value: string;
  notes: string;
}

export interface RealmItem {
  name: string;
  rarity: string;
  notes: string;
}

export interface RealmRelic {
  name: string;
  power: string;
  notes: string;
}

export interface RealmTaboo {
  name: string;
  severity: string;
  notes: string;
}

// Full definition interfaces (not just presence)
export interface RealmLanguage {
  id: string;
  name: string;
  script: string;
  speakerCount: string;
  notes: string;
}

export interface RealmDeity {
  id: string;
  name: string;
  domain: string;
  alignment: string;
  symbol: string;
  notes: string;
}

export interface RealmFaction {
  id: string;
  name: string;
  type: string; // Guild, Government, Religion, Military, etc.
  alignment: string;
  goals: string;
  notes: string;
}

// Main realm data
export interface RealmData {
  name: string;
  type: string;
  traits: string;
  travelRules: string;
  bleedThrough: string;
  playerSummary: string;
  gmNotes: string;
  availability: 'available' | 'sealed';
  
  // World-level selections (just checked/unchecked)
  selectedRaces: string[]; // Array of race IDs
  selectedCreatures: string[]; // Array of creature IDs
  
  // Full definitions (created in this realm)
  realmLanguages: RealmLanguage[];
  realmDeities: RealmDeity[];
  realmFactions: RealmFaction[];
  
  // Realm-bound catalogs (for future Era-level configuration)
  races: RealmRacePresence[];
  creatures: RealmCreaturePresence[];
  deities: RealmDeityPresence[];
  languages: RealmLanguagePresence[];
  
  // Optional modules
  organizations: RealmOrganization[];
  phenomena: RealmPhenomenon[];
  tradeGoods: RealmTradeGood[];
  items: RealmItem[];
  relics: RealmRelic[];
  taboos: RealmTaboo[];
}

export interface CosmologyRealmsData {
  realms: RealmData[];
}

interface CosmologyRealmsFormProps {
  data: CosmologyRealmsData;
  onUpdate: (data: Partial<CosmologyRealmsData>) => void;
}

// Races Selector Component
function RacesSelector({ 
  realmIndex, 
  selectedRaces, 
  onChange 
}: { 
  realmIndex: number; 
  selectedRaces: string[]; 
  onChange: (ids: string[]) => void;
}) {
  const [allRaces, setAllRaces] = useState<Array<{ id: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;

  // Fetch races from API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/races');
        const data = await response.json();
        setAllRaces(data.map((r: any) => ({ id: r.id, name: r.name || 'Unnamed Race' })));
      } catch (error) {
        console.error('Failed to fetch races:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter races based on search
  const filteredRaces = allRaces.filter(race =>
    race.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate
  const totalPages = Math.ceil(filteredRaces.length / itemsPerPage);
  const paginatedRaces = filteredRaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleRace = (raceId: string) => {
    if (selectedRaces.includes(raceId)) {
      onChange(selectedRaces.filter(id => id !== raceId));
    } else {
      onChange([...selectedRaces, raceId]);
    }
  };

  const selectAll = () => {
    const allIds = paginatedRaces.map(r => r.id);
    const newSelection = [...new Set([...selectedRaces, ...allIds])];
    onChange(newSelection);
  };

  const deselectAll = () => {
    const pageIds = paginatedRaces.map(r => r.id);
    onChange(selectedRaces.filter(id => !pageIds.includes(id)));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">
          Races ({selectedRaces.length} selected)
        </h4>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs px-2 py-1 bg-green-600/20 text-green-300 rounded hover:bg-green-600/30"
          >
            Select Page
          </button>
          <button
            onClick={deselectAll}
            className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
          >
            Deselect Page
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search races..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 mb-3"
      />

      {loading ? (
        <div className="text-white/60 text-center py-4">Loading races...</div>
      ) : filteredRaces.length === 0 ? (
        <div className="text-white/60 text-center py-4">No races found</div>
      ) : (
        <>
          {/* Checkbox List */}
          <div className="max-h-60 overflow-y-auto space-y-1 mb-3">
            {paginatedRaces.map(race => (
              <label
                key={race.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRaces.includes(race.id)}
                  onChange={() => toggleRace(race.id)}
                  className="w-4 h-4 rounded border-white/20"
                />
                <span className="text-white text-sm">{race.name}</span>
              </label>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-white/60">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Creatures Selector Component
function CreaturesSelector({ 
  realmIndex, 
  selectedCreatures, 
  onChange 
}: { 
  realmIndex: number; 
  selectedCreatures: string[]; 
  onChange: (ids: string[]) => void;
}) {
  const [allCreatures, setAllCreatures] = useState<Array<{ id: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;

  // Fetch creatures from API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/creatures');
        const data = await response.json();
        setAllCreatures(data.map((c: any) => ({ id: c.id, name: c.name || 'Unnamed Creature' })));
      } catch (error) {
        console.error('Failed to fetch creatures:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter creatures based on search
  const filteredCreatures = allCreatures.filter(creature =>
    creature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate
  const totalPages = Math.ceil(filteredCreatures.length / itemsPerPage);
  const paginatedCreatures = filteredCreatures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleCreature = (creatureId: string) => {
    if (selectedCreatures.includes(creatureId)) {
      onChange(selectedCreatures.filter(id => id !== creatureId));
    } else {
      onChange([...selectedCreatures, creatureId]);
    }
  };

  const selectAll = () => {
    const allIds = paginatedCreatures.map(c => c.id);
    const newSelection = [...new Set([...selectedCreatures, ...allIds])];
    onChange(newSelection);
  };

  const deselectAll = () => {
    const pageIds = paginatedCreatures.map(c => c.id);
    onChange(selectedCreatures.filter(id => !pageIds.includes(id)));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">
          Creatures ({selectedCreatures.length} selected)
        </h4>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs px-2 py-1 bg-green-600/20 text-green-300 rounded hover:bg-green-600/30"
          >
            Select Page
          </button>
          <button
            onClick={deselectAll}
            className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
          >
            Deselect Page
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search creatures..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 mb-3"
      />

      {loading ? (
        <div className="text-white/60 text-center py-4">Loading creatures...</div>
      ) : filteredCreatures.length === 0 ? (
        <div className="text-white/60 text-center py-4">No creatures found</div>
      ) : (
        <>
          {/* Checkbox List */}
          <div className="max-h-60 overflow-y-auto space-y-1 mb-3">
            {paginatedCreatures.map(creature => (
              <label
                key={creature.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCreatures.includes(creature.id)}
                  onChange={() => toggleCreature(creature.id)}
                  className="w-4 h-4 rounded border-white/20"
                />
                <span className="text-white text-sm">{creature.name}</span>
              </label>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-white/60">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Languages Form Component
function LanguagesForm({
  realmIndex,
  languages,
  onChange
}: {
  realmIndex: number;
  languages: RealmLanguage[];
  onChange: (languages: RealmLanguage[]) => void;
}) {
  const addLanguage = () => {
    const newLanguage: RealmLanguage = {
      id: `lang-${Date.now()}-${Math.random()}`,
      name: "",
      script: "",
      speakerCount: "",
      notes: ""
    };
    onChange([...languages, newLanguage]);
  };

  const removeLanguage = (id: string) => {
    onChange(languages.filter(l => l.id !== id));
  };

  const updateLanguage = (id: string, field: keyof RealmLanguage, value: string) => {
    onChange(languages.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Languages ({languages.length})</h4>
        <button
          onClick={addLanguage}
          className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 text-sm"
        >
          + Add Language
        </button>
      </div>

      {languages.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No languages defined yet</div>
      ) : (
        <div className="space-y-3">
          {languages.map((lang) => (
            <div key={lang.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Language Name</label>
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                    placeholder="e.g., Common, Elvish, Draconic"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Script/Writing System</label>
                  <input
                    type="text"
                    value={lang.script}
                    onChange={(e) => updateLanguage(lang.id, 'script', e.target.value)}
                    placeholder="e.g., Latin, Runic, Pictographic"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Speaker Count/Distribution</label>
                <input
                  type="text"
                  value={lang.speakerCount}
                  onChange={(e) => updateLanguage(lang.id, 'speakerCount', e.target.value)}
                  placeholder="e.g., 10 million speakers, widespread, rare"
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={lang.notes}
                  onChange={(e) => updateLanguage(lang.id, 'notes', e.target.value)}
                  placeholder="Additional details, dialects, cultural significance..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeLanguage(lang.id)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Deities Form Component
function DeitiesForm({
  realmIndex,
  deities,
  onChange
}: {
  realmIndex: number;
  deities: RealmDeity[];
  onChange: (deities: RealmDeity[]) => void;
}) {
  const addDeity = () => {
    const newDeity: RealmDeity = {
      id: `deity-${Date.now()}-${Math.random()}`,
      name: "",
      domain: "",
      alignment: "",
      symbol: "",
      notes: ""
    };
    onChange([...deities, newDeity]);
  };

  const removeDeity = (id: string) => {
    onChange(deities.filter(d => d.id !== id));
  };

  const updateDeity = (id: string, field: keyof RealmDeity, value: string) => {
    onChange(deities.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Deities ({deities.length})</h4>
        <button
          onClick={addDeity}
          className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 text-sm"
        >
          + Add Deity
        </button>
      </div>

      {deities.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No deities defined yet</div>
      ) : (
        <div className="space-y-3">
          {deities.map((deity) => (
            <div key={deity.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Deity Name</label>
                  <input
                    type="text"
                    value={deity.name}
                    onChange={(e) => updateDeity(deity.id, 'name', e.target.value)}
                    placeholder="e.g., Thor, Athena, Bahamut"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Domain/Portfolio</label>
                  <input
                    type="text"
                    value={deity.domain}
                    onChange={(e) => updateDeity(deity.id, 'domain', e.target.value)}
                    placeholder="e.g., War, Wisdom, Dragons"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Alignment</label>
                  <input
                    type="text"
                    value={deity.alignment}
                    onChange={(e) => updateDeity(deity.id, 'alignment', e.target.value)}
                    placeholder="e.g., Lawful Good, Chaotic Neutral"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Holy Symbol</label>
                  <input
                    type="text"
                    value={deity.symbol}
                    onChange={(e) => updateDeity(deity.id, 'symbol', e.target.value)}
                    placeholder="e.g., Lightning bolt, Owl, Five-headed dragon"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={deity.notes}
                  onChange={(e) => updateDeity(deity.id, 'notes', e.target.value)}
                  placeholder="Followers, temples, divine powers, mythology..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeDeity(deity.id)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Factions Form Component
function FactionsForm({
  realmIndex,
  factions,
  onChange
}: {
  realmIndex: number;
  factions: RealmFaction[];
  onChange: (factions: RealmFaction[]) => void;
}) {
  const addFaction = () => {
    const newFaction: RealmFaction = {
      id: `faction-${Date.now()}-${Math.random()}`,
      name: "",
      type: "",
      alignment: "",
      goals: "",
      notes: ""
    };
    onChange([...factions, newFaction]);
  };

  const removeFaction = (id: string) => {
    onChange(factions.filter(f => f.id !== id));
  };

  const updateFaction = (id: string, field: keyof RealmFaction, value: string) => {
    onChange(factions.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Factions/Organizations ({factions.length})</h4>
        <button
          onClick={addFaction}
          className="px-3 py-1 bg-amber-600/20 text-amber-300 rounded hover:bg-amber-600/30 text-sm"
        >
          + Add Faction
        </button>
      </div>

      {factions.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No factions defined yet</div>
      ) : (
        <div className="space-y-3">
          {factions.map((faction) => (
            <div key={faction.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Faction Name</label>
                  <input
                    type="text"
                    value={faction.name}
                    onChange={(e) => updateFaction(faction.id, 'name', e.target.value)}
                    placeholder="e.g., The Harpers, Thieves' Guild"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Type</label>
                  <input
                    type="text"
                    value={faction.type}
                    onChange={(e) => updateFaction(faction.id, 'type', e.target.value)}
                    placeholder="e.g., Guild, Government, Religion, Military"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Alignment/Philosophy</label>
                <input
                  type="text"
                  value={faction.alignment}
                  onChange={(e) => updateFaction(faction.id, 'alignment', e.target.value)}
                  placeholder="e.g., Neutral Good, Profit-driven, Chaotic"
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Goals/Mission</label>
                <textarea
                  value={faction.goals}
                  onChange={(e) => updateFaction(faction.id, 'goals', e.target.value)}
                  placeholder="Primary objectives, what they're trying to achieve..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={faction.notes}
                  onChange={(e) => updateFaction(faction.id, 'notes', e.target.value)}
                  placeholder="Leadership, resources, territories, allies, enemies..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeFaction(faction.id)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Organizations Form Component (using RealmOrganization interface)
function OrganizationsForm({
  realmIndex,
  organizations,
  onChange
}: {
  realmIndex: number;
  organizations: RealmOrganization[];
  onChange: (orgs: RealmOrganization[]) => void;
}) {
  const addOrganization = () => {
    const newOrg: RealmOrganization = {
      name: "",
      type: "",
      notes: ""
    };
    onChange([...organizations, newOrg]);
  };

  const removeOrganization = (index: number) => {
    onChange(organizations.filter((_, i) => i !== index));
  };

  const updateOrganization = (index: number, field: keyof RealmOrganization, value: string) => {
    onChange(organizations.map((org, i) => i === index ? { ...org, [field]: value } : org));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Organizations ({organizations.length})</h4>
        <button
          onClick={addOrganization}
          className="px-3 py-1 bg-teal-600/20 text-teal-300 rounded hover:bg-teal-600/30 text-sm"
        >
          + Add Organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No organizations defined yet</div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={org.name}
                    onChange={(e) => updateOrganization(idx, 'name', e.target.value)}
                    placeholder="e.g., Mages Guild, Trade Consortium"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Type</label>
                  <input
                    type="text"
                    value={org.type}
                    onChange={(e) => updateOrganization(idx, 'type', e.target.value)}
                    placeholder="e.g., Guild, Cult, Order, Company"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={org.notes}
                  onChange={(e) => updateOrganization(idx, 'notes', e.target.value)}
                  placeholder="Purpose, structure, influence..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeOrganization(idx)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Phenomena Form Component
function PhenomenaForm({
  realmIndex,
  phenomena,
  onChange
}: {
  realmIndex: number;
  phenomena: RealmPhenomenon[];
  onChange: (phenom: RealmPhenomenon[]) => void;
}) {
  const addPhenomenon = () => {
    const newPhenomenon: RealmPhenomenon = {
      name: "",
      type: "",
      notes: ""
    };
    onChange([...phenomena, newPhenomenon]);
  };

  const removePhenomenon = (index: number) => {
    onChange(phenomena.filter((_, i) => i !== index));
  };

  const updatePhenomenon = (index: number, field: keyof RealmPhenomenon, value: string) => {
    onChange(phenomena.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Phenomena ({phenomena.length})</h4>
        <button
          onClick={addPhenomenon}
          className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded hover:bg-indigo-600/30 text-sm"
        >
          + Add Phenomenon
        </button>
      </div>

      {phenomena.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No phenomena defined yet</div>
      ) : (
        <div className="space-y-3">
          {phenomena.map((phenom, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Phenomenon Name</label>
                  <input
                    type="text"
                    value={phenom.name}
                    onChange={(e) => updatePhenomenon(idx, 'name', e.target.value)}
                    placeholder="e.g., Magical Storm, Reality Rift"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Type</label>
                  <input
                    type="text"
                    value={phenom.type}
                    onChange={(e) => updatePhenomenon(idx, 'type', e.target.value)}
                    placeholder="e.g., Natural, Magical, Planar"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={phenom.notes}
                  onChange={(e) => updatePhenomenon(idx, 'notes', e.target.value)}
                  placeholder="Effects, frequency, locations..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removePhenomenon(idx)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Trade Goods Form Component
function TradeGoodsForm({
  realmIndex,
  tradeGoods,
  onChange
}: {
  realmIndex: number;
  tradeGoods: RealmTradeGood[];
  onChange: (goods: RealmTradeGood[]) => void;
}) {
  const addTradeGood = () => {
    const newGood: RealmTradeGood = {
      name: "",
      value: "",
      notes: ""
    };
    onChange([...tradeGoods, newGood]);
  };

  const removeTradeGood = (index: number) => {
    onChange(tradeGoods.filter((_, i) => i !== index));
  };

  const updateTradeGood = (index: number, field: keyof RealmTradeGood, value: string) => {
    onChange(tradeGoods.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Trade Goods ({tradeGoods.length})</h4>
        <button
          onClick={addTradeGood}
          className="px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded hover:bg-emerald-600/30 text-sm"
        >
          + Add Trade Good
        </button>
      </div>

      {tradeGoods.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No trade goods defined yet</div>
      ) : (
        <div className="space-y-3">
          {tradeGoods.map((good, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={good.name}
                    onChange={(e) => updateTradeGood(idx, 'name', e.target.value)}
                    placeholder="e.g., Spices, Silk, Mithril Ore"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Value/Price</label>
                  <input
                    type="text"
                    value={good.value}
                    onChange={(e) => updateTradeGood(idx, 'value', e.target.value)}
                    placeholder="e.g., 50gp/lb, Very Expensive"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={good.notes}
                  onChange={(e) => updateTradeGood(idx, 'notes', e.target.value)}
                  placeholder="Origin, demand, trade routes..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeTradeGood(idx)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Items Form Component
function ItemsForm({
  realmIndex,
  items,
  onChange
}: {
  realmIndex: number;
  items: RealmItem[];
  onChange: (items: RealmItem[]) => void;
}) {
  const addItem = () => {
    const newItem: RealmItem = {
      name: "",
      rarity: "",
      notes: ""
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RealmItem, value: string) => {
    onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Special Items ({items.length})</h4>
        <button
          onClick={addItem}
          className="px-3 py-1 bg-cyan-600/20 text-cyan-300 rounded hover:bg-cyan-600/30 text-sm"
        >
          + Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No special items defined yet</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    placeholder="e.g., Flaming Sword, Ring of Protection"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Rarity</label>
                  <input
                    type="text"
                    value={item.rarity}
                    onChange={(e) => updateItem(idx, 'rarity', e.target.value)}
                    placeholder="e.g., Common, Rare, Legendary"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={item.notes}
                  onChange={(e) => updateItem(idx, 'notes', e.target.value)}
                  placeholder="Properties, abilities, history..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeItem(idx)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Relics Form Component
function RelicsForm({
  realmIndex,
  relics,
  onChange
}: {
  realmIndex: number;
  relics: RealmRelic[];
  onChange: (relics: RealmRelic[]) => void;
}) {
  const addRelic = () => {
    const newRelic: RealmRelic = {
      name: "",
      power: "",
      notes: ""
    };
    onChange([...relics, newRelic]);
  };

  const removeRelic = (index: number) => {
    onChange(relics.filter((_, i) => i !== index));
  };

  const updateRelic = (index: number, field: keyof RealmRelic, value: string) => {
    onChange(relics.map((relic, i) => i === index ? { ...relic, [field]: value } : relic));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Relics & Artifacts ({relics.length})</h4>
        <button
          onClick={addRelic}
          className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded hover:bg-yellow-600/30 text-sm"
        >
          + Add Relic
        </button>
      </div>

      {relics.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No relics defined yet</div>
      ) : (
        <div className="space-y-3">
          {relics.map((relic, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Relic Name</label>
                  <input
                    type="text"
                    value={relic.name}
                    onChange={(e) => updateRelic(idx, 'name', e.target.value)}
                    placeholder="e.g., Eye of Vecna, Holy Grail"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Power Level</label>
                  <input
                    type="text"
                    value={relic.power}
                    onChange={(e) => updateRelic(idx, 'power', e.target.value)}
                    placeholder="e.g., Artifact, Legendary, Divine"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={relic.notes}
                  onChange={(e) => updateRelic(idx, 'notes', e.target.value)}
                  placeholder="Powers, history, current location, dangers..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeRelic(idx)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Taboos Form Component
function TaboosForm({
  realmIndex,
  taboos,
  onChange
}: {
  realmIndex: number;
  taboos: RealmTaboo[];
  onChange: (taboos: RealmTaboo[]) => void;
}) {
  const addTaboo = () => {
    const newTaboo: RealmTaboo = {
      name: "",
      severity: "",
      notes: ""
    };
    onChange([...taboos, newTaboo]);
  };

  const removeTaboo = (index: number) => {
    onChange(taboos.filter((_, i) => i !== index));
  };

  const updateTaboo = (index: number, field: keyof RealmTaboo, value: string) => {
    onChange(taboos.map((taboo, i) => i === index ? { ...taboo, [field]: value } : taboo));
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-white">Taboos & Forbidden Acts ({taboos.length})</h4>
        <button
          onClick={addTaboo}
          className="px-3 py-1 bg-rose-600/20 text-rose-300 rounded hover:bg-rose-600/30 text-sm"
        >
          + Add Taboo
        </button>
      </div>

      {taboos.length === 0 ? (
        <div className="text-white/60 text-center py-4 text-sm">No taboos defined yet</div>
      ) : (
        <div className="space-y-3">
          {taboos.map((taboo, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Taboo/Forbidden Act</label>
                  <input
                    type="text"
                    value={taboo.name}
                    onChange={(e) => updateTaboo(idx, 'name', e.target.value)}
                    placeholder="e.g., Speaking the Dead God's Name"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">Severity</label>
                  <input
                    type="text"
                    value={taboo.severity}
                    onChange={(e) => updateTaboo(idx, 'severity', e.target.value)}
                    placeholder="e.g., Minor, Major, Death Sentence"
                    className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={taboo.notes}
                  onChange={(e) => updateTaboo(idx, 'notes', e.target.value)}
                  placeholder="Why forbidden, consequences, exceptions..."
                  rows={2}
                  className="w-full rounded bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <button
                onClick={() => removeTaboo(idx)}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function CosmologyRealmsForm({ data, onUpdate }: CosmologyRealmsFormProps) {
  const [expandedRealm, setExpandedRealm] = useState<number | null>(null);
  
  const addRealm = () => {
    const newRealm: RealmData = {
      name: "",
      type: "",
      traits: "",
      travelRules: "",
      bleedThrough: "",
      playerSummary: "",
      gmNotes: "",
      availability: 'available',
      selectedRaces: [],
      selectedCreatures: [],
      realmLanguages: [],
      realmDeities: [],
      realmFactions: [],
      races: [],
      creatures: [],
      deities: [],
      languages: [],
      organizations: [],
      phenomena: [],
      tradeGoods: [],
      items: [],
      relics: [],
      taboos: []
    };
    onUpdate({ realms: [...(data.realms || []), newRealm] });
  };

  const removeRealm = (index: number) => {
    const updated = [...(data.realms || [])];
    updated.splice(index, 1);
    onUpdate({ realms: updated });
    if (expandedRealm === index) setExpandedRealm(null);
  };

  const updateRealm = (index: number, field: keyof RealmData, value: any) => {
    const updated = [...(data.realms || [])];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ realms: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Cosmology & Realms</h2>
        <button
          onClick={addRealm}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          + Add Realm
        </button>
      </div>

      {(!data.realms || data.realms.length === 0) ? (
        <div className="text-center text-white/60 py-12 border-2 border-dashed border-white/20 rounded-lg">
          No realms defined yet. Click "+ Add Realm" to create your first realm.
        </div>
      ) : (
        <div className="space-y-4">
          {data.realms.map((realm, index) => (
            <div key={index} className="border border-white/20 rounded-lg bg-black/20 overflow-hidden">
              {/* Realm Header */}
              <div className="flex items-center justify-between p-4 bg-amber-900/20">
                <button
                  onClick={() => setExpandedRealm(expandedRealm === index ? null : index)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span className="text-white text-xl">
                    {expandedRealm === index ? '▼' : '▶'}
                  </span>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-white">
                      {realm.name || `Unnamed Realm ${index + 1}`}
                    </div>
                    <div className="text-sm text-white/60">
                      {realm.type || 'No type set'} 
                      {realm.availability === 'sealed' && ' • 🔒 Sealed'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => removeRealm(index)}
                  className="ml-4 px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-sm rounded transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Realm Details (Expanded) */}
              {expandedRealm === index && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Realm Name</label>
                      <input
                        type="text"
                        value={realm.name}
                        onChange={(e) => updateRealm(index, 'name', e.target.value)}
                        placeholder="e.g., The Material Plane, Shadowfell"
                        className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Realm Type</label>
                      <select
                        value={realm.type}
                        onChange={(e) => updateRealm(index, 'type', e.target.value)}
                        className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="" disabled className="bg-zinc-800 text-white">Select type...</option>
                        <option value="Material" className="bg-zinc-800 text-white">Material Plane</option>
                        <option value="Shadow" className="bg-zinc-800 text-white">Shadow Plane</option>
                        <option value="Dream" className="bg-zinc-800 text-white">Dream Plane</option>
                        <option value="Elemental" className="bg-zinc-800 text-white">Elemental Plane</option>
                        <option value="Celestial" className="bg-zinc-800 text-white">Celestial Plane</option>
                        <option value="Infernal" className="bg-zinc-800 text-white">Infernal Plane</option>
                        <option value="Astral" className="bg-zinc-800 text-white">Astral Plane</option>
                        <option value="Ethereal" className="bg-zinc-800 text-white">Ethereal Plane</option>
                        <option value="Fey" className="bg-zinc-800 text-white">Feywild</option>
                        <option value="Divine" className="bg-zinc-800 text-white">Divine Realm</option>
                        <option value="Dead" className="bg-zinc-800 text-white">Realm of the Dead</option>
                        <option value="Custom" className="bg-zinc-800 text-white">Custom Type</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Defining Traits</label>
                    <textarea
                      value={realm.traits}
                      onChange={(e) => updateRealm(index, 'traits', e.target.value)}
                      placeholder="What makes this realm unique? Physical laws, atmosphere, magic properties..."
                      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Travel Rules</label>
                    <textarea
                      value={realm.travelRules}
                      onChange={(e) => updateRealm(index, 'travelRules', e.target.value)}
                      placeholder="How do creatures enter/exit this realm?"
                      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 min-h-[60px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bleed-Through</label>
                    <textarea
                      value={realm.bleedThrough}
                      onChange={(e) => updateRealm(index, 'bleedThrough', e.target.value)}
                      placeholder="Does this realm influence the material world?"
                      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 min-h-[60px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Player Summary</label>
                      <textarea
                        value={realm.playerSummary}
                        onChange={(e) => updateRealm(index, 'playerSummary', e.target.value)}
                        placeholder="What players know about this realm"
                        className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 min-h-[80px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">GM Notes</label>
                      <textarea
                        value={realm.gmNotes}
                        onChange={(e) => updateRealm(index, 'gmNotes', e.target.value)}
                        placeholder="Secret lore, plot hooks, hidden truths"
                        className="w-full rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Availability</label>
                    <select
                      value={realm.availability}
                      onChange={(e) => updateRealm(index, 'availability', e.target.value)}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="available" className="bg-zinc-800 text-white">Available (Eras can use)</option>
                      <option value="sealed" className="bg-zinc-800 text-white">Sealed (Eras may activate)</option>
                    </select>
                    <p className="text-sm text-white/60 mt-1">
                      Sealed realms can be activated/deactivated by specific Eras
                    </p>
                  </div>

                  {/* Realm-Bound Catalogs */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Available Races & Creatures</h3>
                    <p className="text-sm text-white/60 mb-4">
                      Select which races and creatures are available in this realm (checked = available in world)
                    </p>
                    
                    {/* Races Section */}
                    <RacesSelector
                      realmIndex={index}
                      selectedRaces={realm.selectedRaces || []}
                      onChange={(ids) => updateRealm(index, 'selectedRaces', ids)}
                    />
                    
                    {/* Creatures Section */}
                    <CreaturesSelector
                      realmIndex={index}
                      selectedCreatures={realm.selectedCreatures || []}
                      onChange={(ids) => updateRealm(index, 'selectedCreatures', ids)}
                    />
                  </div>

                  {/* Languages, Deities, and Factions */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Languages, Deities & Factions</h3>
                    <p className="text-sm text-white/60 mb-4">
                      Define the languages, gods, and organizations native to this realm
                    </p>
                    
                    <LanguagesForm
                      realmIndex={index}
                      languages={realm.realmLanguages || []}
                      onChange={(langs) => updateRealm(index, 'realmLanguages', langs)}
                    />
                    
                    <DeitiesForm
                      realmIndex={index}
                      deities={realm.realmDeities || []}
                      onChange={(deities) => updateRealm(index, 'realmDeities', deities)}
                    />
                    
                    <FactionsForm
                      realmIndex={index}
                      factions={realm.realmFactions || []}
                      onChange={(factions) => updateRealm(index, 'realmFactions', factions)}
                    />
                  </div>

                  {/* Optional Modules */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Optional Content</h3>
                    <p className="text-sm text-white/60 mb-4">
                      Add realm-specific organizations, phenomena, trade goods, special items, relics, and taboos
                    </p>
                    
                    <OrganizationsForm
                      realmIndex={index}
                      organizations={realm.organizations || []}
                      onChange={(orgs) => updateRealm(index, 'organizations', orgs)}
                    />
                    
                    <PhenomenaForm
                      realmIndex={index}
                      phenomena={realm.phenomena || []}
                      onChange={(phenom) => updateRealm(index, 'phenomena', phenom)}
                    />
                    
                    <TradeGoodsForm
                      realmIndex={index}
                      tradeGoods={realm.tradeGoods || []}
                      onChange={(goods) => updateRealm(index, 'tradeGoods', goods)}
                    />
                    
                    <ItemsForm
                      realmIndex={index}
                      items={realm.items || []}
                      onChange={(items) => updateRealm(index, 'items', items)}
                    />
                    
                    <RelicsForm
                      realmIndex={index}
                      relics={realm.relics || []}
                      onChange={(relics) => updateRealm(index, 'relics', relics)}
                    />
                    
                    <TaboosForm
                      realmIndex={index}
                      taboos={realm.taboos || []}
                      onChange={(taboos) => updateRealm(index, 'taboos', taboos)}
                    />
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
