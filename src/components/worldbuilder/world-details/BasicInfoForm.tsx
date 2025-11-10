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
        <div className="text-sm text-zinc-200 mt-1 text-right">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
};

const TagInput = ({ tags, onCommit }: {
  tags: string[];
  onCommit: (tags: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  
  const predefinedTags = [
    "High Fantasy", "Low Fantasy", "Dark Fantasy", "Sci-Fi", "Steampunk", 
    "Cyberpunk", "Post-Apocalyptic", "Horror", "Mystery", "Adventure",
    "Political Intrigue", "War", "Exploration", "Urban Fantasy", "Space Opera"
  ];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 7) {
      onCommit([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onCommit(tags.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-amber-400/20 text-amber-100 border border-amber-400/30"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-amber-200 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {predefinedTags
          .filter(tag => !tags.includes(tag))
          .slice(0, 10)
          .map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              disabled={tags.length >= 7}
              className="px-2 py-1 text-sm border border-white/20 rounded bg-white/5 text-zinc-200 hover:bg-white/10 disabled:opacity-50"
            >
              {tag}
            </button>
          ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add custom tag..."
          disabled={tags.length >= 7}
          className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-white/5"
        />
        <button
          type="button"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim() || tags.length >= 7}
          className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      
      <div className="text-sm text-zinc-200">
        {tags.length}/7 tags
      </div>
    </div>
  );
};

// Basic Info Form Section
export interface BasicInfoData {
  name: string;
  pitch: string;
  tags: string[];
  styleGuardrails: string[];
}

interface BasicInfoFormProps {
  data: BasicInfoData;
  onUpdate: (data: Partial<BasicInfoData>) => void;
}

const GuardrailInput = ({ guardrails, onCommit }: {
  guardrails: string[];
  onCommit: (guardrails: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  
  const predefinedGuardrails = [
    "No time travel", "No resurrection", "No mind control", "Magic has costs",
    "Death is permanent", "No world-ending threats", "Technology is limited",
    "Dragons are rare", "Gods don't intervene directly", "Healing is slow"
  ];

  const addGuardrail = (guardrail: string) => {
    const trimmed = guardrail.trim();
    if (trimmed && !guardrails.includes(trimmed) && guardrails.length < 5) {
      onCommit([...guardrails, trimmed]);
    }
    setInputValue("");
  };

  const removeGuardrail = (index: number) => {
    onCommit(guardrails.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGuardrail(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {guardrails.map((guardrail, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-red-400/20 text-red-100 border border-red-400/30"
          >
            {guardrail}
            <button
              type="button"
              onClick={() => removeGuardrail(index)}
              className="ml-1 text-red-200 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {predefinedGuardrails
          .filter(g => !guardrails.includes(g))
          .slice(0, 8)
          .map(guardrail => (
            <button
              key={guardrail}
              type="button"
              onClick={() => addGuardrail(guardrail)}
              disabled={guardrails.length >= 5}
              className="px-2 py-1 text-sm border border-white/20 rounded bg-white/5 text-zinc-200 hover:bg-white/10 disabled:opacity-50"
            >
              {guardrail}
            </button>
          ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add custom guardrail..."
          disabled={guardrails.length >= 5}
          className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-white/5"
        />
        <button
          type="button"
          onClick={() => addGuardrail(inputValue)}
          disabled={!inputValue.trim() || guardrails.length >= 5}
          className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      
      <div className="text-sm text-zinc-200">
        {guardrails.length}/5 guardrails (3–5 recommended)
      </div>
    </div>
  );
};

export default function BasicInfoForm({ data, onUpdate }: BasicInfoFormProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Basic Info — Player-Facing</h2>
        <p className="text-sm text-zinc-200 mt-1">
          Core information that sets the foundation and vibe for your world.
        </p>
      </div>

      <div className="space-y-6">
        {/* World Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            World Name
          </label>
          <p className="text-xs text-white mb-2">
            Primary key in UI and exports. 2–60 chars, unique per account.
          </p>
          <Input
            value={data.name}
            onCommit={(value) => onUpdate({ name: value })}
            placeholder="Enter world name..."
            maxLength={60}
            className="text-lg font-medium"
          />
        </div>

        {/* Short Pitch */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Short Pitch
          </label>
          <p className="text-xs text-white mb-2">
            Sets vibe quickly for tables and listings. 1–2 sentences, ≤200 chars.
          </p>
          <Textarea
            value={data.pitch}
            onCommit={(value) => onUpdate({ pitch: value })}
            placeholder="Describe your world in a compelling sentence or two..."
            maxLength={200}
          />
        </div>

        {/* Genre / Tone Tags */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Genre / Tone Tags
          </label>
          <p className="text-xs text-white mb-2">
            Filtering/search and expectation setting. 3–7 chips; freeform tags from controlled list + custom.
          </p>
          <TagInput
            tags={data.tags}
            onCommit={(tags) => onUpdate({ tags })}
          />
        </div>

        {/* Style Guardrails */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Style Guardrails
          </label>
          <p className="text-xs text-white mb-2">
            Core boundaries that define what won't happen in your world. 3–5 clear "No X" or "X always Y" statements.
          </p>
          <GuardrailInput
            guardrails={data.styleGuardrails || []}
            onCommit={(guardrails) => onUpdate({ styleGuardrails: guardrails })}
          />
        </div>
      </div>
    </div>
  );
}
