"use client";

import { useState } from "react";

// Reusable stepper component
const NumberStepper = ({ value, onCommit, min = 0, max = 10, label }: {
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onCommit(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onCommit(value + 1);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center rounded border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        −
      </button>
      <div className="flex flex-col items-center min-w-[3rem]">
        <span className="text-lg font-medium text-white">{value}</span>
        <span className="text-xs text-zinc-200">{label}</span>
      </div>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center rounded border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
};

// Number input component
const NumberInput = ({ value, onCommit, placeholder, min, max }: {
  value: number | null;
  onCommit: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) => {
  const [raw, setRaw] = useState(value?.toString() || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only numbers and decimal point
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
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-200 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    />
  );
};

// Moon type definition
export interface MoonData {
  name: string;
  cycleDays: number | null;
  omen: string;
}

// Astral Bodies data interface
export interface AstralBodiesData {
  sunsCount: number;
  moons: MoonData[];
}

interface AstralBodiesFormProps {
  data: AstralBodiesData;
  onUpdate: (data: Partial<AstralBodiesData>) => void;
}

export default function AstralBodiesForm({ data, onUpdate }: AstralBodiesFormProps) {
  const addMoon = () => {
    const newMoons = [...data.moons, { name: "", cycleDays: null, omen: "" }];
    onUpdate({ moons: newMoons });
  };

  const removeMoon = (index: number) => {
    const newMoons = data.moons.filter((_, i) => i !== index);
    onUpdate({ moons: newMoons });
  };

  const updateMoon = (index: number, updates: Partial<MoonData>) => {
    const newMoons = data.moons.map((moon, i) => 
      i === index ? { ...moon, ...updates } : moon
    );
    onUpdate({ moons: newMoons });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Astral Bodies — Player Summary; G.O.D Details</h2>
        <p className="text-sm text-zinc-200 mt-1">
          Light cycles, climate flavor, calendars, tides, and magic surges.
        </p>
      </div>

      <div className="space-y-6">
        {/* Suns */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Suns (count)
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            Light cycle, climate flavor. 0–5 (usually 1).
          </p>
          <NumberStepper
            value={data.sunsCount}
            onCommit={(value) => onUpdate({ sunsCount: value })}
            min={0}
            max={5}
            label="suns"
          />
        </div>

        {/* Moons */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Moons (repeatable)
            </label>
            <button
              type="button"
              onClick={addMoon}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Moon
            </button>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Calendars, tides, magic surges. Each moon has a name, cycle length, and optional omens.
          </p>

          <div className="space-y-4">
            {data.moons.length === 0 ? (
              <div className="text-zinc-200 text-center py-8 border-2 border-dashed border-white/20 rounded">
                No moons added yet. Click "Add Moon" to create one.
              </div>
            ) : (
              data.moons.map((moon, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-zinc-200">
                      Moon {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeMoon(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-200 mb-1">
                        Name (≤40 chars)
                      </label>
                      <Input
                        value={moon.name}
                        onCommit={(value) => updateMoon(index, { name: value })}
                        placeholder="Moon name..."
                        maxLength={40}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-200 mb-1">
                        Cycle Length (days, 1–999)
                      </label>
                      <NumberInput
                        value={moon.cycleDays}
                        onCommit={(value) => updateMoon(index, { cycleDays: value })}
                        placeholder="Days"
                        min={1}
                        max={999}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-200 mb-1">
                        Omen Notes (≤120 chars)
                      </label>
                      <Input
                        value={moon.omen}
                        onCommit={(value) => updateMoon(index, { omen: value })}
                        placeholder="Optional omens..."
                        maxLength={120}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
