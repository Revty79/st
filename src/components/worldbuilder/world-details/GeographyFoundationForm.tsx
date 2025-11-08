"use client";

import { useState } from "react";

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
      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    >
      {placeholder && (
        <option value="" disabled className="bg-zinc-800 text-white">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Data interfaces
export interface ContinentData {
  name: string;
  description: string;
  climate: string;
}

export interface RegionData {
  name: string;
  continentName: string;
  type: string;
  description: string;
  dangers: string;
}

export interface BiomeData {
  name: string;
  climate: string;
  terrain: string;
  description: string;
  resources: string;
}

export interface LandmarkData {
  name: string;
  type: string;
  location: string;
  significance: string;
  description: string;
}

export interface TradeRouteData {
  name: string;
  origin: string;
  destination: string;
  distance: string;
  dangers: string;
  goods: string;
}

export interface GeographyFoundationData {
  worldShape: string;
  worldSize: string;
  continents: ContinentData[];
  biomes: BiomeData[];
  notes: string;
}

interface GeographyFoundationFormProps {
  data: GeographyFoundationData;
  onUpdate: (data: Partial<GeographyFoundationData>) => void;
}

export default function GeographyFoundationForm({ data, onUpdate }: GeographyFoundationFormProps) {
  // Ensure arrays are never undefined
  const safeData = {
    ...data,
    continents: data.continents || [],
    biomes: data.biomes || []
  };

  const worldShapeOptions = [
    { value: "", label: "Select world shape..." },
    { value: "Spherical", label: "Spherical (Earth-like)" },
    { value: "Flat", label: "Flat World" },
    { value: "Cylindrical", label: "Cylindrical" },
    { value: "Toroidal", label: "Toroidal (Donut-shaped)" },
    { value: "Irregular", label: "Irregular" },
    { value: "Other", label: "Other" }
  ];

  const worldSizeOptions = [
    { value: "", label: "Select world size..." },
    { value: "Tiny", label: "Tiny (City-state)" },
    { value: "Small", label: "Small (Island nation)" },
    { value: "Medium", label: "Medium (Earth-sized)" },
    { value: "Large", label: "Large (Super-Earth)" },
    { value: "Massive", label: "Massive (Gas giant)" },
    { value: "Infinite", label: "Infinite/Unknown" }
  ];

  const climateOptions = [
    { value: "Tropical", label: "Tropical" },
    { value: "Temperate", label: "Temperate" },
    { value: "Arctic", label: "Arctic" },
    { value: "Desert", label: "Desert" },
    { value: "Mediterranean", label: "Mediterranean" },
    { value: "Continental", label: "Continental" },
    { value: "Oceanic", label: "Oceanic" },
    { value: "Magical", label: "Magical" }
  ];

  const regionTypeOptions = [
    { value: "Kingdom", label: "Kingdom" },
    { value: "Empire", label: "Empire" },
    { value: "City-State", label: "City-State" },
    { value: "Wilderness", label: "Wilderness" },
    { value: "Wasteland", label: "Wasteland" },
    { value: "Magical Zone", label: "Magical Zone" },
    { value: "Trade Hub", label: "Trade Hub" },
    { value: "Frontier", label: "Frontier" }
  ];

  const landmarkTypeOptions = [
    { value: "Mountain", label: "Mountain" },
    { value: "Forest", label: "Forest" },
    { value: "River", label: "River" },
    { value: "Lake", label: "Lake" },
    { value: "Desert", label: "Desert" },
    { value: "City", label: "City" },
    { value: "Ruins", label: "Ruins" },
    { value: "Magical Site", label: "Magical Site" },
    { value: "Natural Wonder", label: "Natural Wonder" }
  ];

  // Helper functions for array management
  const addContinent = () => {
    const newContinents = [...safeData.continents, { name: "", description: "", climate: "" }];
    onUpdate({ continents: newContinents });
  };

  const removeContinent = (index: number) => {
    const newContinents = safeData.continents.filter((_, i) => i !== index);
    onUpdate({ continents: newContinents });
  };

  const updateContinent = (index: number, updates: Partial<ContinentData>) => {
    const newContinents = safeData.continents.map((continent, i) => 
      i === index ? { ...continent, ...updates } : continent
    );
    onUpdate({ continents: newContinents });
  };

  const addBiome = () => {
    const newBiomes = [...safeData.biomes, { name: "", climate: "", terrain: "", description: "", resources: "" }];
    onUpdate({ biomes: newBiomes });
  };

  const removeBiome = (index: number) => {
    const newBiomes = safeData.biomes.filter((_, i) => i !== index);
    onUpdate({ biomes: newBiomes });
  };

  const updateBiome = (index: number, updates: Partial<BiomeData>) => {
    const newBiomes = safeData.biomes.map((biome, i) => 
      i === index ? { ...biome, ...updates } : biome
    );
    onUpdate({ biomes: newBiomes });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Geography Foundation — Player Map; G.O.D Details</h2>
        <p className="text-sm text-white mt-1">
          Core physical world structure: continents, biomes, and major geographic features. Specific regions, landmarks, and trade routes belong to individual eras.
        </p>
      </div>

      <div className="space-y-6">
        {/* World Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              World Shape
            </label>
            <p className="text-xs text-white mb-2">
              Basic geometric structure of your world.
            </p>
            <Select
              value={safeData.worldShape}
              onCommit={(value) => onUpdate({ worldShape: value })}
              options={worldShapeOptions}
              placeholder="Select world shape..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              World Size
            </label>
            <p className="text-xs text-white mb-2">
              Relative scale for travel and scope.
            </p>
            <Select
              value={safeData.worldSize}
              onCommit={(value) => onUpdate({ worldSize: value })}
              options={worldSizeOptions}
              placeholder="Select world size..."
            />
          </div>
        </div>

        {/* Continents */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Continents
            </label>
            <button
              type="button"
              onClick={addContinent}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Continent
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Major landmasses that define your world's geography.
          </p>

          <div className="space-y-4">
            {safeData.continents.length === 0 ? (
              <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
                No continents added yet. Click "Add Continent" to create one.
              </div>
            ) : (
              safeData.continents.map((continent, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
                      Continent {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeContinent(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Name (≤50 chars)
                      </label>
                      <Input
                        value={continent.name}
                        onCommit={(value) => updateContinent(index, { name: value })}
                        placeholder="Continent name..."
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Primary Climate
                      </label>
                      <Select
                        value={continent.climate}
                        onCommit={(value) => updateContinent(index, { climate: value })}
                        options={climateOptions}
                        placeholder="Select climate..."
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-white mb-1">
                        Description (≤200 chars)
                      </label>
                      <Textarea
                        value={continent.description}
                        onCommit={(value) => updateContinent(index, { description: value })}
                        placeholder="Brief description..."
                        maxLength={200}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Additional Geographic Notes
          </label>
          <p className="text-xs text-white mb-2">
            Any other important geographical information, unique features, or special rules.
          </p>
          <Textarea
            value={safeData.notes}
            onCommit={(value) => onUpdate({ notes: value })}
            placeholder="Additional geographic details, special phenomena, etc..."
            maxLength={1000}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}
