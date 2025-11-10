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
        <span className="text-xs text-white">{label}</span>
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
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    />
  );
};

// Sun type definition
export interface SunData {
  name: string;
  cycleDays: number | null;
  significance: string;
}

// Moon type definition
export interface MoonData {
  name: string;
  cycleDays: number | null;
  omen: string;
}

// Constellation type definition
export interface ConstellationData {
  name: string;
  story: string;
  visibility: string;
  omen: string;
}

// Cosmic Event type definition
export interface CosmicEventData {
  name: string;
  trigger: string;
  scope: string;
  effect: string;
  duration: string;
  storyUse: string;
}

// Astral Bodies data interface
export interface AstralBodiesData {
  suns: SunData[];
  moons: MoonData[];
  constellations: ConstellationData[];
  cosmicEvents: CosmicEventData[];
}

interface AstralBodiesFormProps {
  data: AstralBodiesData;
  onUpdate: (data: Partial<AstralBodiesData>) => void;
}

export default function AstralBodiesForm({ data, onUpdate }: AstralBodiesFormProps) {
  // Ensure arrays are never undefined
  const safeData = {
    ...data,
    suns: data.suns || [],
    moons: data.moons || [],
    constellations: data.constellations || [],
    cosmicEvents: data.cosmicEvents || []
  };

  const addSun = () => {
    const newSuns = [...safeData.suns, { name: "", cycleDays: null, significance: "" }];
    onUpdate({ suns: newSuns });
  };

  const removeSun = (index: number) => {
    const newSuns = safeData.suns.filter((_, i) => i !== index);
    onUpdate({ suns: newSuns });
  };

  const updateSun = (index: number, updates: Partial<SunData>) => {
    const newSuns = safeData.suns.map((sun, i) => 
      i === index ? { ...sun, ...updates } : sun
    );
    onUpdate({ suns: newSuns });
  };

  const addMoon = () => {
    const newMoons = [...safeData.moons, { name: "", cycleDays: null, omen: "" }];
    onUpdate({ moons: newMoons });
  };

  const removeMoon = (index: number) => {
    const newMoons = safeData.moons.filter((_, i) => i !== index);
    onUpdate({ moons: newMoons });
  };

  const updateMoon = (index: number, updates: Partial<MoonData>) => {
    const newMoons = safeData.moons.map((moon, i) => 
      i === index ? { ...moon, ...updates } : moon
    );
    onUpdate({ moons: newMoons });
  };

  const addConstellation = () => {
    const newConstellations = [...safeData.constellations, { 
      name: "", 
      story: "", 
      visibility: "", 
      omen: "" 
    }];
    onUpdate({ constellations: newConstellations });
  };

  const removeConstellation = (index: number) => {
    const newConstellations = safeData.constellations.filter((_, i) => i !== index);
    onUpdate({ constellations: newConstellations });
  };

  const updateConstellation = (index: number, updates: Partial<ConstellationData>) => {
    const newConstellations = safeData.constellations.map((constellation, i) => 
      i === index ? { ...constellation, ...updates } : constellation
    );
    onUpdate({ constellations: newConstellations });
  };

  const addCosmicEvent = () => {
    const newEvents = [...safeData.cosmicEvents, { 
      name: "", 
      trigger: "", 
      scope: "", 
      effect: "", 
      duration: "", 
      storyUse: "" 
    }];
    onUpdate({ cosmicEvents: newEvents });
  };

  const removeCosmicEvent = (index: number) => {
    const newEvents = safeData.cosmicEvents.filter((_, i) => i !== index);
    onUpdate({ cosmicEvents: newEvents });
  };

  const updateCosmicEvent = (index: number, updates: Partial<CosmicEventData>) => {
    const newEvents = safeData.cosmicEvents.map((event, i) => 
      i === index ? { ...event, ...updates } : event
    );
    onUpdate({ cosmicEvents: newEvents });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Astral Bodies — Player Summary; G.O.D Details</h2>
        <p className="text-sm text-white mt-1">
          Light cycles, climate flavor, calendars, tides, and magic surges.
        </p>
      </div>

      <div className="space-y-6">
        {/* Suns */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Suns (repeatable)
            </label>
            <button
              type="button"
              onClick={addSun}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Sun
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Light cycles, climate flavor. Each sun has a name, cycle length, and optional significance.
          </p>

          <div className="space-y-4">
            {safeData.suns.length === 0 ? (
              <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
                No suns added yet. Click "Add Sun" to create one.
              </div>
            ) : (
              safeData.suns.map((sun, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
                      Sun {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeSun(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Name (≤40 chars)
                      </label>
                      <Input
                        value={sun.name}
                        onCommit={(value) => updateSun(index, { name: value })}
                        placeholder="Sun name..."
                        maxLength={40}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Cycle Length (days, 1–999)
                      </label>
                      <NumberInput
                        value={sun.cycleDays}
                        onCommit={(value) => updateSun(index, { cycleDays: value })}
                        placeholder="Days"
                        min={1}
                        max={999}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Significance (≤120 chars)
                      </label>
                      <Input
                        value={sun.significance}
                        onCommit={(value) => updateSun(index, { significance: value })}
                        placeholder="Optional significance..."
                        maxLength={120}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
          <p className="text-xs text-white mb-4">
            Calendars, tides, magic surges. Each moon has a name, cycle length, and optional omens.
          </p>

          <div className="space-y-4">
            {safeData.moons.length === 0 ? (
              <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
                No moons added yet. Click "Add Moon" to create one.
              </div>
            ) : (
              safeData.moons.map((moon, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
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
                      <label className="block text-xs font-medium text-white mb-1">
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
                      <label className="block text-xs font-medium text-white mb-1">
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
                      <label className="block text-xs font-medium text-white mb-1">
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

        {/* Constellations */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Constellations (optional, repeatable)
            </label>
            <button
              type="button"
              onClick={addConstellation}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Constellation
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Star patterns with cultural meaning. Each has a name, story, visibility pattern, and omen significance.
          </p>

          <div className="space-y-4">
            {safeData.constellations.length === 0 ? (
              <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
                No constellations added yet. Click "Add Constellation" to create one.
              </div>
            ) : (
              safeData.constellations.map((constellation, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
                      Constellation {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeConstellation(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Name (≤40 chars)
                      </label>
                      <Input
                        value={constellation.name}
                        onCommit={(value) => updateConstellation(index, { name: value })}
                        placeholder="Constellation name..."
                        maxLength={40}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Visibility (seasonal/year-round)
                      </label>
                      <Input
                        value={constellation.visibility}
                        onCommit={(value) => updateConstellation(index, { visibility: value })}
                        placeholder="When is it visible..."
                        maxLength={60}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white mb-1">
                        Story / Lore (≤200 chars)
                      </label>
                      <Input
                        value={constellation.story}
                        onCommit={(value) => updateConstellation(index, { story: value })}
                        placeholder="Cultural story or meaning..."
                        maxLength={200}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white mb-1">
                        Omen / Significance (≤120 chars)
                      </label>
                      <Input
                        value={constellation.omen}
                        onCommit={(value) => updateConstellation(index, { omen: value })}
                        placeholder="What it portends..."
                        maxLength={120}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cosmic Events */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Cosmic Event Rules (optional, repeatable)
            </label>
            <button
              type="button"
              onClick={addCosmicEvent}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Cosmic Event
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Recurring or one-time celestial events like eclipses, conjunctions, meteor showers, etc. Define triggers, effects, and story hooks.
          </p>

          <div className="space-y-4">
            {safeData.cosmicEvents.length === 0 ? (
              <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
                No cosmic events added yet. Click "Add Cosmic Event" to create one.
              </div>
            ) : (
              safeData.cosmicEvents.map((event, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
                      Cosmic Event {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeCosmicEvent(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white mb-1">
                        Event Name (≤60 chars)
                      </label>
                      <Input
                        value={event.name}
                        onCommit={(value) => updateCosmicEvent(index, { name: value })}
                        placeholder="Name of the cosmic event..."
                        maxLength={60}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Trigger / When
                      </label>
                      <Input
                        value={event.trigger}
                        onCommit={(value) => updateCosmicEvent(index, { trigger: value })}
                        placeholder="How/when does it occur..."
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Scope (global/regional/local)
                      </label>
                      <Input
                        value={event.scope}
                        onCommit={(value) => updateCosmicEvent(index, { scope: value })}
                        placeholder="Affected area..."
                        maxLength={60}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white mb-1">
                        Effect / What Happens
                      </label>
                      <Input
                        value={event.effect}
                        onCommit={(value) => updateCosmicEvent(index, { effect: value })}
                        placeholder="Mechanical or narrative effects..."
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Duration
                      </label>
                      <Input
                        value={event.duration}
                        onCommit={(value) => updateCosmicEvent(index, { duration: value })}
                        placeholder="How long it lasts..."
                        maxLength={60}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Story Use / Hooks
                      </label>
                      <Input
                        value={event.storyUse}
                        onCommit={(value) => updateCosmicEvent(index, { storyUse: value })}
                        placeholder="How to use in narrative..."
                        maxLength={150}
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
