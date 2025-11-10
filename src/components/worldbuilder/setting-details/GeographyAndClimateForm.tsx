"use client";

import { useState } from "react";
import FormField from "@/components/shared/FormField";
import { GeographyEnvironmentData } from "@/types/settings";

// Section header component with save button
const SectionHeader = ({ title, onSave, isSaving }: {
  title: string;
  onSave?: () => void;
  isSaving?: boolean;
}) => (
  <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/20">
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    {onSave && (
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
          isSaving
            ? 'bg-amber-600/20 border-amber-400/30 text-amber-300 cursor-not-allowed'
            : 'bg-amber-600/10 hover:bg-amber-600/20 border-amber-400/20 hover:border-amber-400/40 text-amber-200 hover:text-amber-100'
        } flex items-center gap-2`}
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent"></div>
            Saving...
          </>
        ) : (
          <>
            💾 Save Changes
          </>
        )}
      </button>
    )}
  </div>
);

interface GeographyAndClimateFormProps {
  data: GeographyEnvironmentData;
  onUpdate: (updates: Partial<GeographyEnvironmentData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

export default function GeographyAndClimateForm({ data, onUpdate, onManualSave, isManualSaving }: GeographyAndClimateFormProps) {
  const handleAddFeature = () => {
    if (data.signatureFeatures.length < 5) {
      onUpdate({ signatureFeatures: [...data.signatureFeatures, ""] });
    }
  };

  const handleUpdateFeature = (index: number, value: string) => {
    const newFeatures = [...data.signatureFeatures];
    newFeatures[index] = value;
    onUpdate({ signatureFeatures: newFeatures });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = data.signatureFeatures.filter((_: string, i: number) => i !== index);
    onUpdate({ signatureFeatures: newFeatures });
  };

  const handleAddTacticsBullet = () => {
    if (data.travelTacticsBullets.length < 7) {
      onUpdate({ travelTacticsBullets: [...data.travelTacticsBullets, ""] });
    }
  };

  const handleUpdateTacticsBullet = (index: number, value: string) => {
    const newBullets = [...data.travelTacticsBullets];
    newBullets[index] = value;
    onUpdate({ travelTacticsBullets: newBullets });
  };

  const handleRemoveTacticsBullet = (index: number) => {
    const newBullets = data.travelTacticsBullets.filter((_: string, i: number) => i !== index);
    onUpdate({ travelTacticsBullets: newBullets });
  };

  const handleAddResourceHazard = () => {
    onUpdate({ 
      resourcesHazards: [...data.resourcesHazards, { resource: "", hazard: "" }]
    });
  };

  const handleUpdateResourceHazard = (index: number, field: 'resource' | 'hazard', value: string) => {
    const newPairs = [...data.resourcesHazards];
    newPairs[index][field] = value;
    onUpdate({ resourcesHazards: newPairs });
  };

  const handleRemoveResourceHazard = (index: number) => {
    const newPairs = data.resourcesHazards.filter((_: any, i: number) => i !== index);
    onUpdate({ resourcesHazards: newPairs });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Geography & Environment" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-amber-400 text-center mb-4">MVS Required Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Create geographic elements that support gameplay and provide tactical variety.
      </div>

      {/* Travel & Tactics Bullets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Travel & Tactics Bullets (4-7)</h3>
        <div className="text-sm text-zinc-400">
          Quick gameplay-focused geographic facts for tactical scenes
        </div>
        
        <div className="space-y-3">
          {data.travelTacticsBullets.map((bullet: string, index: number) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Bullet ${index + 1}`}
                value={bullet}
                onCommit={(value: string) => handleUpdateTacticsBullet(index, value)}
                placeholder="Thick forest canopy blocks flying; dense undergrowth forces single-file travel"
                maxLength={120}
                className="flex-1"
                helperText="What tactical challenge/opportunity does this create?"
              />
              <button
                onClick={() => handleRemoveTacticsBullet(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          {data.travelTacticsBullets.length < 7 && (
            <button
              onClick={handleAddTacticsBullet}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Add Tactics Bullet
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs text-zinc-400">
          <div><strong>Examples:</strong></div>
          <div>• "Cliff paths 3 feet wide - impossible for mounted combat"</div>
          <div>• "Tidal caves accessible only 6 hours per day"</div>
          <div>• "Shifting sand dunes reset all tracks weekly"</div>
        </div>
      </div>

      {/* Resources & Hazards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Resources & Hazards Pairs</h3>
        <div className="text-sm text-zinc-400">
          Each valuable resource comes with a natural hazard
        </div>
        
        <div className="space-y-3">
          {data.resourcesHazards.map((pair: any, index: number) => (
            <div key={index} className="grid grid-cols-2 gap-2 p-3 border border-zinc-700 rounded">
              <FormField
                label="Resource"
                value={pair.resource}
                onCommit={(value: string) => handleUpdateResourceHazard(index, 'resource', value)}
                placeholder="Iron ore deposits"
                maxLength={60}
              />
              <FormField
                label="Hazard"
                value={pair.hazard}
                onCommit={(value: string) => handleUpdateResourceHazard(index, 'hazard', value)}
                placeholder="Unstable mine shafts"
                maxLength={60}
              />
              <div className="col-span-2">
                <button
                  onClick={() => handleRemoveResourceHazard(index)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Remove Pair
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddResourceHazard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Resource/Hazard Pair
          </button>
        </div>
      </div>

      {/* Signature Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Signature Features (3-5)</h3>
        <div className="text-sm text-zinc-400">
          Distinctive landmarks that define this region
        </div>
        
        <div className="space-y-3">
          {data.signatureFeatures.map((feature: string, index: number) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Feature ${index + 1}`}
                value={feature}
                onCommit={(value: string) => handleUpdateFeature(index, value)}
                placeholder="The Sunken Plaza - floods at high tide, reveals hidden passages at low tide"
                maxLength={120}
                className="flex-1"
                helperText="What makes this feature memorable and useful?"
              />
              <button
                onClick={() => handleRemoveFeature(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          {data.signatureFeatures.length < 5 && (
            <button
              onClick={handleAddFeature}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Add Signature Feature
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs text-zinc-400">
          <div><strong>Examples:</strong></div>
          <div>• "The Glass Bridge - beautiful but shatters under heavy weight"</div>
          <div>• "Singing Cliffs - echo conversations for miles"</div>
          <div>• "The Bone Garden - petrified forest with hidden alcoves"</div>
        </div>
      </div>

      {/* Helpful Prompts */}
      <div className="border border-blue-500/30 bg-blue-950/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Quick Fill Prompts</h4>
        <div className="space-y-2 text-sm text-blue-200">
          <div><strong>Tactics:</strong> "What terrain affects movement, visibility, or combat positioning?"</div>
          <div><strong>Resources:</strong> "What's valuable here, and what danger comes with getting it?"</div>
          <div><strong>Features:</strong> "What 3 things would players remember about this place?"</div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.travelTacticsBullets.length >= 4 ? "text-green-400" : "text-zinc-400"}>
            {data.travelTacticsBullets.length >= 4 ? "✓" : "○"} Travel & Tactics (4+)
          </div>
          <div className={data.signatureFeatures.length >= 3 ? "text-green-400" : "text-zinc-400"}>
            {data.signatureFeatures.length >= 3 ? "✓" : "○"} Signature Features (3+)
          </div>
          <div className={data.resourcesHazards.length >= 1 ? "text-green-400" : "text-zinc-400"}>
            {data.resourcesHazards.length >= 1 ? "✓" : "○"} Resource/Hazard Pairs (1+)
          </div>
        </div>
      </div>
    </div>
  );
}