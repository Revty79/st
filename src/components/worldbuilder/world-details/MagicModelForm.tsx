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

// Select component
const Select = ({ value, onCommit, options }: {
  value: string;
  onCommit: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onCommit(e.target.value)}
      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Checkbox list component
const CheckboxList = ({ values, onCommit, options }: {
  values: string[];
  onCommit: (values: string[]) => void;
  options: Array<{ value: string; label: string }>;
}) => {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onCommit(values.filter(v => v !== value));
    } else {
      onCommit([...values, value]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-white">
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => toggle(option.value)}
            className="rounded accent-amber-500"
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

// Magic Model data interface
export interface CorruptionThresholdData {
  percentage: number | null;
  effect: string;
}

export interface MagicModelData {
  magicSystems: string[];
  magicCustoms: string[];
  sourceStatement: string;
  unbreakableRules: string[];
  corruptionLevel: string;
  corruptionNote: string;
  magicRarity: string;
  corruptionThresholds: CorruptionThresholdData[];
  corruptionRecoveryRate: string;
  corruptionTables: string;
}

interface MagicModelFormProps {
  data: MagicModelData;
  onUpdate: (data: Partial<MagicModelData>) => void;
}

export default function MagicModelForm({ data, onUpdate }: MagicModelFormProps) {
  const [newRule, setNewRule] = useState("");
  const [newCustom, setNewCustom] = useState("");

  // Ensure arrays are never undefined
  const safeData = {
    ...data,
    magicSystems: data.magicSystems || [],
    magicCustoms: data.magicCustoms || [],
    unbreakableRules: data.unbreakableRules || [],
    corruptionThresholds: data.corruptionThresholds || [],
    corruptionRecoveryRate: data.corruptionRecoveryRate || "",
    corruptionTables: data.corruptionTables || ""
  };

  const magicSystemOptions = [
    { value: "Spellcraft", label: "Spellcraft" },
    { value: "Talisman-making", label: "Talisman-making" },
    { value: "Faith-based miracles", label: "Faith-based miracles" },
    { value: "Psionics", label: "Psionics" },
    { value: "Bardic arts", label: "Bardic arts" }
  ];

  const corruptionOptions = [
    { value: "None", label: "None" },
    { value: "Mild", label: "Mild" },
    { value: "Moderate", label: "Moderate" },
    { value: "Severe", label: "Severe" },
    { value: "Custom", label: "Custom" }
  ];

  const rarityOptions = [
    { value: "Unusable", label: "Unusable / No Magic" },
    { value: "Commonplace", label: "Commonplace" },
    { value: "Uncommon", label: "Uncommon" },
    { value: "Rare", label: "Rare" },
    { value: "Legendary", label: "Legendary" }
  ];

  const addRule = () => {
    if (newRule.trim() && safeData.unbreakableRules.length < 10) {
      onUpdate({ unbreakableRules: [...safeData.unbreakableRules, newRule.trim()] });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    onUpdate({ 
      unbreakableRules: safeData.unbreakableRules.filter((_, i) => i !== index) 
    });
  };

  const addCustomSystem = () => {
    if (newCustom.trim() && !safeData.magicCustoms.includes(newCustom.trim())) {
      onUpdate({ magicCustoms: [...safeData.magicCustoms, newCustom.trim()] });
      setNewCustom("");
    }
  };

  const removeCustomSystem = (index: number) => {
    onUpdate({ 
      magicCustoms: safeData.magicCustoms.filter((_, i) => i !== index) 
    });
  };

  const addCorruptionThreshold = () => {
    const newThresholds = [...safeData.corruptionThresholds, { percentage: null, effect: "" }];
    onUpdate({ corruptionThresholds: newThresholds });
  };

  const removeCorruptionThreshold = (index: number) => {
    const newThresholds = safeData.corruptionThresholds.filter((_, i) => i !== index);
    onUpdate({ corruptionThresholds: newThresholds });
  };

  const updateCorruptionThreshold = (index: number, updates: Partial<CorruptionThresholdData>) => {
    const newThresholds = safeData.corruptionThresholds.map((threshold, i) => 
      i === index ? { ...threshold, ...updates } : threshold
    );
    onUpdate({ corruptionThresholds: newThresholds });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Magic Model (Global Rules) — Player Summary + G.O.D Rules</h2>
        <p className="text-sm text-white mt-1">
          Hard ceiling the Era/Setting must obey. Sets the magical possibilities and limitations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Allowed Systems */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Allowed Systems (Master List)
          </label>
          <p className="text-xs text-white mb-3">
            Check which magical systems exist in your world.
          </p>
          <CheckboxList
            values={safeData.magicSystems}
            onCommit={(values) => onUpdate({ magicSystems: values })}
            options={magicSystemOptions}
          />
        </div>

        {/* Custom Magic Systems */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Custom Magic Systems
          </label>
          <p className="text-xs text-white mb-2">
            Add your own magical systems beyond the standard list.
          </p>
          
          <div className="space-y-2">
            {safeData.magicCustoms.map((custom, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-white/10 text-white rounded border border-white/20">{custom}</span>
                <button
                  type="button"
                  onClick={() => removeCustomSystem(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <Input
              value={newCustom}
              onCommit={setNewCustom}
              placeholder="Add custom magic system..."
            />
            <button
              type="button"
              onClick={addCustomSystem}
              disabled={!newCustom.trim()}
              className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Source Statement */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Source Statement
          </label>
          <p className="text-xs text-white mb-2">
            1–2 sentences describing where magic comes from. ≤240 chars.
          </p>
          <Textarea
            value={safeData.sourceStatement}
            onCommit={(value) => onUpdate({ sourceStatement: value })}
            placeholder="Magic flows from the ley lines that crisscross the world, tapped by those with the proper training..."
            maxLength={240}
          />
        </div>

        {/* Magic Rarity */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Magic Rarity
          </label>
          <p className="text-xs text-white mb-2">
            How common is magical ability in your world?
          </p>
          <Select
            value={safeData.magicRarity}
            onCommit={(value) => onUpdate({ magicRarity: value })}
            options={rarityOptions}
          />
        </div>

        {/* Cost/Corruption Level */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cost/Corruption Level
          </label>
          <p className="text-xs text-white mb-2">
            What price does magic exact from its users?
          </p>
          <Select
            value={safeData.corruptionLevel}
            onCommit={(value) => onUpdate({ corruptionLevel: value })}
            options={corruptionOptions}
          />
          
          {safeData.corruptionLevel === "Custom" && (
            <div className="mt-2">
              <Input
                value={safeData.corruptionNote}
                onCommit={(value) => onUpdate({ corruptionNote: value })}
                placeholder="Describe your custom corruption system..."
              />
            </div>
          )}
        </div>

        {/* Unbreakable Rules */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Unbreakable Rules
          </label>
          <p className="text-xs text-white mb-2">
            0–10 items, each ≤120 chars. Fundamental magical laws that cannot be broken.
          </p>
          
          <div className="space-y-2">
            {safeData.unbreakableRules.map((rule, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="flex-1 px-3 py-2 bg-white/10 text-white rounded text-sm border border-white/20">
                  {index + 1}. {rule}
                </span>
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="text-red-400 hover:text-red-300 mt-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {safeData.unbreakableRules.length < 10 && (
            <div className="flex gap-2 mt-2">
              <Input
                value={newRule}
                onCommit={setNewRule}
                placeholder="Add a new unbreakable rule..."
                maxLength={120}
              />
              <button
                type="button"
                onClick={addRule}
                disabled={!newRule.trim()}
                className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          <div className="text-sm text-white">
            {safeData.unbreakableRules.length}/10 rules
          </div>
        </div>

        {/* Corruption Percentile Tracking */}
        <div className="border-t border-white/20 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Corruption Percentile System (0-100 Track)
          </h3>
          <p className="text-xs text-white mb-4">
            Define how corruption accumulates and what happens at different thresholds.
          </p>

          {/* Corruption Thresholds */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white">
                Corruption Thresholds (% → Effect)
              </label>
              <button
                type="button"
                onClick={addCorruptionThreshold}
                className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
              >
                Add Threshold
              </button>
            </div>

            <div className="space-y-3">
              {safeData.corruptionThresholds.length === 0 ? (
                <div className="text-white text-center py-6 border-2 border-dashed border-white/20 rounded">
                  No thresholds defined. Click "Add Threshold" to create one.
                </div>
              ) : (
                safeData.corruptionThresholds.map((threshold, index) => (
                  <div key={index} className="border border-white/20 rounded-lg p-3 bg-white/5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-white">
                        Threshold {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeCorruptionThreshold(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white mb-1">
                          Percentage (0-100)
                        </label>
                        <NumberInput
                          value={threshold.percentage}
                          onCommit={(value) => updateCorruptionThreshold(index, { percentage: value })}
                          placeholder="e.g., 25, 50, 75..."
                          min={0}
                          max={100}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-white mb-1">
                          Effect at this Threshold
                        </label>
                        <Input
                          value={threshold.effect}
                          onCommit={(value) => updateCorruptionThreshold(index, { effect: value })}
                          placeholder="What happens at this corruption level..."
                          maxLength={200}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recovery Rate */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Corruption Recovery Rate
            </label>
            <p className="text-xs text-white mb-2">
              How does corruption reduce over time? (e.g., "1% per day of rest", "Requires ritual cleansing", "Permanent")
            </p>
            <Input
              value={safeData.corruptionRecoveryRate}
              onCommit={(value) => onUpdate({ corruptionRecoveryRate: value })}
              placeholder="Describe recovery mechanics..."
              maxLength={150}
            />
          </div>

          {/* Corruption Tables */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Corruption Effect Tables (optional)
            </label>
            <p className="text-xs text-white mb-2">
              Reference to tables, mutations, side effects, or random corruption manifestations.
            </p>
            <Textarea
              value={safeData.corruptionTables}
              onCommit={(value) => onUpdate({ corruptionTables: value })}
              placeholder="Describe corruption tables or reference materials..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
