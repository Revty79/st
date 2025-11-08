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
      className={`w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-300 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${className || ""}`}
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
        className={`w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-300 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 resize-y ${className || ""}`}
        rows={3}
      />
      {maxLength && (
        <div className="text-sm text-zinc-200 mt-1 text-right">
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
  regions: RegionData[];
  biomes: BiomeData[];
  landmarks: LandmarkData[];
  tradeRoutes: TradeRouteData[];
  notes: string;
}

interface GeographyFoundationFormProps {
  data: GeographyFoundationData;
  onUpdate: (data: Partial<GeographyFoundationData>) => void;
}

export default function GeographyFoundationForm({ data, onUpdate }: GeographyFoundationFormProps) {
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
    const newContinents = [...data.continents, { name: "", description: "", climate: "" }];
    onUpdate({ continents: newContinents });
  };

  const removeContinent = (index: number) => {
    const newContinents = data.continents.filter((_, i) => i !== index);
    onUpdate({ continents: newContinents });
  };

  const updateContinent = (index: number, updates: Partial<ContinentData>) => {
    const newContinents = data.continents.map((continent, i) => 
      i === index ? { ...continent, ...updates } : continent
    );
    onUpdate({ continents: newContinents });
  };

  const addRegion = () => {
    const newRegions = [...data.regions, { name: "", continentName: "", type: "", description: "", dangers: "" }];
    onUpdate({ regions: newRegions });
  };

  const removeRegion = (index: number) => {
    const newRegions = data.regions.filter((_, i) => i !== index);
    onUpdate({ regions: newRegions });
  };

  const updateRegion = (index: number, updates: Partial<RegionData>) => {
    const newRegions = data.regions.map((region, i) => 
      i === index ? { ...region, ...updates } : region
    );
    onUpdate({ regions: newRegions });
  };

  const addBiome = () => {
    const newBiomes = [...data.biomes, { name: "", climate: "", terrain: "", description: "", resources: "" }];
    onUpdate({ biomes: newBiomes });
  };

  const removeBiome = (index: number) => {
    const newBiomes = data.biomes.filter((_, i) => i !== index);
    onUpdate({ biomes: newBiomes });
  };

  const updateBiome = (index: number, updates: Partial<BiomeData>) => {
    const newBiomes = data.biomes.map((biome, i) => 
      i === index ? { ...biome, ...updates } : biome
    );
    onUpdate({ biomes: newBiomes });
  };

  const addLandmark = () => {
    const newLandmarks = [...data.landmarks, { name: "", type: "", location: "", significance: "", description: "" }];
    onUpdate({ landmarks: newLandmarks });
  };

  const removeLandmark = (index: number) => {
    const newLandmarks = data.landmarks.filter((_, i) => i !== index);
    onUpdate({ landmarks: newLandmarks });
  };

  const updateLandmark = (index: number, updates: Partial<LandmarkData>) => {
    const newLandmarks = data.landmarks.map((landmark, i) => 
      i === index ? { ...landmark, ...updates } : landmark
    );
    onUpdate({ landmarks: newLandmarks });
  };

  const addTradeRoute = () => {
    const newRoutes = [...data.tradeRoutes, { name: "", origin: "", destination: "", distance: "", dangers: "", goods: "" }];
    onUpdate({ tradeRoutes: newRoutes });
  };

  const removeTradeRoute = (index: number) => {
    const newRoutes = data.tradeRoutes.filter((_, i) => i !== index);
    onUpdate({ tradeRoutes: newRoutes });
  };

  const updateTradeRoute = (index: number, updates: Partial<TradeRouteData>) => {
    const newRoutes = data.tradeRoutes.map((route, i) => 
      i === index ? { ...route, ...updates } : route
    );
    onUpdate({ tradeRoutes: newRoutes });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Geography Foundation — Player Map; G.O.D Details</h2>
        <p className="text-sm text-zinc-200 mt-1">
          Physical world structure, regions, travel routes, and major landmarks. Forms the foundation for adventures and campaigns.
        </p>
      </div>

      <div className="space-y-6">
        {/* World Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              World Shape
            </label>
            <p className="text-xs text-zinc-200 mb-2">
              Basic geometric structure of your world.
            </p>
            <Select
              value={data.worldShape}
              onCommit={(value) => onUpdate({ worldShape: value })}
              options={worldShapeOptions}
              placeholder="Select world shape..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              World Size
            </label>
            <p className="text-xs text-zinc-200 mb-2">
              Relative scale for travel and scope.
            </p>
            <Select
              value={data.worldSize}
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
          <p className="text-xs text-zinc-200 mb-4">
            Major landmasses that define your world's geography.
          </p>

          <div className="space-y-4">
            {data.continents.length === 0 ? (
              <div className="text-zinc-200 text-center py-8 border-2 border-dashed border-white/20 rounded">
                No continents added yet. Click "Add Continent" to create one.
              </div>
            ) : (
              data.continents.map((continent, index) => (
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
                      <label className="block text-xs font-medium text-zinc-200 mb-1">
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
                      <label className="block text-xs font-medium text-zinc-200 mb-1">
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
                      <label className="block text-xs font-medium text-zinc-200 mb-1">
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

        {/* Regions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Regions
            </label>
            <button
              type="button"
              onClick={addRegion}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Region
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Political and geographical divisions within continents.
          </p>

          <div className="space-y-4">
            {data.regions.map((region, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    Region {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeRegion(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Name
                    </label>
                    <Input
                      value={region.name}
                      onCommit={(value) => updateRegion(index, { name: value })}
                      placeholder="Region name..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Continent
                    </label>
                    <Input
                      value={region.continentName}
                      onCommit={(value) => updateRegion(index, { continentName: value })}
                      placeholder="Which continent..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Type
                    </label>
                    <Select
                      value={region.type}
                      onCommit={(value) => updateRegion(index, { type: value })}
                      options={regionTypeOptions}
                      placeholder="Select type..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={region.description}
                      onCommit={(value) => updateRegion(index, { description: value })}
                      placeholder="Region details..."
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Dangers/Challenges
                    </label>
                    <Textarea
                      value={region.dangers}
                      onCommit={(value) => updateRegion(index, { dangers: value })}
                      placeholder="Travel hazards..."
                      maxLength={150}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Major Landmarks */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Major Landmarks
            </label>
            <button
              type="button"
              onClick={addLandmark}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Landmark
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Notable geographical features, cities, and points of interest.
          </p>

          <div className="space-y-4">
            {data.landmarks.map((landmark, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    Landmark {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeLandmark(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Name
                    </label>
                    <Input
                      value={landmark.name}
                      onCommit={(value) => updateLandmark(index, { name: value })}
                      placeholder="Landmark name..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Type
                    </label>
                    <Select
                      value={landmark.type}
                      onCommit={(value) => updateLandmark(index, { type: value })}
                      options={landmarkTypeOptions}
                      placeholder="Select type..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Location
                    </label>
                    <Input
                      value={landmark.location}
                      onCommit={(value) => updateLandmark(index, { location: value })}
                      placeholder="Where it's located..."
                      maxLength={80}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Significance
                    </label>
                    <Input
                      value={landmark.significance}
                      onCommit={(value) => updateLandmark(index, { significance: value })}
                      placeholder="Why it's important..."
                      maxLength={100}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={landmark.description}
                      onCommit={(value) => updateLandmark(index, { description: value })}
                      placeholder="Detailed description..."
                      maxLength={300}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Routes */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Trade Routes
            </label>
            <button
              type="button"
              onClick={addTradeRoute}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Trade Route
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Major paths for commerce, travel, and communication between settlements.
          </p>

          <div className="space-y-4">
            {data.tradeRoutes.map((route, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    Trade Route {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeTradeRoute(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Route Name
                    </label>
                    <Input
                      value={route.name}
                      onCommit={(value) => updateTradeRoute(index, { name: value })}
                      placeholder="Route name..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Origin
                    </label>
                    <Input
                      value={route.origin}
                      onCommit={(value) => updateTradeRoute(index, { origin: value })}
                      placeholder="Starting point..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Destination
                    </label>
                    <Input
                      value={route.destination}
                      onCommit={(value) => updateTradeRoute(index, { destination: value })}
                      placeholder="End point..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Distance/Duration
                    </label>
                    <Input
                      value={route.distance}
                      onCommit={(value) => updateTradeRoute(index, { distance: value })}
                      placeholder="Travel time..."
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Dangers
                    </label>
                    <Input
                      value={route.dangers}
                      onCommit={(value) => updateTradeRoute(index, { dangers: value })}
                      placeholder="Bandits, weather..."
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Common Goods
                    </label>
                    <Input
                      value={route.goods}
                      onCommit={(value) => updateTradeRoute(index, { goods: value })}
                      placeholder="What's traded..."
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Additional Geographic Notes
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            Any other important geographical information, unique features, or special rules.
          </p>
          <Textarea
            value={data.notes}
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