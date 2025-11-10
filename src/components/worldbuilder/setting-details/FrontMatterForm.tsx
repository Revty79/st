"use client";

import { useState } from "react";
import FormField from "@/components/shared/FormField";
import { FrontMatterData } from "@/types/settings";

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

interface FrontMatterFormProps {
  data: FrontMatterData;
  onUpdate: (updates: Partial<FrontMatterData>) => void;
  eraData?: any; // Era context data for inheritance
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

const RegionScopeOptions = [
  { value: "city", label: "City - Single city or city cluster" },
  { value: "province", label: "Province - Large region, multiple settlements" },
  { value: "front", label: "Front - War zone, contested territory" },
  { value: "bubble", label: "Bubble - Isolated pocket realm or dimension" }
];

const PresetTags = [
  "Fantasy", "Sci-Fi", "Horror", "Modern", "Historical", "Weird",
  "Pulp", "Noir", "Swashbuckling", "Intrigue", "Seafaring", "Urban",
  "Wilderness", "Underworld", "Political", "Military", "Religious",
  "Academic", "Mercantile", "Criminal", "Faction-Play", "Exploration"
];

const PresetRealms = [
  "Material", "Shadow", "Feywild", "Ethereal", "Astral", "Fire", "Water",
  "Earth", "Air", "Positive", "Negative", "Celestial", "Infernal", "Limbo"
];

export default function FrontMatterForm({ data, onUpdate, eraData, onManualSave, isManualSaving }: FrontMatterFormProps) {
  const [customTag, setCustomTag] = useState("");
  const [customRealm, setCustomRealm] = useState("");

  const handleAddTag = () => {
    if (customTag.trim() && !data.tags.includes(customTag.trim()) && data.tags.length < 7) {
      onUpdate({ tags: [...data.tags, customTag.trim()] });
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({ tags: data.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAddToneWord = () => {
    if (data.toneWords.length < 3) {
      onUpdate({ toneWords: [...data.toneWords, ""] });
    }
  };

  const handleUpdateToneWord = (index: number, value: string) => {
    const newWords = [...data.toneWords];
    newWords[index] = value;
    onUpdate({ toneWords: newWords });
  };

  const handleRemoveToneWord = (index: number) => {
    const newWords = data.toneWords.filter((_, i) => i !== index);
    onUpdate({ toneWords: newWords });
  };

  const handleAddActiveRealm = () => {
    if (customRealm.trim() && !data.activeRealms.includes(customRealm.trim())) {
      onUpdate({ activeRealms: [...data.activeRealms, customRealm.trim()] });
      setCustomRealm("");
    }
  };

  const handleRemoveActiveRealm = (realmToRemove: string) => {
    onUpdate({ activeRealms: data.activeRealms.filter(realm => realm !== realmToRemove) });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Front Matter" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-amber-400 text-center mb-4">MVS Required Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Create the public name, pitch, and scope that makes this setting discoverable and sets player expectations.
      </div>

      {/* Basic Identity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Basic Identity</h3>
        
        <FormField
          label="Setting Name"
          value={data.name}
          onCommit={(value: string) => onUpdate({ name: value })}
          placeholder="Shattersea Freeports"
          maxLength={60}
          helperText="Clear, evocative name (≤60 chars)"
        />

        <FormField
          label="Short Summary"
          type="textarea"
          value={data.summary}
          onCommit={(value: string) => onUpdate({ summary: value })}
          placeholder="Storm-temples, pirate princes, and faction courts where oaths are forged on tide-altars."
          maxLength={240}
          rows={3}
          helperText="One-breath pitch; player-facing (≤240 chars)"
        />

        <FormField
          label="Era Anchor"
          value={data.eraAnchor}
          onCommit={() => {}} // Read-only
          disabled={true}
          placeholder="Cold Tides (312 AF—Ongoing)"
          helperText="Links to parent Era (auto-populated, read-only)"
        />
      </div>

      {/* Scope & Classification */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Scope & Classification</h3>
        
        <FormField
          label="Region Scope"
          type="select"
          value={data.regionScope}
          onCommit={(value: string) => onUpdate({ regionScope: value as FrontMatterData['regionScope'] })}
          options={RegionScopeOptions}
          helperText="The spatial focus of this setting"
        />

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tone Words (2-3 descriptive words)
          </label>
          <div className="space-y-2">
            {data.toneWords.map((word, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  label=""
                  value={word}
                  onCommit={(value: string) => handleUpdateToneWord(index, value)}
                  placeholder="Swashbuckling"
                  maxLength={20}
                  className="flex-1"
                />
                <button
                  onClick={() => handleRemoveToneWord(index)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            {data.toneWords.length < 3 && (
              <button
                onClick={handleAddToneWord}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Add Tone Word
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tags (5-7 search/filter labels)
          </label>
          
          {/* Current Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-black text-sm rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Preset Tags */}
          <div className="mb-3">
            <div className="text-sm text-zinc-300 mb-2">Quick Add:</div>
            <div className="flex flex-wrap gap-2">
              {PresetTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (!data.tags.includes(tag) && data.tags.length < 7) {
                      onUpdate({ tags: [...data.tags, tag] });
                    }
                  }}
                  disabled={data.tags.includes(tag) || data.tags.length >= 7}
                  className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          {data.tags.length < 7 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTag(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddTag()}
                placeholder="Custom tag"
                className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
              />
              <button
                onClick={handleAddTag}
                disabled={!customTag.trim() || data.tags.includes(customTag.trim())}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black rounded"
              >
                Add Custom
              </button>
            </div>
          )}
          
          <div className="text-xs text-zinc-400 mt-1">
            {data.tags.length}/7 tags
          </div>
        </div>
      </div>

      {/* Active Realms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Realms</h3>
        <div className="text-sm text-zinc-400">
          Which planes/realms matter in this setting? (Subset from Era's active realms)
        </div>
        
        {/* Current Active Realms */}
        <div className="flex flex-wrap gap-2 mb-3">
          {data.activeRealms.map((realm) => (
            <span
              key={realm}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-sm rounded-full"
            >
              {realm}
              <button
                onClick={() => handleRemoveActiveRealm(realm)}
                className="hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Preset Realms */}
        <div className="mb-3">
          <div className="text-sm text-zinc-300 mb-2">Available Realms:</div>
          <div className="flex flex-wrap gap-2">
            {PresetRealms.map((realm) => (
              <button
                key={realm}
                onClick={() => {
                  if (!data.activeRealms.includes(realm)) {
                    onUpdate({ activeRealms: [...data.activeRealms, realm] });
                  }
                }}
                disabled={data.activeRealms.includes(realm)}
                className="px-2 py-1 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded"
              >
                {realm}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Realm Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customRealm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomRealm(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddActiveRealm()}
            placeholder="Custom realm"
            className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
          />
          <button
            onClick={handleAddActiveRealm}
            disabled={!customRealm.trim() || data.activeRealms.includes(customRealm.trim())}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white rounded"
          >
            Add Realm
          </button>
        </div>
      </div>

      {/* Era Information Panel */}
      {eraData && (
        <div className="border border-blue-500/30 bg-blue-950/20 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-3">Inherited from Era: {eraData.basicInfo?.name}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="text-blue-200 font-medium mb-2">Available Active Realms</h5>
              <div className="space-y-1">
                {eraData.backdropDefaults?.activeRealms.map((realm: string) => (
                  <div key={realm} className="flex items-center gap-2 text-blue-100">
                    <div className={`w-2 h-2 rounded-full ${data.activeRealms.includes(realm) ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                    <span className={data.activeRealms.includes(realm) ? 'text-green-400' : ''}>{realm}</span>
                    {data.activeRealms.includes(realm) && <span className="text-xs text-green-300">(Active)</span>}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-blue-200 font-medium mb-2">Era Context</h5>
              <div className="space-y-1 text-blue-100">
                <div><strong>Tech Level:</strong> {eraData.backdropDefaults?.typicalTechLevel}</div>
                <div><strong>Magic Tide:</strong> {eraData.backdropDefaults?.magicTide}</div>
                <div><strong>Stability:</strong> {eraData.backdropDefaults?.stabilityConflict}</div>
                <div><strong>Economy:</strong> {eraData.backdropDefaults?.economy}</div>
              </div>
            </div>

            {eraData.catalogs?.factions && (
              <div>
                <h5 className="text-blue-200 font-medium mb-2">Available Factions</h5>
                <div className="space-y-1 text-blue-100">
                  {eraData.catalogs.factions.slice(0, 3).map((faction: any) => (
                    <div key={faction.factionId} className="text-xs">
                      <strong>{faction.factionName}</strong> - {faction.oneLineAim}
                    </div>
                  ))}
                  {eraData.catalogs.factions.length > 3 && (
                    <div className="text-xs text-blue-300">...and {eraData.catalogs.factions.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {eraData.governments?.[0]?.regionsKingdoms && (
              <div>
                <h5 className="text-blue-200 font-medium mb-2">Available Regions</h5>
                <div className="space-y-1 text-blue-100">
                  {eraData.governments[0].regionsKingdoms.slice(0, 3).map((region: any) => (
                    <div key={region.name} className="text-xs">
                      <strong>{region.name}</strong> ({region.kind})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 text-xs text-blue-300">
            <strong>Note:</strong> This Setting inherits data from the "{eraData.basicInfo?.name}" Era. 
            Changes to Era settings will affect all Settings within that Era.
          </div>
        </div>
      )}

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.name ? "text-green-400" : "text-zinc-400"}>
            {data.name ? "✓" : "○"} Setting Name
          </div>
          <div className={data.summary ? "text-green-400" : "text-zinc-400"}>
            {data.summary ? "✓" : "○"} Short Summary
          </div>
          <div className={data.regionScope ? "text-green-400" : "text-zinc-400"}>
            {data.regionScope ? "✓" : "○"} Region Scope
          </div>
          <div className={data.toneWords.length >= 2 ? "text-green-400" : "text-zinc-400"}>
            {data.toneWords.length >= 2 ? "✓" : "○"} Tone Words (2-3)
          </div>
          <div className={data.tags.length >= 5 ? "text-green-400" : "text-zinc-400"}>
            {data.tags.length >= 5 ? "✓" : "○"} Tags (5-7)
          </div>
        </div>
      </div>
    </div>
  );
}