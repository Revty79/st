"use client";

import { useState, useEffect } from "react";

// Reusable UI components
const Input = ({ value, onCommit, placeholder, className, maxLength }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}) => {
  const [raw, setRaw] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };

  const handleBlur = () => {
    onCommit(raw);
  };

  return (
    <input
      type="text"
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${className || ""}`}
    />
  );
};

const Textarea = ({ value, onCommit, placeholder, className, maxLength }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}) => {
  const [raw, setRaw] = useState(value || "");
  const [charCount, setCharCount] = useState(raw.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRaw(newValue);
    setCharCount(newValue.length);
  };

  const handleBlur = () => {
    onCommit(raw);
  };

  return (
    <div className="relative">
      <textarea
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 resize-y ${className || ""}`}
        rows={3}
      />
      {maxLength && (
        <div className="text-sm text-white mt-1 text-right">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
};

const TagInput = ({ values, onCommit, placeholder, maxTags, maxLength }: {
  values: string[];
  onCommit: (values: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    if (tag.trim() && !values.includes(tag.trim())) {
      if (!maxTags || values.length < maxTags) {
        onCommit([...values, tag.trim()]);
        setInputValue("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    onCommit(values.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && values.length > 0) {
      removeTag(values.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {values.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 bg-amber-500 text-black text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-amber-800 hover:text-black"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={maxTags && values.length >= maxTags ? `Max ${maxTags} tags reached` : placeholder}
        disabled={!!(maxTags && values.length >= maxTags)}
        maxLength={maxLength}
        className={`w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${
          !!(maxTags && values.length >= maxTags) ? "opacity-50" : ""
        }`}
      />
      {maxTags && (
        <div className="text-xs text-white">
          {values.length}/{maxTags} tags
        </div>
      )}
    </div>
  );
};

// Data interfaces
export interface LanguageFamilyData {
  name: string;
  description: string;
  languages: string[];
  writingSystem: string;
  speakers: string;
  status: string;
}

export interface OrganizationData {
  name: string;
  type: string;
  scope: string;
  viewpoint: string;
  goals: string;
  structure: string;
  membership: string;
  resources: string;
  reputation: string;
  rivals: string[];
  allies: string[];
}

export interface MasterCatalogsData {
  languageFamilies: LanguageFamilyData[];
  organizations: OrganizationData[];
  selectedRaceIds: number[];
  selectedCreatureIds: number[];
  organizationTypes: string[];
  itemCategories: string[];
  rarityLevels: string[];
  notes: string;
}

interface MasterCatalogsFormProps {
  data: MasterCatalogsData;
  onUpdate: (data: Partial<MasterCatalogsData>) => void;
}

export default function MasterCatalogsForm({ data, onUpdate }: MasterCatalogsFormProps) {
  // State for available races and creatures
  const [availableRaces, setAvailableRaces] = useState<Array<{ id: number; name: string }>>([]);
  const [availableCreatures, setAvailableCreatures] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingCreatures, setLoadingCreatures] = useState(true);

  // Load available races and creatures from API
  useEffect(() => {
    const loadRaces = async () => {
      try {
        const response = await fetch("/api/races?lite=true");
        const result = await response.json();
        if (result.ok) {
          setAvailableRaces(result.data || []);
        }
      } catch (error) {
        console.error("Failed to load races:", error);
      } finally {
        setLoadingRaces(false);
      }
    };

    const loadCreatures = async () => {
      try {
        const response = await fetch("/api/creatures");
        const result = await response.json();
        if (result.ok) {
          // Map creatures to simple {id, name} format
          const creatures = (result.data || []).map((c: any) => ({ id: c.id, name: c.name }));
          setAvailableCreatures(creatures);
        }
      } catch (error) {
        console.error("Failed to load creatures:", error);
      } finally {
        setLoadingCreatures(false);
      }
    };

    loadRaces();
    loadCreatures();
  }, []);

  // Ensure arrays are never undefined, including nested arrays
  const safeData = {
    ...data,
    languageFamilies: (data.languageFamilies || []).map(fam => ({
      ...fam,
      languages: fam.languages || []
    })),
    organizations: (data.organizations || []).map(org => ({
      ...org,
      rivals: org.rivals || [],
      allies: org.allies || []
    })),
    selectedRaceIds: data.selectedRaceIds || [],
    selectedCreatureIds: data.selectedCreatureIds || [],
    organizationTypes: data.organizationTypes || [],
    itemCategories: data.itemCategories || [],
    rarityLevels: data.rarityLevels || []
  };

  const languageStatusOptions = [
    { value: "", label: "Select status..." },
    { value: "Thriving", label: "Thriving" },
    { value: "Common", label: "Common" },
    { value: "Regional", label: "Regional" },
    { value: "Declining", label: "Declining" },
    { value: "Endangered", label: "Endangered" },
    { value: "Dead", label: "Dead/Ancient" },
    { value: "Sacred", label: "Sacred/Liturgical" },
    { value: "Trade", label: "Trade Language" },
    { value: "Secret", label: "Secret/Coded" }
  ];

  const organizationScopeOptions = [
    { value: "", label: "Select scope..." },
    { value: "Local", label: "Local" },
    { value: "Regional", label: "Regional" },
    { value: "National", label: "National" },
    { value: "International", label: "International" },
    { value: "Continental", label: "Continental" },
    { value: "Global", label: "Global" },
    { value: "Planar", label: "Planar" },
    { value: "Cosmic", label: "Cosmic" }
  ];

  const viewpointOptions = [
    { value: "", label: "Select viewpoint..." },
    { value: "Benevolent", label: "Benevolent" },
    { value: "Protective", label: "Protective" },
    { value: "Progressive", label: "Progressive" },
    { value: "Conservative", label: "Conservative" },
    { value: "Neutral", label: "Neutral" },
    { value: "Opportunistic", label: "Opportunistic" },
    { value: "Ruthless", label: "Ruthless" },
    { value: "Exploitative", label: "Exploitative" },
    { value: "Secretive", label: "Secretive" },
    { value: "Idealistic", label: "Idealistic" },
    { value: "Pragmatic", label: "Pragmatic" }
  ];

  const defaultOrgTypes = [
    "Guild", "Religious Order", "Military", "Trading Company", "Academic", "Government",
    "Criminal", "Mercenary", "Exploration", "Magical Society", "Secret Society", "Cult"
  ];

  const defaultItemCategories = [
    "Weapons", "Armor", "Tools", "Consumables", "Materials", "Art Objects",
    "Books", "Clothing", "Jewelry", "Transportation", "Containers", "Musical Instruments"
  ];

  const defaultRarityLevels = [
    "Ubiquitous", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"
  ];

  // Helper functions for Language Families
  const addLanguageFamily = () => {
    const newFamilies = [...safeData.languageFamilies, {
      name: "", description: "", languages: [], writingSystem: "",
      speakers: "", status: ""
    }];
    onUpdate({ languageFamilies: newFamilies });
  };

  const removeLanguageFamily = (index: number) => {
    const newFamilies = safeData.languageFamilies.filter((_, i) => i !== index);
    onUpdate({ languageFamilies: newFamilies });
  };

  const updateLanguageFamily = (index: number, updates: Partial<LanguageFamilyData>) => {
    const newFamilies = safeData.languageFamilies.map((family, i) =>
      i === index ? { ...family, ...updates } : family
    );
    onUpdate({ languageFamilies: newFamilies });
  };

  // Helper functions for Organizations
  const addOrganization = () => {
    const newOrgs = [...safeData.organizations, {
      name: "", type: "", scope: "", viewpoint: "", goals: "",
      structure: "", membership: "", resources: "", reputation: "",
      rivals: [], allies: []
    }];
    onUpdate({ organizations: newOrgs });
  };

  const removeOrganization = (index: number) => {
    const newOrgs = safeData.organizations.filter((_, i) => i !== index);
    onUpdate({ organizations: newOrgs });
  };

  const updateOrganization = (index: number, updates: Partial<OrganizationData>) => {
    const newOrgs = safeData.organizations.map((org, i) =>
      i === index ? { ...org, ...updates } : org
    );
    onUpdate({ organizations: newOrgs });
  };

  // Helper functions for Races/Creatures selection
  const toggleRace = (raceId: number) => {
    const newIds = safeData.selectedRaceIds.includes(raceId)
      ? safeData.selectedRaceIds.filter(id => id !== raceId)
      : [...safeData.selectedRaceIds, raceId];
    onUpdate({ selectedRaceIds: newIds });
  };

  const toggleCreature = (creatureId: number) => {
    const newIds = safeData.selectedCreatureIds.includes(creatureId)
      ? safeData.selectedCreatureIds.filter(id => id !== creatureId)
      : [...safeData.selectedCreatureIds, creatureId];
    onUpdate({ selectedCreatureIds: newIds });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Master Catalogs — Player Lore; G.O.D Framework</h2>
        <p className="text-sm text-white mt-1">
          Comprehensive catalogs of languages, currencies, organizations, and common items in your world.
        </p>
      </div>

      <div className="space-y-8">
        {/* Custom Categories Management */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Organization Types
            </label>
            <p className="text-xs text-white mb-2">
              Types of organizations in your world.
            </p>
            <TagInput
              values={safeData.organizationTypes.length > 0 ? safeData.organizationTypes : defaultOrgTypes}
              onCommit={(values) => onUpdate({ organizationTypes: values })}
              placeholder="Add organization type..."
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Item Categories
            </label>
            <p className="text-xs text-white mb-2">
              Categories for common items.
            </p>
            <TagInput
              values={safeData.itemCategories.length > 0 ? safeData.itemCategories : defaultItemCategories}
              onCommit={(values) => onUpdate({ itemCategories: values })}
              placeholder="Add item category..."
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Rarity Levels
            </label>
            <p className="text-xs text-white mb-2">
              Rarity classifications for items.
            </p>
            <TagInput
              values={safeData.rarityLevels.length > 0 ? safeData.rarityLevels : defaultRarityLevels}
              onCommit={(values) => onUpdate({ rarityLevels: values })}
              placeholder="Add rarity level..."
              maxLength={20}
            />
          </div>
        </div>

        {/* Language Families */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Language Families
            </label>
            <button
              type="button"
              onClick={addLanguageFamily}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Language Family
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Linguistic groups and individual languages in your world.
          </p>

          <div className="space-y-4">
            {safeData.languageFamilies.map((family, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    {family.name || `Language Family ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeLanguageFamily(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Family Name
                    </label>
                    <Input
                      value={family.name}
                      onCommit={(value) => updateLanguageFamily(index, { name: value })}
                      placeholder="Family name..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Writing System
                    </label>
                    <Input
                      value={family.writingSystem}
                      onCommit={(value) => updateLanguageFamily(index, { writingSystem: value })}
                      placeholder="Alphabetic, logographic, etc..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Status
                    </label>
                    <select
                      value={family.status}
                      onChange={(e) => updateLanguageFamily(index, { status: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {languageStatusOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-medium text-white mb-1">
                      Description
                    </label>
                    <Textarea
                      value={family.description}
                      onCommit={(value) => updateLanguageFamily(index, { description: value })}
                      placeholder="Describe this language family..."
                      maxLength={300}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Languages
                    </label>
                    <TagInput
                      values={family.languages}
                      onCommit={(values) => updateLanguageFamily(index, { languages: values })}
                      placeholder="Add language..."
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Speakers
                    </label>
                    <Input
                      value={family.speakers}
                      onCommit={(value) => updateLanguageFamily(index, { speakers: value })}
                      placeholder="Who speaks these languages..."
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizations */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Organizations & Factions
            </label>
            <button
              type="button"
              onClick={addOrganization}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Organization
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Important organizations, guilds, and factions in your world.
          </p>

          <div className="space-y-4">
            {safeData.organizations.map((org, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    {org.name || `Organization ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeOrganization(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Name
                    </label>
                    <Input
                      value={org.name}
                      onCommit={(value) => updateOrganization(index, { name: value })}
                      placeholder="Organization name..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Type
                    </label>
                    <select
                      value={org.type}
                      onChange={(e) => updateOrganization(index, { type: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="" className="bg-zinc-800 text-white">Select type...</option>
                      {(safeData.organizationTypes.length > 0 ? safeData.organizationTypes : defaultOrgTypes).map((type) => (
                        <option key={type} value={type} className="bg-zinc-800 text-white">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Scope
                    </label>
                    <select
                      value={org.scope}
                      onChange={(e) => updateOrganization(index, { scope: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {organizationScopeOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Viewpoint/Philosophy
                    </label>
                    <select
                      value={org.viewpoint}
                      onChange={(e) => updateOrganization(index, { viewpoint: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-zinc-200 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {viewpointOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-800 text-zinc-200">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-white mb-1">
                      Goals
                    </label>
                    <Textarea
                      value={org.goals}
                      onCommit={(value) => updateOrganization(index, { goals: value })}
                      placeholder="What does this organization want to achieve..."
                      maxLength={200}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-white mb-1">
                      Structure
                    </label>
                    <Textarea
                      value={org.structure}
                      onCommit={(value) => updateOrganization(index, { structure: value })}
                      placeholder="How is the organization structured..."
                      maxLength={200}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-white mb-1">
                      Membership
                    </label>
                    <Textarea
                      value={org.membership}
                      onCommit={(value) => updateOrganization(index, { membership: value })}
                      placeholder="Who can join and how..."
                      maxLength={150}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-white mb-1">
                      Resources
                    </label>
                    <Textarea
                      value={org.resources}
                      onCommit={(value) => updateOrganization(index, { resources: value })}
                      placeholder="Funding, equipment, connections..."
                      maxLength={150}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-white mb-1">
                      Reputation
                    </label>
                    <Textarea
                      value={org.reputation}
                      onCommit={(value) => updateOrganization(index, { reputation: value })}
                      placeholder="How is this organization viewed..."
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Rivals
                    </label>
                    <TagInput
                      values={org.rivals}
                      onCommit={(values) => updateOrganization(index, { rivals: values })}
                      placeholder="Add rival organization..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Allies
                    </label>
                    <TagInput
                      values={org.allies}
                      onCommit={(values) => updateOrganization(index, { allies: values })}
                      placeholder="Add allied organization..."
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Races Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Races in World
          </label>
          <p className="text-xs text-white mb-4">
            Select which races exist in this world.
          </p>
          
          {loadingRaces ? (
            <div className="text-zinc-400 text-sm">Loading races...</div>
          ) : availableRaces.length === 0 ? (
            <div className="text-zinc-400 text-sm">No races available. Create races first.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableRaces.map((race) => (
                <label key={race.id} className="flex items-center space-x-2 p-2 rounded border border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safeData.selectedRaceIds.includes(race.id)}
                    onChange={() => toggleRace(race.id)}
                    className="rounded border-white/20 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-sm text-white">{race.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Creatures Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Creatures in World
          </label>
          <p className="text-xs text-white mb-4">
            Select which creatures exist in this world.
          </p>
          
          {loadingCreatures ? (
            <div className="text-zinc-400 text-sm">Loading creatures...</div>
          ) : availableCreatures.length === 0 ? (
            <div className="text-zinc-400 text-sm">No creatures available. Create creatures first.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableCreatures.map((creature) => (
                <label key={creature.id} className="flex items-center space-x-2 p-2 rounded border border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safeData.selectedCreatureIds.includes(creature.id)}
                    onChange={() => toggleCreature(creature.id)}
                    className="rounded border-white/20 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-sm text-white">{creature.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Additional Catalog Notes
          </label>
          <p className="text-xs text-white mb-2">
            Any other important information about your world's catalogs and systems.
          </p>
          <Textarea
            value={safeData.notes}
            onCommit={(value) => onUpdate({ notes: value })}
            placeholder="Trade relationships, cultural significance of items, linguistic evolution..."
            maxLength={800}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
}
