"use client";

import { useState } from "react";

// Select component
const Select = ({ value, onCommit, options, placeholder }: {
  value: string;
  onCommit: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onCommit(e.target.value)}
      className="w-full rounded-lg bg-white/10 text-zinc-200 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    >
      {placeholder && (
        <option value="" disabled className="bg-zinc-800 text-zinc-400">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-zinc-800 text-zinc-200">
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Number input component
const NumberInput = ({ value, onCommit, placeholder, min, max, step = 1 }: {
  value: number | null;
  onCommit: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) => {
  const [raw, setRaw] = useState(value?.toString() || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow numbers and decimal point for floats
    if (/^\d*\.?\d*$/.test(newValue) || newValue === "") {
      setRaw(newValue);
    }
  };

  const handleBlur = () => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      onCommit(null);
      setRaw("");
      return;
    }

    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      onCommit(null);
      setRaw("");
      return;
    }

    const clampedValue = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, num));
    onCommit(clampedValue);
    setRaw(clampedValue.toString());
  };

  return (
    <input
      type="text"
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    />
  );
};

// Text input component
const Input = ({ value, onCommit, placeholder, maxLength }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
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
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

// Multi-select component for climate bands
const MultiSelect = ({ values, onCommit, options, placeholder }: {
  values: string[];
  onCommit: (values: string[]) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onCommit(values.filter(v => v !== value));
    } else {
      onCommit([...values, value]);
    }
  };

  const addOther = () => {
    if (otherValue.trim() && !values.includes(otherValue.trim())) {
      onCommit([...values, otherValue.trim()]);
      setOtherValue("");
    }
  };

  const removeValue = (value: string) => {
    onCommit(values.filter(v => v !== value));
  };

  return (
    <div className="relative">
      {/* Selected values display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-zinc-800 text-white border border-white/20"
          >
            {value}
            <button
              type="button"
              onClick={() => removeValue(value)}
              className="ml-1 text-white hover:text-amber-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-zinc-800 text-left flex justify-between items-center text-white"
      >
        <span>
          {values.length === 0 ? placeholder : `${values.length} selected`}
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Options dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-white/20 rounded-lg shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-3 py-2 hover:bg-zinc-700 cursor-pointer text-white"
              >
                <input
                  type="checkbox"
                  checked={values.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="mr-2 accent-amber-500"
                />
                {option.label}
              </label>
            ))}
          </div>
          {/* Add other option */}
          <div className="border-t border-white/20 p-2 bg-zinc-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Add custom climate..."
                className="flex-1 px-2 py-1 border border-white/20 rounded bg-zinc-800 text-white text-sm placeholder:text-white"
              />
              <button
                type="button"
                onClick={addOther}
                disabled={!otherValue.trim()}
                className="px-2 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Continent sub-structure interfaces
export interface MountainRangeData {
  name: string;
  direction: string;
  heightFeel: string;
}

export interface RiverData {
  name: string;
  source: string;
  mouth: string;
  navigability: string;
}

export interface LakeSeaData {
  name: string;
  notes: string;
}

export interface CoastIslandData {
  name: string;
  notes: string;
}

export interface ContinentData {
  name: string;
  character: string;
  biomes: string[];
  mountains: MountainRangeData[];
  rivers: RiverData[];
  lakes: LakeSeaData[];
  coasts: CoastIslandData[];
  resources: string[];
  hazards: string[];
}

// Planet Profile data interface
export interface PlanetProfileData {
  planetType: string;
  planetTypeNote: string;
  sizeClass: string;
  gravityVsEarth: number | null;
  waterPct: number | null;
  climateBands: string[];
  tectonics: string;
  continents: ContinentData[];
}

interface PlanetProfileFormProps {
  data: PlanetProfileData;
  onUpdate: (data: Partial<PlanetProfileData>) => void;
}

export default function PlanetProfileForm({ data, onUpdate }: PlanetProfileFormProps) {
  const planetTypeOptions = [
    { value: "Terrestrial", label: "Terrestrial" },
    { value: "Oceanic", label: "Oceanic" },
    { value: "Tidally Locked", label: "Tidally Locked" },
    { value: "Ringworld", label: "Ringworld" },
    { value: "Custom", label: "Custom" }
  ];

  const tectonicsOptions = [
    { value: "None", label: "None" },
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" }
  ];

  const climateOptions = [
    { value: "Arctic", label: "Arctic" },
    { value: "Subarctic", label: "Subarctic" },
    { value: "Temperate", label: "Temperate" },
    { value: "Subtropical", label: "Subtropical" },
    { value: "Tropical", label: "Tropical" },
    { value: "Desert", label: "Desert" },
    { value: "Arid", label: "Arid" },
    { value: "Mediterranean", label: "Mediterranean" },
    { value: "Continental", label: "Continental" },
    { value: "Oceanic", label: "Oceanic" },
    { value: "Polar", label: "Polar" },
    { value: "Alpine", label: "Alpine" }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Planet Profile — Player Summary; Details Collapsed</h2>
        <p className="text-sm text-white mt-1">
          Travel, survival, and environmental hooks. Physical foundation for adventures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Planet Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Planet Type
          </label>
          <Select
            value={data.planetType}
            onCommit={(value) => onUpdate({ planetType: value })}
            options={planetTypeOptions}
          />
          
          {data.planetType === "Custom" && (
            <div className="mt-2">
              <Input
                value={data.planetTypeNote}
                onCommit={(value) => onUpdate({ planetTypeNote: value })}
                placeholder="Describe your custom planet type..."
                maxLength={100}
              />
            </div>
          )}
        </div>

        {/* Size/Class */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Size/Class
          </label>
          <p className="text-xs text-white mb-2">
            Free text like "Earth-like", "Radius ~6,400 km"
          </p>
          <Input
            value={data.sizeClass}
            onCommit={(value) => onUpdate({ sizeClass: value })}
            placeholder="e.g., Earth-like, Radius ~6,400 km"
          />
        </div>

        {/* Gravity vs Earth */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Gravity vs Earth
          </label>
          <p className="text-xs text-white mb-2">
            Float 0.1–5.0 (1.0 = Earth-like)
          </p>
          <NumberInput
            value={data.gravityVsEarth}
            onCommit={(value) => onUpdate({ gravityVsEarth: value })}
            placeholder="1.0"
            min={0.1}
            max={5.0}
            step={0.1}
          />
        </div>

        {/* Water Coverage % */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Water Coverage %
          </label>
          <p className="text-xs text-white mb-2">
            0–100 percent of surface covered by water
          </p>
          <NumberInput
            value={data.waterPct}
            onCommit={(value) => onUpdate({ waterPct: value })}
            placeholder="71"
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Climate Bands */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Climate Bands
        </label>
        <p className="text-xs text-white mb-2">
          Multi-select climate types present on your world.
        </p>
        <MultiSelect
          values={data.climateBands}
          onCommit={(values) => onUpdate({ climateBands: values })}
          options={climateOptions}
          placeholder="Select climate bands..."
        />
      </div>

      {/* Tectonic Activity */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tectonic Activity
        </label>
        <p className="text-xs text-white mb-2">
          Level of geological activity affecting the world.
        </p>
        <Select
          value={data.tectonics}
          onCommit={(value) => onUpdate({ tectonics: value })}
          options={tectonicsOptions}
        />
      </div>

      {/* Continents */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Continents</h3>
            <p className="text-xs text-white mt-1">
              Define major land masses with their geography, resources, and hazards
            </p>
          </div>
          <button
            onClick={() => {
              const newContinents = [...(data.continents || []), {
                name: "",
                character: "",
                biomes: [],
                mountains: [],
                rivers: [],
                lakes: [],
                coasts: [],
                resources: [],
                hazards: []
              }];
              onUpdate({ continents: newContinents });
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            + Add Continent
          </button>
        </div>

        <div className="space-y-6">
          {(data.continents || []).map((continent, continentIndex) => (
            <div key={continentIndex} className="p-4 border border-white/20 rounded-lg bg-white/5">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-md font-medium text-white">Continent {continentIndex + 1}</h4>
                <button
                  onClick={() => {
                    const newContinents = (data.continents || []).filter((_, i) => i !== continentIndex);
                    onUpdate({ continents: newContinents });
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>

              {/* Name */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-white mb-1">Name</label>
                <Input
                  value={continent.name}
                  onCommit={(value) => {
                    const newContinents = [...(data.continents || [])];
                    newContinents[continentIndex] = { ...newContinents[continentIndex], name: value };
                    onUpdate({ continents: newContinents });
                  }}
                  placeholder="e.g., Aurelion"
                />
              </div>

              {/* Character */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-white mb-1">
                  Character (one-line defining trait)
                </label>
                <Input
                  value={continent.character}
                  onCommit={(value) => {
                    const newContinents = [...(data.continents || [])];
                    newContinents[continentIndex] = { ...newContinents[continentIndex], character: value };
                    onUpdate({ continents: newContinents });
                  }}
                  placeholder="e.g., Temperate empire heartland"
                />
              </div>

              {/* Biomes */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-white mb-1">Biomes (comma-separated)</label>
                <Input
                  value={continent.biomes.join(", ")}
                  onCommit={(value) => {
                    const newContinents = [...(data.continents || [])];
                    newContinents[continentIndex] = { 
                      ...newContinents[continentIndex], 
                      biomes: value.split(",").map(b => b.trim()).filter(b => b)
                    };
                    onUpdate({ continents: newContinents });
                  }}
                  placeholder="e.g., Plains, mixed forest, highlands"
                />
              </div>

              {/* Resources */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-white mb-1">
                  Resources (ores/herbs/relics, comma-separated)
                </label>
                <Input
                  value={continent.resources.join(", ")}
                  onCommit={(value) => {
                    const newContinents = [...(data.continents || [])];
                    newContinents[continentIndex] = { 
                      ...newContinents[continentIndex], 
                      resources: value.split(",").map(r => r.trim()).filter(r => r)
                    };
                    onUpdate({ continents: newContinents });
                  }}
                  placeholder="e.g., Embersteel, moon-silk, tide crystals"
                />
              </div>

              {/* Hazards */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Hazards/Phenomena (comma-separated)
                </label>
                <Input
                  value={continent.hazards.join(", ")}
                  onCommit={(value) => {
                    const newContinents = [...(data.continents || [])];
                    newContinents[continentIndex] = { 
                      ...newContinents[continentIndex], 
                      hazards: value.split(",").map(h => h.trim()).filter(h => h)
                    };
                    onUpdate({ continents: newContinents });
                  }}
                  placeholder="e.g., Quake belts, ley-rifts"
                />
              </div>

              {/* Geographic Details - Expanded */}
              <details className="mb-4 border border-white/20 rounded-lg p-3 bg-white/5" open>
                <summary className="cursor-pointer text-sm font-semibold text-amber-300 hover:text-amber-200 mb-3">
                  Geographic Details (mountains, rivers, lakes, coasts)
                </summary>
                <div className="mt-3 space-y-4">
                  
                  {/* Mountain Ranges */}
                  <div className="border-l-2 border-amber-500/50 pl-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-white">Mountain Ranges</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newContinents = [...(data.continents || [])];
                          const mountains = [...(continent.mountains || []), { name: "", direction: "", heightFeel: "" }];
                          newContinents[continentIndex] = { ...newContinents[continentIndex], mountains };
                          onUpdate({ continents: newContinents });
                        }}
                        className="text-xs px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded"
                      >
                        + Add Range
                      </button>
                    </div>
                    {(continent.mountains || []).map((mountain, mIdx) => (
                      <div key={mIdx} className="grid grid-cols-12 gap-2 mb-2 items-start">
                        <input
                          type="text"
                          value={mountain.name}
                          onChange={(e) => {
                            const newContinents = [...(data.continents || [])];
                            const mountains = [...(continent.mountains || [])];
                            mountains[mIdx] = { ...mountains[mIdx], name: e.target.value };
                            newContinents[continentIndex] = { ...newContinents[continentIndex], mountains };
                            onUpdate({ continents: newContinents });
                          }}
                          placeholder="Name"
                          className="col-span-4 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        />
                        <input
                          type="text"
                          value={mountain.direction}
                          onChange={(e) => {
                            const newContinents = [...(data.continents || [])];
                            const mountains = [...(continent.mountains || [])];
                            mountains[mIdx] = { ...mountains[mIdx], direction: e.target.value };
                            newContinents[continentIndex] = { ...newContinents[continentIndex], mountains };
                            onUpdate({ continents: newContinents });
                          }}
                          placeholder="Direction (N→S)"
                          className="col-span-3 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        />
                        <input
                          type="text"
                          value={mountain.heightFeel}
                          onChange={(e) => {
                            const newContinents = [...(data.continents || [])];
                            const mountains = [...(continent.mountains || [])];
                            mountains[mIdx] = { ...mountains[mIdx], heightFeel: e.target.value };
                            newContinents[continentIndex] = { ...newContinents[continentIndex], mountains };
                            onUpdate({ continents: newContinents });
                          }}
                          placeholder="Height feel"
                          className="col-span-4 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newContinents = [...(data.continents || [])];
                            const mountains = (continent.mountains || []).filter((_, i) => i !== mIdx);
                            newContinents[continentIndex] = { ...newContinents[continentIndex], mountains };
                            onUpdate({ continents: newContinents });
                          }}
                          className="col-span-1 text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(continent.mountains || []).length === 0 && (
                      <p className="text-xs text-white/40 italic">No mountain ranges defined</p>
                    )}
                  </div>

                  {/* Rivers */}
                  <div className="border-l-2 border-blue-500/50 pl-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-white">Rivers</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newContinents = [...(data.continents || [])];
                          const rivers = [...(continent.rivers || []), { name: "", source: "", mouth: "", navigability: "" }];
                          newContinents[continentIndex] = { ...newContinents[continentIndex], rivers };
                          onUpdate({ continents: newContinents });
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        + Add River
                      </button>
                    </div>
                    {(continent.rivers || []).map((river, rIdx) => (
                      <div key={rIdx} className="mb-3 p-2 bg-white/5 rounded border border-white/10">
                        <div className="grid grid-cols-12 gap-2 mb-1">
                          <input
                            type="text"
                            value={river.name}
                            onChange={(e) => {
                              const newContinents = [...(data.continents || [])];
                              const rivers = [...(continent.rivers || [])];
                              rivers[rIdx] = { ...rivers[rIdx], name: e.target.value };
                              newContinents[continentIndex] = { ...newContinents[continentIndex], rivers };
                              onUpdate({ continents: newContinents });
                            }}
                            placeholder="Name"
                            className="col-span-11 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newContinents = [...(data.continents || [])];
                              const rivers = (continent.rivers || []).filter((_, i) => i !== rIdx);
                              newContinents[continentIndex] = { ...newContinents[continentIndex], rivers };
                              onUpdate({ continents: newContinents });
                            }}
                            className="col-span-1 text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={river.source}
                            onChange={(e) => {
                              const newContinents = [...(data.continents || [])];
                              const rivers = [...(continent.rivers || [])];
                              rivers[rIdx] = { ...rivers[rIdx], source: e.target.value };
                              newContinents[continentIndex] = { ...newContinents[continentIndex], rivers };
                              onUpdate({ continents: newContinents });
                            }}
                            placeholder="Source"
                            className="px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                          />
                          <input
                            type="text"
                            value={river.mouth}
                            onChange={(e) => {
                              const newContinents = [...(data.continents || [])];
                              const rivers = [...(continent.rivers || [])];
                              rivers[rIdx] = { ...rivers[rIdx], mouth: e.target.value };
                              newContinents[continentIndex] = { ...newContinents[continentIndex], rivers };
                              onUpdate({ continents: newContinents });
                            }}
                            placeholder="Mouth"
                            className="px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                          />
                          <input
                            type="text"
                            value={river.navigability}
                            onChange={(e) => {
                              const newContinents = [...(data.continents || [])];
                              const rivers = [...(continent.rivers || [])];
                              rivers[rIdx] = { ...rivers[rIdx], navigability: e.target.value };
                              newContinents[continentIndex] = { ...newContinents[continentIndex], rivers };
                              onUpdate({ continents: newContinents });
                            }}
                            placeholder="Navigability"
                            className="px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                          />
                        </div>
                      </div>
                    ))}
                    {(continent.rivers || []).length === 0 && (
                      <p className="text-xs text-white/40 italic">No rivers defined</p>
                    )}
                  </div>

                  {/* Lakes & Seas */}
                  <div className="border-l-2 border-cyan-500/50 pl-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-white">Lakes & Seas</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newContinents = [...(data.continents || [])];
                          const lakes = [...(continent.lakes || []), { name: "", notes: "" }];
                          newContinents[continentIndex] = { ...newContinents[continentIndex], lakes };
                          onUpdate({ continents: newContinents });
                        }}
                        className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
                      >
                        + Add Lake/Sea
                      </button>
                    </div>
                    {(continent.lakes || []).map((lake, lIdx) => (
                      <div key={lIdx} className="grid grid-cols-12 gap-2 mb-2">
                        <input
                          type="text"
                          value={lake.name}
                          onChange={(e) => {
                            const newContinents = [...(data.continents || [])];
                            const lakes = [...(continent.lakes || [])];
                            lakes[lIdx] = { ...lakes[lIdx], name: e.target.value };
                            newContinents[continentIndex] = { ...newContinents[continentIndex], lakes };
                            onUpdate({ continents: newContinents });
                          }}
                          placeholder="Name"
                          className="col-span-4 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        />
                        <input
                          type="text"
                          value={lake.notes}
                          onChange={(e) => {
                            const newContinents = [...(data.continents || [])];
                            const lakes = [...(continent.lakes || [])];
                            lakes[lIdx] = { ...lakes[lIdx], notes: e.target.value };
                            newContinents[continentIndex] = { ...newContinents[continentIndex], lakes };
                            onUpdate({ continents: newContinents });
                          }}
                          placeholder="Notes (e.g., fog banks, sprite lights)"
                          className="col-span-7 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newContinents = [...(data.continents || [])];
                            const lakes = (continent.lakes || []).filter((_, i) => i !== lIdx);
                            newContinents[continentIndex] = { ...newContinents[continentIndex], lakes };
                            onUpdate({ continents: newContinents });
                          }}
                          className="col-span-1 text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(continent.lakes || []).length === 0 && (
                      <p className="text-xs text-white/40 italic">No lakes or seas defined</p>
                    )}
                  </div>

                  {/* Coasts & Islands */}
                  <div className="border-l-2 border-green-500/50 pl-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-white">Coasts & Islands</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newContinents = [...(data.continents || [])];
                          const coasts = [...(continent.coasts || []), { name: "", notes: "" }];
                          newContinents[continentIndex] = { ...newContinents[continentIndex], coasts };
                          onUpdate({ continents: newContinents });
                        }}
                        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        + Add Coast/Island
                      </button>
                    </div>
                    {(continent.coasts || []).map((coast, cIdx) => (
                      <div key={cIdx} className="grid grid-cols-12 gap-2 mb-2">
                        <input
                          type="text"
                          value={coast.name}
                          onChange={(e) => {
                            const newContinents = [...(data.continents || [])];
                            const coasts = [...(continent.coasts || [])];
                            coasts[cIdx] = { ...coasts[cIdx], name: e.target.value };
                            newContinents[continentIndex] = { ...newContinents[continentIndex], coasts };
                            onUpdate({ continents: newContinents });
                          }}
                          placeholder="Name"
                          className="col-span-4 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        />
                        <input
                          type="text"
                          value={coast.notes}
                          onChange={(e) => {
                            const newContinents = [...(data.continents || [])];
                            const coasts = [...(continent.coasts || [])];
                            coasts[cIdx] = { ...coasts[cIdx], notes: e.target.value };
                            newContinents[continentIndex] = { ...newContinents[continentIndex], coasts };
                            onUpdate({ continents: newContinents });
                          }}
                          placeholder="Notes (e.g., pirate coves, storm-temples)"
                          className="col-span-7 px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newContinents = [...(data.continents || [])];
                            const coasts = (continent.coasts || []).filter((_, i) => i !== cIdx);
                            newContinents[continentIndex] = { ...newContinents[continentIndex], coasts };
                            onUpdate({ continents: newContinents });
                          }}
                          className="col-span-1 text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(continent.coasts || []).length === 0 && (
                      <p className="text-xs text-white/40 italic">No coasts or islands defined</p>
                    )}
                  </div>

                </div>
              </details>
            </div>
          ))}

          {(data.continents || []).length === 0 && (
            <div className="text-center py-8 text-white/60">
              No continents defined yet. Click "Add Continent" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
