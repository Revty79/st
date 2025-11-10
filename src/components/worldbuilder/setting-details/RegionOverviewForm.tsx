"use client";

import FormField from "@/components/shared/FormField";
import { RegionOverviewData } from "@/types/settings";

interface RegionOverviewFormProps {
  data: RegionOverviewData;
  onUpdate: (updates: Partial<RegionOverviewData>) => void;
}

export default function RegionOverviewForm({ data, onUpdate }: RegionOverviewFormProps) {
  const handleAddSense = () => {
    if (data.senses.length < 3) {
      onUpdate({ senses: [...data.senses, ""] });
    }
  };

  const handleUpdateSense = (index: number, value: string) => {
    const newSenses = [...data.senses];
    newSenses[index] = value;
    onUpdate({ senses: newSenses });
  };

  const handleRemoveSense = (index: number) => {
    const newSenses = data.senses.filter((_, i) => i !== index);
    onUpdate({ senses: newSenses });
  };

  const handleAddPride = () => {
    if (data.localValues.pride.length < 2) {
      onUpdate({ 
        localValues: { 
          ...data.localValues, 
          pride: [...data.localValues.pride, ""] 
        }
      });
    }
  };

  const handleUpdatePride = (index: number, value: string) => {
    const newPride = [...data.localValues.pride];
    newPride[index] = value;
    onUpdate({ 
      localValues: { 
        ...data.localValues, 
        pride: newPride 
      }
    });
  };

  const handleRemovePride = (index: number) => {
    const newPride = data.localValues.pride.filter((_, i) => i !== index);
    onUpdate({ 
      localValues: { 
        ...data.localValues, 
        pride: newPride 
      }
    });
  };

  const handleAddShame = () => {
    if (data.localValues.shame.length < 2) {
      onUpdate({ 
        localValues: { 
          ...data.localValues, 
          shame: [...data.localValues.shame, ""] 
        }
      });
    }
  };

  const handleUpdateShame = (index: number, value: string) => {
    const newShame = [...data.localValues.shame];
    newShame[index] = value;
    onUpdate({ 
      localValues: { 
        ...data.localValues, 
        shame: newShame 
      }
    });
  };

  const handleRemoveShame = (index: number) => {
    const newShame = data.localValues.shame.filter((_, i) => i !== index);
    onUpdate({ 
      localValues: { 
        ...data.localValues, 
        shame: newShame 
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Region Overview</h2>
        <div className="text-sm text-amber-400">MVS Required Section</div>
      </div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Create the read-aloud atmosphere and cultural backbone that brings this place to life for players.
      </div>

      {/* Senses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Senses (2-3 vivid lines)</h3>
        <div className="text-sm text-zinc-400">
          Concrete sensory images for read-aloud atmosphere
        </div>
        
        <div className="space-y-3">
          {data.senses.map((sense, index) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Sense ${index + 1}`}
                value={sense}
                onCommit={(value: string) => handleUpdateSense(index, value)}
                placeholder="Salt-mist alleys echoing with bronze bells under thunderheads"
                maxLength={120}
                className="flex-1"
                helperText="Vivid, concrete sensory detail"
              />
              <button
                onClick={() => handleRemoveSense(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          {data.senses.length < 3 && (
            <button
              onClick={handleAddSense}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Add Sensory Detail
            </button>
          )}
        </div>

        <div className="text-xs text-zinc-400">
          Examples: "Leviathan bones for wharves", "Bronze bells under thunderheads", "Salt-mist alleyways"
        </div>
      </div>

      {/* Local Values - Pride */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Local Values - Pride</h3>
        <div className="text-sm text-zinc-400">
          What people boast about (1-2 lines each)
        </div>
        
        <div className="space-y-3">
          {data.localValues.pride.map((pride, index) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Pride ${index + 1}`}
                value={pride}
                onCommit={(value: string) => handleUpdatePride(index, value)}
                placeholder="Free oaths - no lord can bind us permanently"
                maxLength={120}
                className="flex-1"
                helperText="What locals are proud of"
              />
              <button
                onClick={() => handleRemovePride(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          {data.localValues.pride.length < 2 && (
            <button
              onClick={handleAddPride}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Add Pride Point
            </button>
          )}
        </div>
      </div>

      {/* Local Values - Shame */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Local Values - Shame</h3>
        <div className="text-sm text-zinc-400">
          What people hide or are ashamed of (1-2 lines each)
        </div>
        
        <div className="space-y-3">
          {data.localValues.shame.map((shame, index) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Shame ${index + 1}`}
                value={shame}
                onCommit={(value: string) => handleUpdateShame(index, value)}
                placeholder="Debt-brands - visible marks of financial failure"
                maxLength={120}
                className="flex-1"
                helperText="What locals are ashamed of or hide"
              />
              <button
                onClick={() => handleRemoveShame(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          {data.localValues.shame.length < 2 && (
            <button
              onClick={handleAddShame}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded"
            >
              Add Shame Point
            </button>
          )}
        </div>
      </div>

      {/* Why Now */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Why Now</h3>
        <div className="text-sm text-zinc-400">
          Current spark - why adventurers matter today (≤180 chars)
        </div>
        
        <FormField
          label="Why Now"
          type="textarea"
          value={data.whyNow}
          onCommit={(value: string) => onUpdate({ whyNow: value })}
          placeholder="A new 'pirate-king' unites docks; trade war one spark from open sea-siege."
          maxLength={180}
          rows={2}
          helperText="Actionable reason why heroes matter right now"
        />

        <div className="text-xs text-zinc-400">
          This should answer: "Why do player characters matter in this place at this time?"
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.senses.length >= 2 ? "text-green-400" : "text-zinc-400"}>
            {data.senses.length >= 2 ? "✓" : "○"} Senses (2-3 vivid lines)
          </div>
          <div className={data.localValues.pride.length >= 1 ? "text-green-400" : "text-zinc-400"}>
            {data.localValues.pride.length >= 1 ? "✓" : "○"} Pride Points (1-2)
          </div>
          <div className={data.localValues.shame.length >= 1 ? "text-green-400" : "text-zinc-400"}>
            {data.localValues.shame.length >= 1 ? "✓" : "○"} Shame Points (1-2)
          </div>
          <div className={data.whyNow.length > 0 ? "text-green-400" : "text-zinc-400"}>
            {data.whyNow.length > 0 ? "✓" : "○"} Why Now (current spark)
          </div>
        </div>
      </div>
    </div>
  );
}