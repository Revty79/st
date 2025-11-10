// Power & Factions Form
"use client";

import { useState } from "react";
import FormField from "@/components/shared/FormField";
import { PowerFactionsData } from "@/types/settings";

interface PowerFactionsFormProps {
  data: PowerFactionsData;
  onUpdate: (updates: Partial<PowerFactionsData>) => void;
}

export default function PowerFactionsForm({ data, onUpdate }: PowerFactionsFormProps) {
  const [selectedFaction, setSelectedFaction] = useState<string>("");
  
  const handleAddFaction = () => {
    const newFaction = {
      id: `faction-${Date.now()}`,
      name: "",
      publicGoal: "",
      hiddenAgenda: "",
      assets: [],
      leverage: "",
      vulnerability: "",
      face: { name: "", vibe: "" }
    };
    
    onUpdate({
      activeFactions: [...data.activeFactions, newFaction]
    });
  };

  const handleUpdateFaction = (index: number, field: string, value: any) => {
    const newFactions = [...data.activeFactions];
    if (field.startsWith('face.')) {
      const faceField = field.split('.')[1];
      newFactions[index] = {
        ...newFactions[index],
        face: { ...newFactions[index].face, [faceField]: value }
      };
    } else {
      newFactions[index] = { ...newFactions[index], [field]: value };
    }
    onUpdate({ activeFactions: newFactions });
  };

  const handleRemoveFaction = (index: number) => {
    const newFactions = data.activeFactions.filter((_: any, i: number) => i !== index);
    onUpdate({ activeFactions: newFactions });
  };

  const handleAddAsset = (factionIndex: number) => {
    const newFactions = [...data.activeFactions];
    newFactions[factionIndex].assets.push("");
    onUpdate({ activeFactions: newFactions });
  };

  const handleUpdateAsset = (factionIndex: number, assetIndex: number, value: string) => {
    const newFactions = [...data.activeFactions];
    newFactions[factionIndex].assets[assetIndex] = value;
    onUpdate({ activeFactions: newFactions });
  };

  const handleRemoveAsset = (factionIndex: number, assetIndex: number) => {
    const newFactions = [...data.activeFactions];
    newFactions[factionIndex].assets = newFactions[factionIndex].assets.filter((_: string, i: number) => i !== assetIndex);
    onUpdate({ activeFactions: newFactions });
  };

  const handleUpdateSwayAction = (factionId: string, action: string) => {
    onUpdate({
      monthlySwayActions: { ...data.monthlySwayActions, [factionId]: action }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Power & Factions</h2>
        <div className="text-sm text-amber-400">MVS Required Section</div>
      </div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Create active factions with clear goals, assets, and vulnerabilities that drive conflict.
      </div>

      {/* Active Factions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Factions</h3>
        <div className="text-sm text-zinc-400">
          Groups with resources and goals that create dramatic tension
        </div>
        
        <div className="space-y-6">
          {data.activeFactions.map((faction: any, index: number) => (
            <div key={faction.id} className="p-4 border border-zinc-700 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-white">Faction {index + 1}</h4>
                <button
                  onClick={() => handleRemoveFaction(index)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Remove Faction
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Faction Name"
                  value={faction.name}
                  onCommit={(value: string) => handleUpdateFaction(index, 'name', value)}
                  placeholder="The Merchant's Guild"
                  maxLength={60}
                />
                
                <FormField
                  label="Public Goal"
                  value={faction.publicGoal}
                  onCommit={(value: string) => handleUpdateFaction(index, 'publicGoal', value)}
                  placeholder="Protect trade routes and fair commerce"
                  maxLength={120}
                  helperText="What they claim to want"
                />
                
                <FormField
                  label="Hidden Agenda"
                  value={faction.hiddenAgenda}
                  onCommit={(value: string) => handleUpdateFaction(index, 'hiddenAgenda', value)}
                  placeholder="Establish trade monopoly through political manipulation"
                  maxLength={120}
                  helperText="What they actually want"
                />
                
                <FormField
                  label="Leverage"
                  value={faction.leverage}
                  onCommit={(value: string) => handleUpdateFaction(index, 'leverage', value)}
                  placeholder="Controls 60% of food imports"
                  maxLength={100}
                  helperText="Their main source of power"
                />
                
                <FormField
                  label="Key Vulnerability"
                  value={faction.vulnerability}
                  onCommit={(value: string) => handleUpdateFaction(index, 'vulnerability', value)}
                  placeholder="Leader's gambling addiction, debt to crime boss"
                  maxLength={100}
                  helperText="How they can be hurt or pressured"
                />
              </div>

              {/* Faction Face */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white">Faction Face (Primary Contact)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    label="Name"
                    value={faction.face.name}
                    onCommit={(value: string) => handleUpdateFaction(index, 'face.name', value)}
                    placeholder="Guildmaster Velora Goldweaver"
                    maxLength={50}
                  />
                  
                  <FormField
                    label="Vibe/Personality"
                    value={faction.face.vibe}
                    onCommit={(value: string) => handleUpdateFaction(index, 'face.vibe', value)}
                    placeholder="Shrewd negotiator, always smiling, never forgets a slight"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Assets */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white">Assets & Resources</h5>
                {faction.assets.map((asset: string, assetIndex: number) => (
                  <div key={assetIndex} className="flex gap-2">
                    <FormField
                      label={`Asset ${assetIndex + 1}`}
                      value={asset}
                      onCommit={(value: string) => handleUpdateAsset(index, assetIndex, value)}
                      placeholder="50 armed guards, warehouse district, blackmail files"
                      maxLength={80}
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleRemoveAsset(index, assetIndex)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddAsset(index)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Add Asset
                </button>
              </div>

              {/* Monthly Sway Action */}
              <FormField
                label="Monthly Sway Action"
                value={data.monthlySwayActions[faction.id] || ""}
                onCommit={(value: string) => handleUpdateSwayAction(faction.id, value)}
                placeholder="Pressure city council to raise taxes on competitors"
                maxLength={120}
                helperText="What they do each month to advance their goals"
              />
            </div>
          ))}
          
          <button
            onClick={handleAddFaction}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Faction
          </button>
        </div>
      </div>

      {/* Relationship Quick Notes */}
      {data.activeFactions.length >= 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Key Faction Relationships</h3>
          <div className="text-sm text-zinc-400">
            How do these factions view each other? (Complete relationship mapping available in advanced tools)
          </div>
          
          <div className="p-4 border border-blue-500/30 bg-blue-950/30 rounded-lg">
            <div className="text-sm text-blue-200">
              <p><strong>Quick Reference:</strong> Allied &gt; Friendly &gt; Neutral &gt; Tense &gt; Hostile &gt; At War</p>
              <p className="mt-2">Use Advanced sections for complete relationship matrices and detailed dynamics.</p>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Prompts */}
      <div className="border border-blue-500/30 bg-blue-950/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Quick Fill Prompts</h4>
        <div className="space-y-2 text-sm text-blue-200">
          <div><strong>Goals:</strong> "What does this group want? What do they claim to want?"</div>
          <div><strong>Power:</strong> "What gives them leverage? How can they be hurt?"</div>
          <div><strong>Face:</strong> "Who speaks for them? What's their personality hook?"</div>
          <div><strong>Action:</strong> "What do they do each month to get closer to their goal?"</div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.activeFactions.length >= 2 ? "text-green-400" : "text-zinc-400"}>
            {data.activeFactions.length >= 2 ? "✓" : "○"} Active Factions (2+ recommended)
          </div>
          <div className={data.activeFactions.every(f => f.name && f.publicGoal && f.face.name) ? "text-green-400" : "text-zinc-400"}>
            {data.activeFactions.every(f => f.name && f.publicGoal && f.face.name) ? "✓" : "○"} Essential faction details
          </div>
        </div>
      </div>
    </div>
  );
}