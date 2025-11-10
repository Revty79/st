"use client";

import { useState } from "react";

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

// Textarea component
const Textarea = ({ value, onCommit, placeholder, maxLength }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
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
        rows={3}
        className="w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 resize-y"
      />
      {maxLength && (
        <div className="text-sm text-white mt-1 text-right">
          {charCount}/{maxLength}
        </div>
      )}
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
    // Allow negative numbers for historical dates
    if (/^-?\d*$/.test(newValue) || newValue === "") {
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

export interface TimelineVertebraData {
  name: string;
  startYear: number | null;
  endYear: number | null;
  isPivot: boolean;
  description: string;
}

export interface WorldTimelineData {
  vertebrae: TimelineVertebraData[];
}

interface WorldTimelineFormProps {
  data: WorldTimelineData;
  onUpdate: (data: Partial<WorldTimelineData>) => void;
}

export default function WorldTimelineForm({ data, onUpdate }: WorldTimelineFormProps) {
  const safeData = {
    ...data,
    vertebrae: data.vertebrae || []
  };

  const addVertebra = () => {
    const newVertebrae = [...safeData.vertebrae, { 
      name: "", 
      startYear: null, 
      endYear: null, 
      isPivot: false,
      description: "" 
    }];
    onUpdate({ vertebrae: newVertebrae });
  };

  const removeVertebra = (index: number) => {
    const newVertebrae = safeData.vertebrae.filter((_, i) => i !== index);
    onUpdate({ vertebrae: newVertebrae });
  };

  const updateVertebra = (index: number, updates: Partial<TimelineVertebraData>) => {
    const newVertebrae = safeData.vertebrae.map((vertebra, i) => 
      i === index ? { ...vertebra, ...updates } : vertebra
    );
    onUpdate({ vertebrae: newVertebrae });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newVertebrae = [...safeData.vertebrae];
    [newVertebrae[index - 1], newVertebrae[index]] = [newVertebrae[index], newVertebrae[index - 1]];
    onUpdate({ vertebrae: newVertebrae });
  };

  const moveDown = (index: number) => {
    if (index === safeData.vertebrae.length - 1) return;
    const newVertebrae = [...safeData.vertebrae];
    [newVertebrae[index], newVertebrae[index + 1]] = [newVertebrae[index + 1], newVertebrae[index]];
    onUpdate({ vertebrae: newVertebrae });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">World Timeline — Vertebrae Only</h2>
        <p className="text-sm text-white mt-1">
          High-level historical periods that form the backbone of your world's history. These are distinct from detailed Eras (which have full catalogs).
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Timeline Vertebrae (optional, repeatable, ordered)
            </label>
            <button
              type="button"
              onClick={addVertebra}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Vertebra
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Major historical periods (e.g., "Age of Dragons", "The Sundering", "Modern Era"). Use ↑/↓ to reorder.
          </p>

          <div className="space-y-4">
            {safeData.vertebrae.length === 0 ? (
              <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
                No timeline vertebrae defined. Click "Add Vertebra" to create one.
              </div>
            ) : (
              safeData.vertebrae.map((vertebra, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white">
                        #{index + 1}
                      </h4>
                      {vertebra.isPivot && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded">
                          PIVOT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-white hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === safeData.vertebrae.length - 1}
                        className="text-white hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeVertebra(index)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Era Name (≤80 chars)
                      </label>
                      <Input
                        value={vertebra.name}
                        onCommit={(value) => updateVertebra(index, { name: value })}
                        placeholder="e.g., Age of Dragons, The Sundering..."
                        maxLength={80}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          Start Year
                        </label>
                        <NumberInput
                          value={vertebra.startYear}
                          onCommit={(value) => updateVertebra(index, { startYear: value })}
                          placeholder="e.g., -500, 0, 1200..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          End Year
                        </label>
                        <NumberInput
                          value={vertebra.endYear}
                          onCommit={(value) => updateVertebra(index, { endYear: value })}
                          placeholder="e.g., 500, 1200..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          Mark as Pivot Event
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            checked={vertebra.isPivot}
                            onChange={(e) => updateVertebra(index, { isPivot: e.target.checked })}
                            className="w-5 h-5 rounded bg-white/10 border-white/20 text-amber-500 focus:ring-2 focus:ring-amber-400"
                          />
                          <span className="text-sm text-white">
                            Pivot Point
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Description / Summary (≤300 chars)
                      </label>
                      <Textarea
                        value={vertebra.description}
                        onCommit={(value) => updateVertebra(index, { description: value })}
                        placeholder="Brief summary of this historical period..."
                        maxLength={300}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="border-l-4 border-blue-500 bg-blue-500/10 p-4 rounded">
          <h4 className="text-sm font-semibold text-blue-200 mb-2">
            ℹ️ Timeline vs. Eras
          </h4>
          <p className="text-xs text-white">
            <strong>Timeline Vertebrae</strong> are high-level historical periods for narrative structure.<br />
            <strong>Eras</strong> (managed elsewhere) have full catalogs of races, creatures, deities, etc. and are used for campaigns.<br />
            You can have overlapping vertebrae and eras, or use them independently.
          </p>
        </div>
      </div>
    </div>
  );
}
