// Built Environment Form

"use client";

import { useState } from "react";
import FormField from "@/components/shared/FormField";
import { BuiltEnvironmentData } from "@/types/settings";

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

interface BuiltEnvironmentFormProps {
  data: BuiltEnvironmentData;
  onUpdate: (updates: Partial<BuiltEnvironmentData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

export default function BuiltEnvironmentForm({ data, onUpdate, onManualSave, isManualSaving }: BuiltEnvironmentFormProps) {
  const handleAddSettlement = () => {
    onUpdate({
      settlements: [...data.settlements, {
        name: "",
        role: "",
        populationBand: "small",
        notable: "",
        risk: "",
        hook: ""
      }]
    });
  };

  const handleUpdateSettlement = (index: number, field: string, value: any) => {
    const newSettlements = [...data.settlements];
    newSettlements[index] = { ...newSettlements[index], [field]: value };
    onUpdate({ settlements: newSettlements });
  };

  const handleRemoveSettlement = (index: number) => {
    const newSettlements = data.settlements.filter((_: any, i: number) => i !== index);
    onUpdate({ settlements: newSettlements });
  };

  const handleAddRoute = () => {
    onUpdate({
      movement: {
        ...data.movement,
        routes: [...data.movement.routes, ""]
      }
    });
  };

  const handleUpdateRoute = (index: number, value: string) => {
    const newRoutes = [...data.movement.routes];
    newRoutes[index] = value;
    onUpdate({
      movement: { ...data.movement, routes: newRoutes }
    });
  };

  const handleRemoveRoute = (index: number) => {
    const newRoutes = data.movement.routes.filter((_: string, i: number) => i !== index);
    onUpdate({
      movement: { ...data.movement, routes: newRoutes }
    });
  };

  const handleAddFailureMode = () => {
    onUpdate({
      utilities: {
        ...data.utilities,
        failureModes: [...data.utilities.failureModes, ""]
      }
    });
  };

  const handleUpdateFailureMode = (index: number, value: string) => {
    const newModes = [...data.utilities.failureModes];
    newModes[index] = value;
    onUpdate({
      utilities: { ...data.utilities, failureModes: newModes }
    });
  };

  const handleRemoveFailureMode = (index: number) => {
    const newModes = data.utilities.failureModes.filter((_: string, i: number) => i !== index);
    onUpdate({
      utilities: { ...data.utilities, failureModes: newModes }
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Built Environment" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-amber-400 text-center mb-4">MVS Required Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Define settlements and infrastructure that create plot hooks and tactical challenges.
      </div>

      {/* Settlements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Settlements</h3>
        <div className="text-sm text-zinc-400">
          Key population centers with their roles and hooks
        </div>
        
        <div className="space-y-4">
          {data.settlements.map((settlement: any, index: number) => (
            <div key={index} className="p-4 border border-zinc-700 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-white">Settlement {index + 1}</h4>
                <button
                  onClick={() => handleRemoveSettlement(index)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Name"
                  value={settlement.name}
                  onCommit={(value: string) => handleUpdateSettlement(index, 'name', value)}
                  placeholder="Saltwind Harbor"
                  maxLength={50}
                />
                
                <FormField
                  label="Role/Function"
                  value={settlement.role}
                  onCommit={(value: string) => handleUpdateSettlement(index, 'role', value)}
                  placeholder="Trading port, fishing hub"
                  maxLength={80}
                />
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Population Band
                  </label>
                  <select
                    value={settlement.populationBand}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateSettlement(index, 'populationBand', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="outpost">Outpost (50-200)</option>
                    <option value="small">Small (200-1,000)</option>
                    <option value="medium">Medium (1,000-5,000)</option>
                    <option value="large">Large (5,000-20,000)</option>
                    <option value="metro">Metro (20,000+)</option>
                  </select>
                </div>
                
                <FormField
                  label="Notable Feature"
                  value={settlement.notable}
                  onCommit={(value: string) => handleUpdateSettlement(index, 'notable', value)}
                  placeholder="The lighthouse doubles as a mage tower"
                  maxLength={100}
                />
                
                <FormField
                  label="Primary Risk"
                  value={settlement.risk}
                  onCommit={(value: string) => handleUpdateSettlement(index, 'risk', value)}
                  placeholder="Pirates, corrupt harbor master"
                  maxLength={100}
                />
                
                <FormField
                  label="Adventure Hook"
                  value={settlement.hook}
                  onCommit={(value: string) => handleUpdateSettlement(index, 'hook', value)}
                  placeholder="Ships keep vanishing in the fog"
                  maxLength={120}
                />
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddSettlement}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Settlement
          </button>
        </div>
      </div>

      {/* Movement & Routes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Movement & Routes</h3>
        
        <div className="space-y-3">
          <h4 className="text-md font-medium text-white">Travel Routes</h4>
          {data.movement.routes.map((route: string, index: number) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Route ${index + 1}`}
                value={route}
                onCommit={(value: string) => handleUpdateRoute(index, value)}
                placeholder="The King's Road - taxed, patrolled, safe but slow"
                maxLength={120}
                className="flex-1"
                helperText="Status: taxed/patrolled/broken/secret/seasonal"
              />
              <button
                onClick={() => handleRemoveRoute(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAddRoute}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Route
          </button>
        </div>

        <FormField
          label="Key Bottleneck/Chokepoint"
          value={data.movement.bottleneck}
          onCommit={(value: string) => onUpdate({
            movement: { ...data.movement, bottleneck: value }
          })}
          placeholder="The single bridge across Devil's Gorge"
          maxLength={120}
          helperText="One critical passage that controls movement"
        />
      </div>

      {/* Utilities & Infrastructure */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Utilities & Infrastructure</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Water Control"
            value={data.utilities.waterControl}
            onCommit={(value: string) => onUpdate({
              utilities: { ...data.utilities, waterControl: value }
            })}
            placeholder="Guild-controlled wells"
            maxLength={80}
            helperText="Who controls water access?"
          />
          
          <FormField
            label="Power Control"
            value={data.utilities.powerControl}
            onCommit={(value: string) => onUpdate({
              utilities: { ...data.utilities, powerControl: value }
            })}
            placeholder="Windmills owned by nobles"
            maxLength={80}
            helperText="Energy/fuel/work sources"
          />
          
          <FormField
            label="Mana Control"
            value={data.utilities.manaControl}
            onCommit={(value: string) => onUpdate({
              utilities: { ...data.utilities, manaControl: value }
            })}
            placeholder="Ley lines monitored by Circle"
            maxLength={80}
            helperText="Magical infrastructure"
          />
        </div>

        <div className="space-y-3">
          <h4 className="text-md font-medium text-white">Infrastructure Failure Modes</h4>
          <div className="text-sm text-zinc-400">What happens when systems break down?</div>
          
          {data.utilities.failureModes.map((mode: string, index: number) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Failure Mode ${index + 1}`}
                value={mode}
                onCommit={(value: string) => handleUpdateFailureMode(index, value)}
                placeholder="When wells run dry, social order collapses within days"
                maxLength={120}
                className="flex-1"
              />
              <button
                onClick={() => handleRemoveFailureMode(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAddFailureMode}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Failure Mode
          </button>
        </div>
      </div>

      {/* Helpful Prompts */}
      <div className="border border-blue-500/30 bg-blue-950/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Quick Fill Prompts</h4>
        <div className="space-y-2 text-sm text-blue-200">
          <div><strong>Settlements:</strong> "What does this place DO? What can go wrong here?"</div>
          <div><strong>Routes:</strong> "How do people/goods move? What controls or blocks that movement?"</div>
          <div><strong>Utilities:</strong> "What basic needs create vulnerability and control?"</div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.settlements.length >= 1 ? "text-green-400" : "text-zinc-400"}>
            {data.settlements.length >= 1 ? "✓" : "○"} Settlements (1+)
          </div>
          <div className={data.movement.routes.length >= 1 ? "text-green-400" : "text-zinc-400"}>
            {data.movement.routes.length >= 1 ? "✓" : "○"} Travel Routes (1+)
          </div>
          <div className={data.movement.bottleneck ? "text-green-400" : "text-zinc-400"}>
            {data.movement.bottleneck ? "✓" : "○"} Key Bottleneck
          </div>
        </div>
      </div>
    </div>
  );
}