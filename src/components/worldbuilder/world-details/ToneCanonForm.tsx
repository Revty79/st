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

const TagInput = ({ tags, onCommit, predefinedOptions, placeholder, maxTags = 10 }: {
  tags: string[];
  onCommit: (tags: string[]) => void;
  predefinedOptions: string[];
  placeholder: string;
  maxTags?: number;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
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
        {predefinedOptions
          .filter(tag => !tags.includes(tag))
          .slice(0, 8)
          .map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              disabled={tags.length >= maxTags}
              className="px-2 py-1 text-sm border border-white/20 rounded bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
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
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
          className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-white/5"
        />
        <button
          type="button"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim() || tags.length >= maxTags}
          className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      
      <div className="text-sm text-white">
        {tags.length}/{maxTags} tags
      </div>
    </div>
  );
};

// Data interfaces
export interface CanonicalRuleData {
  rule: string;
  explanation: string;
  consequences: string;
}

export interface NarrativeStyleData {
  style: string;
  description: string;
  examples: string;
}

export interface ContentSeverityData {
  contentType: string;
  level: 'allow' | 'limit' | 'ban';
  notes: string;
}

export interface ToneCanonData {
  toneFlags: string[];
  contentRating: string;
  contentWarnings: string[];
  narrativeStyle: string;
  customNarrativeStyles: NarrativeStyleData[];
  canonicalRules: CanonicalRuleData[];
  thematicElements: string[];
  conflictTypes: string[];
  moodAtmosphere: string;
  playerExpectations: string;
  gmGuidance: string;
  contentSeverityMatrix: ContentSeverityData[];
  unchangingTruths: string[];
  worldRating: string;
}

interface ToneCanonFormProps {
  data: ToneCanonData;
  onUpdate: (data: Partial<ToneCanonData>) => void;
}

