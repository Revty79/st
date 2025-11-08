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

const CheckboxList = ({ values, onCommit, options }: {
  values: string[];
  onCommit: (values: string[]) => void;
  options: Array<{ value: string; label: string; description?: string }>;
}) => {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onCommit(values.filter(v => v !== value));
    } else {
      onCommit([...values, value]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-start space-x-2 cursor-pointer text-white p-3 border border-white/20 rounded bg-white/5 hover:bg-white/10">
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => toggle(option.value)}
            className="rounded accent-amber-500 mt-1"
          />
          <div>
            <span className="text-sm font-medium">{option.label}</span>
            {option.description && (
              <p className="text-xs text-zinc-200 mt-1">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

// Data interfaces
export interface TechnologyCategoryData {
  category: string;
  level: string;
  restrictions: string;
  notes: string;
}

export interface TechnologyWindowData {
  overallLevel: string;
  availableCategories: string[];
  customCategories: TechnologyCategoryData[];
  progressionRules: string;
  restrictedTechnologies: string[];
  advancementMechanism: string;
  magicTechInteraction: string;
  notes: string;
}

interface TechnologyWindowFormProps {
  data: TechnologyWindowData;
  onUpdate: (data: Partial<TechnologyWindowData>) => void;
}

export default function TechnologyWindowForm({ data, onUpdate }: TechnologyWindowFormProps) {
  const [newRestriction, setNewRestriction] = useState("");

  const overallLevelOptions = [
    { value: "", label: "Select overall tech level..." },
    { value: "Stone Age", label: "Stone Age" },
    { value: "Bronze Age", label: "Bronze Age" },
    { value: "Iron Age", label: "Iron Age" },
    { value: "Classical", label: "Classical" },
    { value: "Medieval", label: "Medieval" },
    { value: "Renaissance", label: "Renaissance" },
    { value: "Industrial", label: "Industrial" },
    { value: "Modern", label: "Modern" },
    { value: "Near Future", label: "Near Future" },
    { value: "Far Future", label: "Far Future" },
    { value: "Post-Apocalyptic", label: "Post-Apocalyptic" },
    { value: "Mixed", label: "Mixed/Variable" }
  ];

  const technologyCategories = [
    { 
      value: "Agriculture", 
      label: "Agriculture & Food Production",
      description: "Farming, animal husbandry, food preservation"
    },
    { 
      value: "Metallurgy", 
      label: "Metallurgy & Materials",
      description: "Metal working, alloys, material sciences"
    },
    { 
      value: "Transportation", 
      label: "Transportation",
      description: "Vehicles, ships, roads, logistics"
    },
    { 
      value: "Construction", 
      label: "Construction & Engineering",
      description: "Architecture, civil engineering, megaprojects"
    },
    { 
      value: "Medicine", 
      label: "Medicine & Health",
      description: "Healing arts, surgery, disease prevention"
    },
    { 
      value: "Communication", 
      label: "Communication",
      description: "Writing, printing, telecommunications"
    },
    { 
      value: "Energy", 
      label: "Energy Production",
      description: "Power sources, distribution, storage"
    },
    { 
      value: "Weaponry", 
      label: "Weaponry & Military Tech",
      description: "Weapons, armor, fortifications"
    },
    { 
      value: "Computation", 
      label: "Computation & Information",
      description: "Calculating devices, data processing"
    },
    { 
      value: "Optics", 
      label: "Optics & Precision Instruments",
      description: "Lenses, telescopes, measurement tools"
    },
    { 
      value: "Chemistry", 
      label: "Chemistry & Alchemy",
      description: "Chemical processes, explosives, substances"
    },
    { 
      value: "Biotechnology", 
      label: "Biotechnology",
      description: "Genetic engineering, biological manipulation"
    }
  ];

  const advancementMechanismOptions = [
    { value: "", label: "Select advancement mechanism..." },
    { value: "Natural", label: "Natural progression over time" },
    { value: "Discovery", label: "Requires specific discoveries/research" },
    { value: "Magic-dependent", label: "Tied to magical understanding" },
    { value: "Resource-dependent", label: "Limited by available resources" },
    { value: "Cultural", label: "Depends on cultural attitudes" },
    { value: "Lost knowledge", label: "Rediscovering ancient technologies" },
    { value: "Restricted", label: "Artificially suppressed/controlled" },
    { value: "External", label: "Introduced from outside sources" }
  ];

  const magicTechOptions = [
    { value: "", label: "Select magic-tech relationship..." },
    { value: "Separate", label: "Magic and technology are separate" },
    { value: "Complementary", label: "Magic enhances technology" },
    { value: "Competitive", label: "Magic replaces technology" },
    { value: "Integrated", label: "Magic is technology (magitech)" },
    { value: "Incompatible", label: "Magic interferes with technology" },
    { value: "Dependent", label: "Technology requires magic to function" },
    { value: "Variable", label: "Relationship varies by application" }
  ];

  // Helper functions
  const addCustomCategory = () => {
    const newCategories = [...data.customCategories, { category: "", level: "", restrictions: "", notes: "" }];
    onUpdate({ customCategories: newCategories });
  };

  const removeCustomCategory = (index: number) => {
    const newCategories = data.customCategories.filter((_, i) => i !== index);
    onUpdate({ customCategories: newCategories });
  };

  const updateCustomCategory = (index: number, updates: Partial<TechnologyCategoryData>) => {
    const newCategories = data.customCategories.map((category, i) => 
      i === index ? { ...category, ...updates } : category
    );
    onUpdate({ customCategories: newCategories });
  };

  const addRestriction = () => {
    if (newRestriction.trim()) {
      const newRestrictions = [...data.restrictedTechnologies, newRestriction.trim()];
      onUpdate({ restrictedTechnologies: newRestrictions });
      setNewRestriction("");
    }
  };

  const removeRestriction = (index: number) => {
    const newRestrictions = data.restrictedTechnologies.filter((_, i) => i !== index);
    onUpdate({ restrictedTechnologies: newRestrictions });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Technology Window (Global Bounds) — Player Expectations; G.O.D Limits</h2>
        <p className="text-sm text-zinc-200 mt-1">
          Sets technological ceiling and progression rules. Defines what's possible in your world and how advancement works.
        </p>
      </div>

      <div className="space-y-6">
        {/* Overall Technology Level */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Overall Technology Level
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            General technological baseline for your world.
          </p>
          <Select
            value={data.overallLevel}
            onCommit={(value) => onUpdate({ overallLevel: value })}
            options={overallLevelOptions}
            placeholder="Select overall tech level..."
          />
        </div>

        {/* Available Technology Categories */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Available Technology Categories
          </label>
          <p className="text-xs text-zinc-200 mb-3">
            Select which categories of technology exist in your world.
          </p>
          <CheckboxList
            values={data.availableCategories}
            onCommit={(values) => onUpdate({ availableCategories: values })}
            options={technologyCategories}
          />
        </div>

        {/* Custom Technology Categories */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Custom Technology Categories
            </label>
            <button
              type="button"
              onClick={addCustomCategory}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Custom Category
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Define specific technology categories unique to your world.
          </p>

          <div className="space-y-4">
            {data.customCategories.map((category, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    Custom Category {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeCustomCategory(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Category Name
                    </label>
                    <Input
                      value={category.category}
                      onCommit={(value) => updateCustomCategory(index, { category: value })}
                      placeholder="Technology category..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Development Level
                    </label>
                    <Input
                      value={category.level}
                      onCommit={(value) => updateCustomCategory(index, { level: value })}
                      placeholder="Primitive, Advanced, etc."
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Restrictions
                    </label>
                    <Textarea
                      value={category.restrictions}
                      onCommit={(value) => updateCustomCategory(index, { restrictions: value })}
                      placeholder="What limits this technology..."
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Notes
                    </label>
                    <Textarea
                      value={category.notes}
                      onCommit={(value) => updateCustomCategory(index, { notes: value })}
                      placeholder="Additional details..."
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restricted Technologies */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Restricted or Forbidden Technologies
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            Technologies that are banned, lost, or impossible in your world.
          </p>
          
          <div className="space-y-2 mb-4">
            {data.restrictedTechnologies.map((restriction, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-white/10 text-white rounded border border-white/20 text-sm">
                  {restriction}
                </span>
                <button
                  type="button"
                  onClick={() => removeRestriction(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newRestriction}
              onCommit={setNewRestriction}
              placeholder="Add forbidden technology..."
              maxLength={100}
            />
            <button
              type="button"
              onClick={addRestriction}
              disabled={!newRestriction.trim()}
              className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Advancement Mechanism */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Advancement Mechanism
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            How does technology advance in your world?
          </p>
          <Select
            value={data.advancementMechanism}
            onCommit={(value) => onUpdate({ advancementMechanism: value })}
            options={advancementMechanismOptions}
            placeholder="Select advancement mechanism..."
          />
        </div>

        {/* Magic-Technology Interaction */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Magic-Technology Interaction
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            How do magic and technology interact in your world?
          </p>
          <Select
            value={data.magicTechInteraction}
            onCommit={(value) => onUpdate({ magicTechInteraction: value })}
            options={magicTechOptions}
            placeholder="Select magic-tech relationship..."
          />
        </div>

        {/* Progression Rules */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Progression Rules & Requirements
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            Describe how technological advancement works in your world.
          </p>
          <Textarea
            value={data.progressionRules}
            onCommit={(value) => onUpdate({ progressionRules: value })}
            placeholder="Explain how technology advances, what's required for breakthroughs, any special rules..."
            maxLength={500}
            className="min-h-[100px]"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Additional Technology Notes
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            Any other important information about technology in your world.
          </p>
          <Textarea
            value={data.notes}
            onCommit={(value) => onUpdate({ notes: value })}
            placeholder="Special technologies, unique inventions, technological mysteries..."
            maxLength={800}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}