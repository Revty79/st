"use client";

import React from "react";
import FormField from "@/components/shared/FormField";
import { GeographyEnvironmentData } from "@/types/settings";

interface GeographyEnvironmentFormProps {
  data: GeographyEnvironmentData;
  onUpdate: (updates: Partial<GeographyEnvironmentData>) => void;
}

export default function GeographyEnvironmentForm({ data, onUpdate }: GeographyEnvironmentFormProps) {
  const handleAddBullet = () => {
    onUpdate({
      travelTacticsBullets: [...data.travelTacticsBullets, ""]
    });
  };

  const handleUpdateBullet = (index: number, value: string) => {
    const newBullets = [...data.travelTacticsBullets];
    newBullets[index] = value;
    onUpdate({ travelTacticsBullets: newBullets });
  };

  const handleRemoveBullet = (index: number) => {
    onUpdate({
      travelTacticsBullets: data.travelTacticsBullets.filter((_, i) => i !== index)
    });
  };

  const handleAddResourceHazard = () => {
    onUpdate({
      resourcesHazards: [...data.resourcesHazards, { resource: "", hazard: "" }]
    });
  };

  const handleUpdateResourceHazard = (index: number, field: 'resource' | 'hazard', value: string) => {
    const newPairs = [...data.resourcesHazards];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onUpdate({ resourcesHazards: newPairs });
  };

  const handleRemoveResourceHazard = (index: number) => {
    onUpdate({
      resourcesHazards: data.resourcesHazards.filter((_, i) => i !== index)
    });
  };

  const handleAddFeature = () => {
    onUpdate({
      signatureFeatures: [...data.signatureFeatures, ""]
    });
  };

  const handleUpdateFeature = (index: number, value: string) => {
    const newFeatures = [...data.signatureFeatures];
    newFeatures[index] = value;
    onUpdate({ signatureFeatures: newFeatures });
  };

  const handleRemoveFeature = (index: number) => {
    onUpdate({
      signatureFeatures: data.signatureFeatures.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Geography & Environment</h2>
        <div className="text-sm text-amber-400">MVS Required Section</div>
      </div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Provide tactical movement context, resource tensions, and memorable geographical features.
      </div>

      {/* Travel & Tactics Bullets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Travel & Tactics</h3>
          <button
            onClick={handleAddBullet}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Add Bullet
          </button>
        </div>
        <div className="text-sm text-zinc-400 mb-4">
          4-7 tactical considerations for movement, visibility, cover, etc.
        </div>
        
        <div className="space-y-3">
          {data.travelTacticsBullets.map((bullet, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <FormField
                  label={`Travel Bullet ${index + 1}`}
                  value={bullet}
                  onChange={(value: string) => handleUpdateBullet(index, value)}
                  placeholder="e.g. Dense fog in mornings reduces visibility to 30 feet"
                  showLabel={false}
                />
              </div>
              <button
                onClick={() => handleRemoveBullet(index)}
                className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                title="Remove bullet"
              >
                ×
              </button>
            </div>
          ))}
          {data.travelTacticsBullets.length === 0 && (
            <div className="text-zinc-400 text-sm italic">
              Add travel and tactical considerations for this region.
            </div>
          )}
        </div>
      </div>

      {/* Resources ↔ Hazards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Resources ↔ Hazards</h3>
          <button
            onClick={handleAddResourceHazard}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Add Pair
          </button>
        </div>
        <div className="text-sm text-zinc-400 mb-4">
          Pair valuable resources with associated risks or hazards.
        </div>
        
        <div className="space-y-3">
          {data.resourcesHazards.map((pair, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 items-start">
              <FormField
                label="Resource"
                value={pair.resource}
                onChange={(value: string) => handleUpdateResourceHazard(index, 'resource', value)}
                placeholder="e.g. Rich iron deposits"
                showLabel={index === 0}
              />
              <div className="flex gap-3 items-start">
                <FormField
                  label="Associated Hazard"
                  value={pair.hazard}
                  onChange={(value: string) => handleUpdateResourceHazard(index, 'hazard', value)}
                  placeholder="e.g. Unstable mine tunnels"
                  showLabel={index === 0}
                />
                <button
                  onClick={() => handleRemoveResourceHazard(index)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded mt-6"
                  title="Remove pair"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {data.resourcesHazards.length === 0 && (
            <div className="text-zinc-400 text-sm italic">
              Add resource-hazard pairs to show regional tensions.
            </div>
          )}
        </div>
      </div>

      {/* Signature Features */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Signature Features</h3>
          <button
            onClick={handleAddFeature}
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Add Feature
          </button>
        </div>
        <div className="text-sm text-zinc-400 mb-4">
          3-5 memorable geographical or environmental landmarks.
        </div>
        
        <div className="space-y-3">
          {data.signatureFeatures.map((feature, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <FormField
                  label={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(value: string) => handleUpdateFeature(index, value)}
                  placeholder="e.g. The Weeping Cliffs - perpetual waterfalls that sing in the wind"
                  showLabel={false}
                />
              </div>
              <button
                onClick={() => handleRemoveFeature(index)}
                className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                title="Remove feature"
              >
                ×
              </button>
            </div>
          ))}
          {data.signatureFeatures.length === 0 && (
            <div className="text-zinc-400 text-sm italic">
              Add distinctive geographical features that define this region.
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-2">Completion Guidelines:</h4>
        {React.createElement('ul', {
          className: "text-xs text-zinc-400 space-y-1"
        }, [
          React.createElement('li', { key: 1 }, "• Travel bullets should cover movement, visibility, terrain challenges"),
          React.createElement('li', { key: 2 }, "• Resource-hazard pairs create natural plot tensions"),
          React.createElement('li', { key: 3 }, "• Signature features should be vivid and campaign-memorable"),
          React.createElement('li', { key: 4 }, "• Think tactically - how does geography affect combat and exploration?")
        ])}
      </div>
    </div>
  );
}