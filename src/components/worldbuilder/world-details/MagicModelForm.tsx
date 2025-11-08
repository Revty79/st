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
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-200 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
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
        className="w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-200 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 resize-y"
      />
      {maxLength && (
        <div className="text-sm text-zinc-200 mt-1 text-right">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
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
export interface MagicModelData {
  magicSystems: string[];
  magicCustoms: string[];
  sourceStatement: string;
  unbreakableRules: string[];
  corruptionLevel: string;
  corruptionNote: string;
  magicRarity: string;
}

interface MagicModelFormProps {
  data: MagicModelData;
  onUpdate: (data: Partial<MagicModelData>) => void;
}

export default function MagicModelForm({ data, onUpdate }: MagicModelFormProps) {
  const [newRule, setNewRule] = useState("");
  const [newCustom, setNewCustom] = useState("");

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
    { value: "Commonplace", label: "Commonplace" },
    { value: "Uncommon", label: "Uncommon" },
    { value: "Rare", label: "Rare" },
    { value: "Legendary", label: "Legendary" }
  ];

  const addRule = () => {
    if (newRule.trim() && data.unbreakableRules.length < 10) {
      onUpdate({ unbreakableRules: [...data.unbreakableRules, newRule.trim()] });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    onUpdate({ 
      unbreakableRules: data.unbreakableRules.filter((_, i) => i !== index) 
    });
  };

  const addCustomSystem = () => {
    if (newCustom.trim() && !data.magicCustoms.includes(newCustom.trim())) {
      onUpdate({ magicCustoms: [...data.magicCustoms, newCustom.trim()] });
      setNewCustom("");
    }
  };

  const removeCustomSystem = (index: number) => {
    onUpdate({ 
      magicCustoms: data.magicCustoms.filter((_, i) => i !== index) 
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Magic Model (Global Rules) — Player Summary + G.O.D Rules</h2>
        <p className="text-sm text-zinc-200 mt-1">
          Hard ceiling the Era/Setting must obey. Sets the magical possibilities and limitations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Allowed Systems */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Allowed Systems (Master List)
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            Check which magical systems exist in your world.
          </p>
          <CheckboxList
            values={data.magicSystems}
            onCommit={(values) => onUpdate({ magicSystems: values })}
            options={magicSystemOptions}
          />
        </div>

        {/* Custom Magic Systems */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Custom Magic Systems
          </label>
          <p className="text-xs text-zinc-500 mb-2">
            Add your own magical systems beyond the standard list.
          </p>
          
          <div className="space-y-2">
            {data.magicCustoms.map((custom, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-white/10 text-zinc-200 rounded border border-white/20">{custom}</span>
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
          <p className="text-xs text-zinc-500 mb-2">
            1–2 sentences describing where magic comes from. ≤240 chars.
          </p>
          <Textarea
            value={data.sourceStatement}
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
          <p className="text-xs text-zinc-500 mb-2">
            How common is magical ability in your world?
          </p>
          <Select
            value={data.magicRarity}
            onCommit={(value) => onUpdate({ magicRarity: value })}
            options={rarityOptions}
          />
        </div>

        {/* Cost/Corruption Level */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cost/Corruption Level
          </label>
          <p className="text-xs text-zinc-500 mb-2">
            What price does magic exact from its users?
          </p>
          <Select
            value={data.corruptionLevel}
            onCommit={(value) => onUpdate({ corruptionLevel: value })}
            options={corruptionOptions}
          />
          
          {data.corruptionLevel === "Custom" && (
            <div className="mt-2">
              <Input
                value={data.corruptionNote}
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
          <p className="text-xs text-zinc-500 mb-2">
            0–10 items, each ≤120 chars. Fundamental magical laws that cannot be broken.
          </p>
          
          <div className="space-y-2">
            {data.unbreakableRules.map((rule, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="flex-1 px-3 py-2 bg-white/10 text-zinc-200 rounded text-sm border border-white/20">
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

          {data.unbreakableRules.length < 10 && (
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

          <div className="text-sm text-zinc-200">
            {data.unbreakableRules.length}/10 rules
          </div>
        </div>
      </div>
    </div>
  );
}
