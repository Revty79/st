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
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-200 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
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
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {value}
            <button
              type="button"
              onClick={() => removeValue(value)}
              className="ml-1 text-blue-600 hover:text-blue-800"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
      >
        <span className="text-zinc-500">
          {values.length === 0 ? placeholder : `${values.length} selected`}
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Options dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={values.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
          
          {/* Add other option */}
          <div className="border-t border-white/20 p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Add custom climate..."
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={addOther}
                disabled={!otherValue.trim()}
                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
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

// Planet Profile data interface
export interface PlanetProfileData {
  planetType: string;
  planetTypeNote: string;
  sizeClass: string;
  gravityVsEarth: number | null;
  waterPct: number | null;
  climateBands: string[];
  tectonics: string;
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
        <p className="text-sm text-zinc-200 mt-1">
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
          <p className="text-xs text-zinc-500 mb-2">
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
          <p className="text-xs text-zinc-500 mb-2">
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
          <p className="text-xs text-zinc-500 mb-2">
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
        <p className="text-xs text-zinc-500 mb-2">
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
        <p className="text-xs text-zinc-500 mb-2">
          Level of geological activity affecting the world.
        </p>
        <Select
          value={data.tectonics}
          onCommit={(value) => onUpdate({ tectonics: value })}
          options={tectonicsOptions}
        />
      </div>
    </div>
  );
}
