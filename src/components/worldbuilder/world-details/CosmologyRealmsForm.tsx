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
        <div className="text-sm text-white mt-1 text-right">
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
export interface PlaneOfExistenceData {
  name: string;
  type: string;
  description: string;
  inhabitants: string;
  accessMethod: string;
  dangers: string;
  nature: string;
}

export interface DimensionalRuleData {
  rule: string;
  scope: string;
  effects: string;
  exceptions: string;
}

export interface DeityData {
  name: string;
  domain: string;
  stance: string;
  power: string;
  description: string;
  followers: string;
}

export interface AfterlifeRealmData {
  name: string;
  criteria: string;
  description: string;
  duration: string;
}

export interface CosmologyRealmsData {
  cosmicStructure: string;
  planesOfExistence: PlaneOfExistenceData[];
  dimensionalRules: DimensionalRuleData[];
  deities: DeityData[];
  afterlifeSystem: string;
  afterlifeRealms: AfterlifeRealmData[];
  planarTravel: string;
  cosmicThreats: string;
  universalLaws: string;
  notes: string;
}

interface CosmologyRealmsFormProps {
  data: CosmologyRealmsData;
  onUpdate: (data: Partial<CosmologyRealmsData>) => void;
}

export default function CosmologyRealmsForm({ data, onUpdate }: CosmologyRealmsFormProps) {
  // Ensure arrays are never undefined
  const safeData = {
    ...data,
    planesOfExistence: data.planesOfExistence || [],
    dimensionalRules: data.dimensionalRules || [],
    deities: data.deities || [],
    afterlifeRealms: data.afterlifeRealms || []
  };

  const cosmicStructureOptions = [
    { value: "", label: "Select cosmic structure..." },
    { value: "Single Plane", label: "Single Plane (Material only)" },
    { value: "Layered", label: "Layered Planes" },
    { value: "Wheel", label: "Great Wheel" },
    { value: "Tree", label: "World Tree/Cosmic Tree" },
    { value: "Spherical", label: "Crystal Spheres" },
    { value: "Infinite", label: "Infinite Planes" },
    { value: "Pocket Dimensions", label: "Pocket Dimensions" },
    { value: "Multiverse", label: "Multiverse" },
    { value: "Custom", label: "Custom Structure" }
  ];

  const planeTypeOptions = [
    { value: "Material", label: "Material Plane" },
    { value: "Elemental", label: "Elemental Plane" },
    { value: "Energy", label: "Energy Plane" },
    { value: "Astral", label: "Astral Plane" },
    { value: "Ethereal", label: "Ethereal Plane" },
    { value: "Shadow", label: "Shadow Plane" },
    { value: "Celestial", label: "Celestial Plane" },
    { value: "Infernal", label: "Infernal Plane" },
    { value: "Dream", label: "Dream Plane" },
    { value: "Temporal", label: "Temporal Plane" },
    { value: "Divine", label: "Divine Realm" },
    { value: "Pocket", label: "Pocket Dimension" },
    { value: "Dead", label: "Realm of the Dead" },
    { value: "Fey", label: "Feywild/Fey Realm" },
    { value: "Custom", label: "Custom Type" }
  ];

  const planeNatureOptions = [
    { value: "", label: "Select nature..." },
    { value: "Harmonious", label: "Harmonious" },
    { value: "Balanced", label: "Balanced" },
    { value: "Chaotic Energy", label: "Chaotic Energy" },
    { value: "Orderly Structure", label: "Orderly Structure" },
    { value: "Life-affirming", label: "Life-affirming" },
    { value: "Death-touched", label: "Death-touched" },
    { value: "Neutral Ground", label: "Neutral Ground" },
    { value: "Hostile", label: "Hostile" },
    { value: "Welcoming", label: "Welcoming" },
    { value: "Unpredictable", label: "Unpredictable" },
    { value: "Stable", label: "Stable" }
  ];

  const deityStanceOptions = [
    { value: "", label: "Select stance..." },
    { value: "Benevolent", label: "Benevolent" },
    { value: "Protective", label: "Protective" },
    { value: "Neutral Observer", label: "Neutral Observer" },
    { value: "Demanding", label: "Demanding" },
    { value: "Vengeful", label: "Vengeful" },
    { value: "Merciful", label: "Merciful" },
    { value: "Just", label: "Just" },
    { value: "Capricious", label: "Capricious" },
    { value: "Orderly", label: "Orderly" },
    { value: "Wild", label: "Wild" },
    { value: "Mysterious", label: "Mysterious" }
  ];

  const powerLevelOptions = [
    { value: "", label: "Select power level..." },
    { value: "Greater Deity", label: "Greater Deity" },
    { value: "Intermediate Deity", label: "Intermediate Deity" },
    { value: "Lesser Deity", label: "Lesser Deity" },
    { value: "Demigod", label: "Demigod" },
    { value: "Quasi-Deity", label: "Quasi-Deity" },
    { value: "Primordial", label: "Primordial" },
    { value: "Archfey", label: "Archfey" },
    { value: "Archfiend", label: "Archfiend" },
    { value: "Titan", label: "Titan" },
    { value: "Cosmic Entity", label: "Cosmic Entity" }
  ];

  const afterlifeSystemOptions = [
    { value: "", label: "Select afterlife system..." },
    { value: "Deed-based", label: "Deed/Karma-based" },
    { value: "Faith-based", label: "Faith/Religion-based" },
    { value: "Faction-based", label: "Faction/Philosophy-based" },
    { value: "Reincarnation", label: "Reincarnation Cycle" },
    { value: "Ancestral", label: "Ancestral Spirit Realm" },
    { value: "Limbo", label: "Single Afterlife Realm" },
    { value: "Dissolution", label: "Return to Source/Dissolution" },
    { value: "Undeath", label: "Undeath/Haunting" },
    { value: "Custom", label: "Custom System" },
    { value: "None", label: "No Afterlife" }
  ];

  const scopeOptions = [
    { value: "Universal", label: "Universal" },
    { value: "Planar", label: "Single Plane" },
    { value: "Regional", label: "Specific Region" },
    { value: "Conditional", label: "Conditional" },
    { value: "Temporal", label: "Temporal" }
  ];

  // Helper functions
  const addPlane = () => {
    const newPlanes = [...safeData.planesOfExistence, { 
      name: "", type: "", description: "", inhabitants: "", 
      accessMethod: "", dangers: "", nature: "" 
    }];
    onUpdate({ planesOfExistence: newPlanes });
  };

  const removePlane = (index: number) => {
    const newPlanes = safeData.planesOfExistence.filter((_, i) => i !== index);
    onUpdate({ planesOfExistence: newPlanes });
  };

  const updatePlane = (index: number, updates: Partial<PlaneOfExistenceData>) => {
    const newPlanes = safeData.planesOfExistence.map((plane, i) => 
      i === index ? { ...plane, ...updates } : plane
    );
    onUpdate({ planesOfExistence: newPlanes });
  };

  const addDimensionalRule = () => {
    const newRules = [...safeData.dimensionalRules, { 
      rule: "", scope: "", effects: "", exceptions: "" 
    }];
    onUpdate({ dimensionalRules: newRules });
  };

  const removeDimensionalRule = (index: number) => {
    const newRules = safeData.dimensionalRules.filter((_, i) => i !== index);
    onUpdate({ dimensionalRules: newRules });
  };

  const updateDimensionalRule = (index: number, updates: Partial<DimensionalRuleData>) => {
    const newRules = safeData.dimensionalRules.map((rule, i) => 
      i === index ? { ...rule, ...updates } : rule
    );
    onUpdate({ dimensionalRules: newRules });
  };

  const addDeity = () => {
    const newDeities = [...safeData.deities, { 
      name: "", domain: "", stance: "", power: "", 
      description: "", followers: "" 
    }];
    onUpdate({ deities: newDeities });
  };

  const removeDeity = (index: number) => {
    const newDeities = safeData.deities.filter((_, i) => i !== index);
    onUpdate({ deities: newDeities });
  };

  const updateDeity = (index: number, updates: Partial<DeityData>) => {
    const newDeities = safeData.deities.map((deity, i) => 
      i === index ? { ...deity, ...updates } : deity
    );
    onUpdate({ deities: newDeities });
  };

  const addAfterlifeRealm = () => {
    const newRealms = [...safeData.afterlifeRealms, { 
      name: "", criteria: "", description: "", duration: "" 
    }];
    onUpdate({ afterlifeRealms: newRealms });
  };

  const removeAfterlifeRealm = (index: number) => {
    const newRealms = safeData.afterlifeRealms.filter((_, i) => i !== index);
    onUpdate({ afterlifeRealms: newRealms });
  };

  const updateAfterlifeRealm = (index: number, updates: Partial<AfterlifeRealmData>) => {
    const newRealms = safeData.afterlifeRealms.map((realm, i) => 
      i === index ? { ...realm, ...updates } : realm
    );
    onUpdate({ afterlifeRealms: newRealms });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Cosmology & Realms — Player Lore; G.O.D Framework</h2>
        <p className="text-sm text-white mt-1">
          The structure of reality, planes of existence, divine hierarchy, and metaphysical laws governing your universe.
        </p>
      </div>

      <div className="space-y-6">
        {/* Cosmic Structure */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cosmic Structure
          </label>
          <p className="text-xs text-white mb-2">
            How are the planes of existence organized?
          </p>
          <Select
            value={safeData.cosmicStructure}
            onCommit={(value) => onUpdate({ cosmicStructure: value })}
            options={cosmicStructureOptions}
            placeholder="Select cosmic structure..."
          />
        </div>

        {/* Planes of Existence */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Planes of Existence
            </label>
            <button
              type="button"
              onClick={addPlane}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Plane
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Define the different realms and dimensions in your cosmology.
          </p>

          <div className="space-y-4">
            {safeData.planesOfExistence.length === 0 ? (
              <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
                No planes added yet. Click "Add Plane" to create one.
              </div>
            ) : (
              safeData.planesOfExistence.map((plane, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
                      {plane.name || `Plane ${index + 1}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removePlane(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Name
                      </label>
                      <Input
                        value={plane.name}
                        onCommit={(value) => updatePlane(index, { name: value })}
                        placeholder="Plane name..."
                        maxLength={60}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Type
                      </label>
                      <Select
                        value={plane.type}
                        onCommit={(value) => updatePlane(index, { type: value })}
                        options={planeTypeOptions}
                        placeholder="Select type..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Nature/Character
                      </label>
                      <Select
                        value={plane.nature}
                        onCommit={(value) => updatePlane(index, { nature: value })}
                        options={planeNatureOptions}
                        placeholder="Plane's nature..."
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-medium text-white mb-1">
                        Description
                      </label>
                      <Textarea
                        value={plane.description}
                        onCommit={(value) => updatePlane(index, { description: value })}
                        placeholder="Describe the plane's nature and appearance..."
                        maxLength={400}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Inhabitants
                      </label>
                      <Input
                        value={plane.inhabitants}
                        onCommit={(value) => updatePlane(index, { inhabitants: value })}
                        placeholder="Who lives there..."
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Access Method
                      </label>
                      <Input
                        value={plane.accessMethod}
                        onCommit={(value) => updatePlane(index, { accessMethod: value })}
                        placeholder="How to reach this plane..."
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Dangers
                      </label>
                      <Input
                        value={plane.dangers}
                        onCommit={(value) => updatePlane(index, { dangers: value })}
                        placeholder="Hazards and threats..."
                        maxLength={100}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dimensional Rules */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Dimensional Rules
            </label>
            <button
              type="button"
              onClick={addDimensionalRule}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Rule
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Rules governing how dimensions and planar travel work.
          </p>

          <div className="space-y-4">
            {safeData.dimensionalRules.map((rule, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    Rule {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeDimensionalRule(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Rule
                    </label>
                    <Input
                      value={rule.rule}
                      onCommit={(value) => updateDimensionalRule(index, { rule: value })}
                      placeholder="State the rule..."
                      maxLength={150}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Scope
                    </label>
                    <Select
                      value={rule.scope}
                      onCommit={(value) => updateDimensionalRule(index, { scope: value })}
                      options={scopeOptions}
                      placeholder="Select scope..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Effects
                    </label>
                    <Textarea
                      value={rule.effects}
                      onCommit={(value) => updateDimensionalRule(index, { effects: value })}
                      placeholder="What effects does this rule have..."
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Exceptions
                    </label>
                    <Textarea
                      value={rule.exceptions}
                      onCommit={(value) => updateDimensionalRule(index, { exceptions: value })}
                      placeholder="When doesn't this rule apply..."
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deities & Divine Beings */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Deities & Divine Beings
            </label>
            <button
              type="button"
              onClick={addDeity}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Deity
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Gods, goddesses, and other divine entities in your world.
          </p>

          <div className="space-y-4">
            {safeData.deities.map((deity, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    {deity.name || `Deity ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeDeity(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Name
                    </label>
                    <Input
                      value={deity.name}
                      onCommit={(value) => updateDeity(index, { name: value })}
                      placeholder="Deity name..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Domain
                    </label>
                    <Input
                      value={deity.domain}
                      onCommit={(value) => updateDeity(index, { domain: value })}
                      placeholder="War, Love, etc..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Stance/Philosophy
                    </label>
                    <Select
                      value={deity.stance}
                      onCommit={(value) => updateDeity(index, { stance: value })}
                      options={deityStanceOptions}
                      placeholder="Deity's stance..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Power Level
                    </label>
                    <Select
                      value={deity.power}
                      onCommit={(value) => updateDeity(index, { power: value })}
                      options={powerLevelOptions}
                      placeholder="Power level..."
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-white mb-1">
                      Description
                    </label>
                    <Textarea
                      value={deity.description}
                      onCommit={(value) => updateDeity(index, { description: value })}
                      placeholder="Describe the deity..."
                      maxLength={300}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-white mb-1">
                      Followers
                    </label>
                    <Textarea
                      value={deity.followers}
                      onCommit={(value) => updateDeity(index, { followers: value })}
                      placeholder="Who worships this deity..."
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Afterlife System */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Afterlife System
          </label>
          <p className="text-xs text-white mb-2">
            How does death and the afterlife work in your world?
          </p>
          <Select
            value={safeData.afterlifeSystem}
            onCommit={(value) => onUpdate({ afterlifeSystem: value })}
            options={afterlifeSystemOptions}
            placeholder="Select afterlife system..."
          />
        </div>

        {/* Afterlife Realms */}
        {safeData.afterlifeSystem && safeData.afterlifeSystem !== "None" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white">
                Afterlife Realms
              </label>
              <button
                type="button"
                onClick={addAfterlifeRealm}
                className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
              >
                Add Realm
              </button>
            </div>
            <p className="text-xs text-white mb-4">
              Specific realms or states of existence after death.
            </p>

            <div className="space-y-4">
              {safeData.afterlifeRealms.map((realm, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
                      {realm.name || `Afterlife Realm ${index + 1}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeAfterlifeRealm(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Name
                      </label>
                      <Input
                        value={realm.name}
                        onCommit={(value) => updateAfterlifeRealm(index, { name: value })}
                        placeholder="Realm name..."
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Entry Criteria
                      </label>
                      <Input
                        value={realm.criteria}
                        onCommit={(value) => updateAfterlifeRealm(index, { criteria: value })}
                        placeholder="Who goes here..."
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Duration
                      </label>
                      <Input
                        value={realm.duration}
                        onCommit={(value) => updateAfterlifeRealm(index, { duration: value })}
                        placeholder="Eternal, temporary, etc..."
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Description
                      </label>
                      <Textarea
                        value={realm.description}
                        onCommit={(value) => updateAfterlifeRealm(index, { description: value })}
                        placeholder="Describe this afterlife realm..."
                        maxLength={300}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planar Travel */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Planar Travel
          </label>
          <p className="text-xs text-white mb-2">
            How does travel between planes work? What are the methods and restrictions?
          </p>
          <Textarea
            value={safeData.planarTravel}
            onCommit={(value) => onUpdate({ planarTravel: value })}
            placeholder="Describe planar travel methods, portals, spells, natural phenomena..."
            maxLength={600}
            className="min-h-[100px]"
          />
        </div>

        {/* Cosmic Threats */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cosmic Threats
          </label>
          <p className="text-xs text-white mb-2">
            Universal-scale threats and phenomena that affect multiple planes.
          </p>
          <Textarea
            value={safeData.cosmicThreats}
            onCommit={(value) => onUpdate({ cosmicThreats: value })}
            placeholder="Far Realm invasions, planar collapse, cosmic parasites..."
            maxLength={500}
            className="min-h-[80px]"
          />
        </div>

        {/* Universal Laws */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Universal Laws
          </label>
          <p className="text-xs text-white mb-2">
            Fundamental laws that govern all of reality in your cosmology.
          </p>
          <Textarea
            value={safeData.universalLaws}
            onCommit={(value) => onUpdate({ universalLaws: value })}
            placeholder="Laws of magic, time, causality, divine intervention, etc..."
            maxLength={600}
            className="min-h-[100px]"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Additional Cosmological Notes
          </label>
          <p className="text-xs text-white mb-2">
            Any other important information about your world's cosmology and metaphysics.
          </p>
          <Textarea
            value={safeData.notes}
            onCommit={(value) => onUpdate({ notes: value })}
            placeholder="Creation myths, cosmic cycles, prophecies, unique phenomena..."
            maxLength={800}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
}
