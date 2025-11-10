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

export interface CurrencyAnchorData {
  creditValue: number | null;
}

interface CurrencyAnchorFormProps {
  data: CurrencyAnchorData;
  onUpdate: (data: Partial<CurrencyAnchorData>) => void;
}

export default function CurrencyAnchorForm({ data, onUpdate }: CurrencyAnchorFormProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-2xl font-bold text-white">Currency Anchor</h2>
        <p className="text-sm text-white/60 mt-2">
          Define the baseline value for all game currency.
        </p>
      </div>

      {/* Explanation */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-200 mb-3">How Currency Works in This System</h3>
        <div className="space-y-2 text-sm text-white/80">
          <p>
            All game items, services, and prices are internally stored in a universal unit called <strong className="text-white">Credits</strong>.
          </p>
          <p>
            Your world currencies (gold pieces, silver coins, credits, dollars, etc.) are calculated based on their relationship to this Credit value.
          </p>
          <p className="text-amber-200 font-medium">
            ⚠️ Changing this value will automatically recalculate how your world's currencies interact with all game systems, items, and prices.
          </p>
        </div>
      </div>

      {/* Single Number Input */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        <label className="block text-lg font-semibold text-white mb-3">
          What does 1 Credit equal in your world?
        </label>
        <p className="text-sm text-white/60 mb-4">
          Enter a numeric value (e.g., 1, 2, 3.5, 10, etc.)
        </p>
        <NumberInput
          value={data.creditValue ?? null}
          onCommit={(value) => onUpdate({ creditValue: value })}
          placeholder="e.g., 1, 2, 3.5, 10..."
          min={0.01}
        />
        <p className="text-xs text-white/40 mt-2">
          Example: If 1 Credit = 10 copper pieces in your world, enter <strong>10</strong>
        </p>
      </div>

      {/* Additional Context */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-xs text-white/60">
          <strong>Tip:</strong> This numeric anchor maintains consistent pricing across your world, eras, and campaigns. 
          Items and services will reference this baseline, ensuring economic consistency throughout your game.
        </p>
      </div>
    </div>
  );
}