export default function ToneCanonForm({ data, onUpdate }: ToneCanonFormProps) {
  const toneFlagOptions = [
    "Heroic", "Dark", "Grim", "Noble", "Tragic", "Comedy", "Satire",
    "Pulp", "Noir", "Gothic", "Romantic", "Epic", "Mythic", "Weird",
    "Horror", "Mystery", "Adventure", "Political", "Military", "Exploration",
    "Survival", "Post-Apocalyptic", "Cyberpunk", "Steampunk", "High Fantasy",
    "Low Fantasy", "Urban Fantasy", "Historical", "Alternate History",
    "Science Fantasy", "Space Opera", "Hard SF", "Soft SF"
  ];

  const contentRatingOptions = [
    { value: "", label: "Select content rating..." },
    { value: "All Ages", label: "All Ages (G)" },
    { value: "Teen", label: "Teen (PG-13)" },
    { value: "Mature", label: "Mature (R)" },
    { value: "Adults Only", label: "Adults Only" }
  ];

  const contentWarningOptions = [
    "Violence", "Gore", "Death", "Torture", "Sexual Content", "Nudity",
    "Strong Language", "Drug Use", "Alcohol", "Mental Health Issues",
    "Suicide", "Self-Harm", "Abuse", "Slavery", "Racism", "Sexism",
    "Religious Themes", "Political Themes", "Body Horror", "Psychological Horror",
    "Jump Scares", "Claustrophobia", "Arachnophobia", "Blood"
  ];

  const narrativeStyleOptions = [
    { value: "", label: "Select narrative style..." },
    { value: "Traditional", label: "Traditional RPG" },
    { value: "Cinematic", label: "Cinematic" },
    { value: "Sandbox", label: "Sandbox/Open World" },
    { value: "Investigation", label: "Investigation/Mystery" },
    { value: "Political", label: "Political Intrigue" },
    { value: "Exploration", label: "Exploration" },
    { value: "Survival", label: "Survival" },
    { value: "Romance", label: "Romance" },
    { value: "Comedy", label: "Comedy" },
    { value: "Horror", label: "Horror" },
    { value: "Military", label: "Military Campaign" },
    { value: "Heist", label: "Heist/Crime" },
    { value: "Custom", label: "Custom Style" }
  ];

  const thematicElementOptions = [
    "Good vs Evil", "Order vs Chaos", "Nature vs Civilization", "Faith vs Science",
    "Individual vs Society", "Freedom vs Security", "Honor vs Pragmatism",
    "Love vs Duty", "Past vs Future", "Knowledge vs Ignorance", "Rich vs Poor",
    "Power Corrupts", "Redemption", "Sacrifice", "Coming of Age", "Loss of Innocence",
    "The Hero's Journey", "Family Bonds", "Friendship", "Betrayal", "Forgiveness",
    "Justice", "Revenge", "Hope vs Despair", "Truth vs Lies"
  ];

  const conflictTypeOptions = [
    "Personal vs Personal", "Personal vs Society", "Personal vs Nature",
    "Personal vs Supernatural", "Personal vs Technology", "Personal vs Fate",
    "Society vs Society", "Ideological Conflict", "Resource Competition",
    "Succession Crisis", "Religious War", "Trade Disputes", "Territorial Disputes",
    "Cultural Clash", "Generational Conflict", "Class Warfare"
  ];

  // Helper functions
  const addCanonicalRule = () => {
    const newRules = [...data.canonicalRules, { rule: "", explanation: "", consequences: "" }];
    onUpdate({ canonicalRules: newRules });
  };

  const removeCanonicalRule = (index: number) => {
    const newRules = data.canonicalRules.filter((_, i) => i !== index);
    onUpdate({ canonicalRules: newRules });
  };

  const updateCanonicalRule = (index: number, updates: Partial<CanonicalRuleData>) => {
    const newRules = data.canonicalRules.map((rule, i) => 
      i === index ? { ...rule, ...updates } : rule
    );
    onUpdate({ canonicalRules: newRules });
  };

  const addNarrativeStyle = () => {
    const newStyles = [...data.customNarrativeStyles, { style: "", description: "", examples: "" }];
    onUpdate({ customNarrativeStyles: newStyles });
  };

  const removeNarrativeStyle = (index: number) => {
    const newStyles = data.customNarrativeStyles.filter((_, i) => i !== index);
    onUpdate({ customNarrativeStyles: newStyles });
  };

  const updateNarrativeStyle = (index: number, updates: Partial<NarrativeStyleData>) => {
    const newStyles = data.customNarrativeStyles.map((style, i) => 
      i === index ? { ...style, ...updates } : style
    );
    onUpdate({ customNarrativeStyles: newStyles });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Tone & Canon — Player Expectations; G.O.D Guidelines</h2>
        <p className="text-sm text-white mt-1">
          Sets narrative style, content boundaries, and thematic elements. Guides both players and game masters.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tone Flags */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tone Flags
          </label>
          <p className="text-xs text-white mb-2">
            Tags that describe the overall feel and style of your world.
          </p>
          <TagInput
            tags={data.toneFlags}
            onCommit={(tags) => onUpdate({ toneFlags: tags })}
            predefinedOptions={toneFlagOptions}
            placeholder="Add custom tone tag..."
            maxTags={8}
          />
        </div>

        {/* Narrative Style */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Primary Narrative Style
          </label>
          <p className="text-xs text-white mb-2">
            The main storytelling approach for your world.
          </p>
          <Select
            value={data.narrativeStyle}
            onCommit={(value) => onUpdate({ narrativeStyle: value })}
            options={narrativeStyleOptions}
            placeholder="Select narrative style..."
          />
        </div>

        {/* Custom Narrative Styles */}
        {data.narrativeStyle === "Custom" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white">
                Custom Narrative Styles
              </label>
              <button
                type="button"
                onClick={addNarrativeStyle}
                className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
              >
                Add Style
              </button>
            </div>
            <p className="text-xs text-white mb-4">
              Define your unique narrative approaches.
            </p>

            <div className="space-y-4">
              {data.customNarrativeStyles.map((style, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-white">
                      Style {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeNarrativeStyle(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Style Name
                      </label>
                      <Input
                        value={style.style}
                        onCommit={(value) => updateNarrativeStyle(index, { style: value })}
                        placeholder="Style name..."
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Description
                      </label>
                      <Textarea
                        value={style.description}
                        onCommit={(value) => updateNarrativeStyle(index, { description: value })}
                        placeholder="Describe this narrative style..."
                        maxLength={300}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Examples & Guidelines
                      </label>
                      <Textarea
                        value={style.examples}
                        onCommit={(value) => updateNarrativeStyle(index, { examples: value })}
                        placeholder="Examples of how this style works..."
                        maxLength={300}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thematic Elements */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Thematic Elements
          </label>
          <p className="text-xs text-white mb-2">
            Core themes and philosophical concepts in your world.
          </p>
          <TagInput
            tags={data.thematicElements}
            onCommit={(tags) => onUpdate({ thematicElements: tags })}
            predefinedOptions={thematicElementOptions}
            placeholder="Add custom theme..."
            maxTags={8}
          />
        </div>

        {/* Conflict Types */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Common Conflict Types
          </label>
          <p className="text-xs text-white mb-2">
            Types of conflicts that commonly occur in your world.
          </p>
          <TagInput
            tags={data.conflictTypes}
            onCommit={(tags) => onUpdate({ conflictTypes: tags })}
            predefinedOptions={conflictTypeOptions}
            placeholder="Add custom conflict type..."
            maxTags={6}
          />
        </div>

        {/* Canonical Rules */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Canonical Rules
            </label>
            <button
              type="button"
              onClick={addCanonicalRule}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Rule
            </button>
          </div>
          <p className="text-xs text-white mb-4">
            Unbreakable narrative and thematic rules that define your world.
          </p>

          <div className="space-y-4">
            {data.canonicalRules.map((rule, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    Rule {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeCanonicalRule(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Rule Statement
                    </label>
                    <Input
                      value={rule.rule}
                      onCommit={(value) => updateCanonicalRule(index, { rule: value })}
                      placeholder="State the rule..."
                      maxLength={150}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Explanation
                    </label>
                    <Textarea
                      value={rule.explanation}
                      onCommit={(value) => updateCanonicalRule(index, { explanation: value })}
                      placeholder="Explain why this rule exists..."
                      maxLength={300}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Consequences of Breaking
                    </label>
                    <Textarea
                      value={rule.consequences}
                      onCommit={(value) => updateCanonicalRule(index, { consequences: value })}
                      placeholder="What happens when this rule is broken..."
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood & Atmosphere */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Mood & Atmosphere
          </label>
          <p className="text-xs text-white mb-2">
            Overall emotional feel and atmosphere of your world.
          </p>
          <Textarea
            value={data.moodAtmosphere}
            onCommit={(value) => onUpdate({ moodAtmosphere: value })}
            placeholder="Describe the general mood and atmosphere players should expect..."
            maxLength={500}
            className="min-h-[80px]"
          />
        </div>

        {/* Player Expectations */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Player Expectations
          </label>
          <p className="text-xs text-white mb-2">
            What players should expect when playing in this world.
          </p>
          <Textarea
            value={data.playerExpectations}
            onCommit={(value) => onUpdate({ playerExpectations: value })}
            placeholder="Set clear expectations for players about content, style, and experience..."
            maxLength={600}
            className="min-h-[100px]"
          />
        </div>

        {/* GM Guidance */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Game Master Guidance
          </label>
          <p className="text-xs text-white mb-2">
            Guidelines for GMs running games in this world.
          </p>
          <Textarea
            value={data.gmGuidance}
            onCommit={(value) => onUpdate({ gmGuidance: value })}
            placeholder="Provide guidance for GMs on maintaining tone, handling sensitive content, narrative techniques..."
            maxLength={800}
            className="min-h-[120px]"
          />
        </div>

        {/* Unchanging Truths (3-7) */}
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white">Unchanging World Truths (3-7)</h3>
            <p className="text-xs text-white/70 mt-1">
              Lore pillars you won't contradict. Core facts that define your world.
            </p>
          </div>
          <div className="space-y-2">
            {(data.unchangingTruths || []).map((truth, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={truth}
                  onCommit={(value) => {
                    const newTruths = [...(data.unchangingTruths || [])];
                    newTruths[index] = value;
                    onUpdate({ unchangingTruths: newTruths });
                  }}
                  placeholder={`Truth ${index + 1}: e.g., "The Deep remembers every oath"`}
                  maxLength={200}
                />
                <button
                  onClick={() => {
                    const newTruths = (data.unchangingTruths || []).filter((_, i) => i !== index);
                    onUpdate({ unchangingTruths: newTruths });
                  }}
                  className="text-red-400 hover:text-red-300 text-sm whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            ))}
            {(data.unchangingTruths || []).length < 7 && (
              <button
                onClick={() => {
                  const newTruths = [...(data.unchangingTruths || []), ""];
                  onUpdate({ unchangingTruths: newTruths });
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm"
              >
                + Add Truth ({(data.unchangingTruths || []).length}/7)
              </button>
            )}
          </div>
        </div>

        {/* Content Severity Matrix */}
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white">Content & Severity Matrix</h3>
            <p className="text-xs text-white/70 mt-1">
              Hard ceilings on content types. Lower layers can only tighten, never exceed.
            </p>
          </div>
          
          {/* Define content types */}
          {(() => {
            const contentTypes = [
              { id: 'violence', label: 'Violence' },
              { id: 'murder', label: 'Murder/Assassination' },
              { id: 'slavery', label: 'Slavery/Forced Labor' },
              { id: 'religious_persecution', label: 'Religious Persecution' },
              { id: 'torture', label: 'Torture' },
              { id: 'sexual_content', label: 'Sexual Content' },
              { id: 'sexual_violence', label: 'Sexual Violence' },
              { id: 'substance_use', label: 'Substance Use' },
              { id: 'horror', label: 'Horror (cosmic/body/psych)' },
              { id: 'profanity', label: 'Profanity' },
              { id: 'moral_tone', label: 'Moral Tone' }
            ];

            const severityOptions = [
              { value: 'allow', label: 'Allow' },
              { value: 'limit', label: 'Limit' },
              { value: 'ban', label: 'Ban' }
            ];

            // Initialize matrix if empty
            const matrix = data.contentSeverityMatrix || contentTypes.map(ct => ({
              contentType: ct.id,
              level: 'allow',
              notes: ''
            }));

            return (
              <div className="space-y-3">
                {contentTypes.map((type, index) => {
                  const entry = matrix.find(m => m.contentType === type.id) || {
                    contentType: type.id,
                    level: 'allow',
                    notes: ''
                  };

                  return (
                    <div key={type.id} className="p-3 border border-white/20 rounded-lg bg-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white mb-1">
                            {type.label}
                          </label>
                        </div>
                        <div>
                          <Select
                            value={entry.level}
                            onCommit={(value) => {
                              const newMatrix = [...matrix];
                              const entryIndex = newMatrix.findIndex(m => m.contentType === type.id);
                              if (entryIndex >= 0) {
                                newMatrix[entryIndex] = { ...newMatrix[entryIndex], level: value as 'allow' | 'limit' | 'ban' };
                              } else {
                                newMatrix.push({ contentType: type.id, level: value as 'allow' | 'limit' | 'ban', notes: '' });
                              }
                              onUpdate({ contentSeverityMatrix: newMatrix });
                            }}
                            options={severityOptions}
                          />
                        </div>
                        <div>
                          <Input
                            value={entry.notes}
                            onCommit={(value) => {
                              const newMatrix = [...matrix];
                              const entryIndex = newMatrix.findIndex(m => m.contentType === type.id);
                              if (entryIndex >= 0) {
                                newMatrix[entryIndex] = { ...newMatrix[entryIndex], notes: value };
                              } else {
                                newMatrix.push({ contentType: type.id, level: 'allow', notes: value });
                              }
                              onUpdate({ contentSeverityMatrix: newMatrix });
                            }}
                            placeholder="Severity note (optional)"
                            maxLength={100}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* World Rating */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-white mb-2">
            World Rating
          </label>
          <p className="text-xs text-white mb-2">
            Overall content rating for this world
          </p>
          <Select
            value={data.worldRating}
            onCommit={(value) => onUpdate({ worldRating: value })}
            options={[
              { value: 'G', label: 'G - General Audiences' },
              { value: 'PG', label: 'PG - Parental Guidance Suggested' },
              { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
              { value: 'R', label: 'R - Restricted' },
              { value: 'NC-17', label: 'NC-17 - Adults Only' }
            ]}
            placeholder="Select rating..."
          />
        </div>
      </div>
    </div>
  );
}
