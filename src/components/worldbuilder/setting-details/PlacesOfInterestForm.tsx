// Places of Interest Form
"use client";

import React, { useState } from "react";
import FormField from "@/components/shared/FormField";
import { 
  PlacesOfInterestData,
  CampaignSeedsData,
  MagicProfileData,
  RacesBeingsData,
  CreaturesData,
  DeitiesBeliefData,
  RelationsLawData,
  CurrencyData
} from "@/types/settings";

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

interface PlacesOfInterestFormProps {
  data: PlacesOfInterestData;
  onUpdate: (updates: Partial<PlacesOfInterestData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

export function PlacesOfInterestForm({ data, onUpdate, onManualSave, isManualSaving }: PlacesOfInterestFormProps) {
  const handleAddSite = () => {
    onUpdate({
      sites: [...data.sites, {
        name: "",
        function: "",
        vibe: "",
        gatekeepers: "",
        risks: "",
        rewards: "",
        rumor: "",
        truth: "",
        twist: "",
        hooks: [],
        decisionPoint: "",
        realmTouchpoints: ""
      }]
    });
  };

  const handleUpdateSite = (index: number, field: string, value: any) => {
    const newSites = [...data.sites];
    newSites[index] = { ...newSites[index], [field]: value };
    onUpdate({ sites: newSites });
  };

  const handleRemoveSite = (index: number) => {
    const newSites = data.sites.filter((_: any, i: number) => i !== index);
    onUpdate({ sites: newSites });
  };

  const handleAddHook = (siteIndex: number) => {
    const newSites = [...data.sites];
    newSites[siteIndex].hooks.push("");
    onUpdate({ sites: newSites });
  };

  const handleUpdateHook = (siteIndex: number, hookIndex: number, value: string) => {
    const newSites = [...data.sites];
    newSites[siteIndex].hooks[hookIndex] = value;
    onUpdate({ sites: newSites });
  };

  const handleRemoveHook = (siteIndex: number, hookIndex: number) => {
    const newSites = [...data.sites];
    newSites[siteIndex].hooks = newSites[siteIndex].hooks.filter((_: string, i: number) => i !== hookIndex);
    onUpdate({ sites: newSites });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Places of Interest" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-amber-400 text-center mb-4">MVS Required Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Create memorable locations with clear functions, dramatic potential, and plot hooks.
      </div>

      {/* Sites */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Sites & Locations</h3>
        <div className="text-sm text-zinc-400">
          Important places where scenes happen and plots unfold
        </div>
        
        <div className="space-y-6">
          {data.sites.map((site: any, index: number) => (
            <div key={index} className="p-4 border border-zinc-700 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-white">Site {index + 1}</h4>
                <button
                  onClick={() => handleRemoveSite(index)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Remove Site
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Name"
                  value={site.name}
                  onCommit={(value: string) => handleUpdateSite(index, 'name', value)}
                  placeholder="The Broken Crown Tavern"
                  maxLength={60}
                />
                
                <FormField
                  label="Function/Purpose"
                  value={site.function}
                  onCommit={(value: string) => handleUpdateSite(index, 'function', value)}
                  placeholder="Tavern, inn, information broker hub"
                  maxLength={100}
                  helperText="What does this place DO?"
                />
                
                <FormField
                  label="Vibe/Atmosphere"
                  value={site.vibe}
                  onCommit={(value: string) => handleUpdateSite(index, 'vibe', value)}
                  placeholder="Smoky, secretive, everyone whispers"
                  maxLength={100}
                  helperText="How does this place FEEL?"
                />
                
                <FormField
                  label="Gatekeepers"
                  value={site.gatekeepers}
                  onCommit={(value: string) => handleUpdateSite(index, 'gatekeepers', value)}
                  placeholder="Burly bouncer, need guild password to enter"
                  maxLength={100}
                  helperText="Who controls access?"
                />
                
                <FormField
                  label="Risks/Dangers"
                  value={site.risks}
                  onCommit={(value: string) => handleUpdateSite(index, 'risks', value)}
                  placeholder="Thieves' guild informants, watered drinks drug patrons"
                  maxLength={120}
                  helperText="What can go wrong here?"
                />
                
                <FormField
                  label="Rewards/Benefits"
                  value={site.rewards}
                  onCommit={(value: string) => handleUpdateSite(index, 'rewards', value)}
                  placeholder="Best information network in the city, hidden escape tunnel"
                  maxLength={120}
                  helperText="What can be gained here?"
                />
              </div>

              {/* Rumor/Truth/Twist */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white">Rumor, Truth & Twist</h5>
                
                <FormField
                  label="Rumor (What people say)"
                  value={site.rumor}
                  onCommit={(value: string) => handleUpdateSite(index, 'rumor', value)}
                  placeholder="The barkeep was once a famous spy"
                  maxLength={120}
                  helperText="Common knowledge/gossip"
                />
                
                <FormField
                  label="Truth (What's actually happening)"
                  value={site.truth}
                  onCommit={(value: string) => handleUpdateSite(index, 'truth', value)}
                  placeholder="He still works for the crown, but reluctantly"
                  maxLength={120}
                  helperText="The real situation"
                />
                
                <FormField
                  label="Twist (Unexpected complication)"
                  value={site.twist}
                  onCommit={(value: string) => handleUpdateSite(index, 'twist', value)}
                  placeholder="His handler is actually a foreign agent"
                  maxLength={120}
                  helperText="The deeper layer of intrigue"
                />
              </div>

              {/* Hooks */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white">Adventure Hooks (2-3)</h5>
                {site.hooks.map((hook: string, hookIndex: number) => (
                  <div key={hookIndex} className="flex gap-2">
                    <FormField
                      label={`Hook ${hookIndex + 1}`}
                      value={hook}
                      onCommit={(value: string) => handleUpdateHook(index, hookIndex, value)}
                      placeholder="Regular customer hasn't been seen for a week, left valuable item behind"
                      maxLength={120}
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleRemoveHook(index, hookIndex)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddHook(index)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Add Hook
                </button>
              </div>

              <FormField
                label="Key Decision Point"
                value={site.decisionPoint}
                onCommit={(value: string) => handleUpdateSite(index, 'decisionPoint', value)}
                placeholder="Do PCs trust the barkeep with sensitive information?"
                maxLength={120}
                helperText="What choice do players face here?"
              />
              
              <FormField
                label="Realm Touchpoints (if magical)"
                value={site.realmTouchpoints || ""}
                onCommit={(value: string) => handleUpdateSite(index, 'realmTouchpoints', value)}
                placeholder="Mirror behind bar shows glimpses of Shadow Realm"
                maxLength={120}
                helperText="How do magical realms intersect here? (optional)"
              />
            </div>
          ))}
          
          <button
            onClick={handleAddSite}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Place of Interest
          </button>
        </div>
      </div>

      {/* Helpful Prompts */}
      <div className="border border-blue-500/30 bg-blue-950/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Quick Fill Prompts</h4>
        <div className="space-y-2 text-sm text-blue-200">
          <div><strong>Function:</strong> "Why would PCs come here? What service does it provide?"</div>
          <div><strong>Drama:</strong> "What rumor draws attention? What's the hidden truth?"</div>
          <div><strong>Hooks:</strong> "What problems emerge here? What opportunities arise?"</div>
          <div><strong>Choices:</strong> "What decision must PCs make when they're here?"</div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.sites.length >= 3 ? "text-green-400" : "text-zinc-400"}>
            {data.sites.length >= 3 ? "✓" : "○"} Places of Interest (3+ recommended)
          </div>
          <div className={data.sites.every(s => s.name && s.function && s.vibe) ? "text-green-400" : "text-zinc-400"}>
            {data.sites.every(s => s.name && s.function && s.vibe) ? "✓" : "○"} Essential site details
          </div>
          <div className={data.sites.some(s => s.hooks.length >= 2) ? "text-green-400" : "text-zinc-400"}>
            {data.sites.some(s => s.hooks.length >= 2) ? "✓" : "○"} Adventure hooks
          </div>
        </div>
      </div>
    </div>
  );
}

interface CampaignSeedsFormProps {
  data: CampaignSeedsData;
  onUpdate: (updates: Partial<CampaignSeedsData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

export function CampaignSeedsForm({ data, onUpdate, onManualSave, isManualSaving }: CampaignSeedsFormProps) {
  const handleAddSeed = () => {
    onUpdate({
      seeds: [...data.seeds, {
        premise: "",
        beats: [],
        ties: { npcs: [], places: [] },
        stakesAndClocks: "",
        pivotVariants: []
      }]
    });
  };

  const handleUpdateSeed = (index: number, field: string, value: any) => {
    const newSeeds = [...data.seeds];
    if (field.startsWith('ties.')) {
      const tieField = field.split('.')[1];
      newSeeds[index] = {
        ...newSeeds[index],
        ties: { ...newSeeds[index].ties, [tieField]: value }
      };
    } else {
      newSeeds[index] = { ...newSeeds[index], [field]: value };
    }
    onUpdate({ seeds: newSeeds });
  };

  const handleRemoveSeed = (index: number) => {
    const newSeeds = data.seeds.filter((_: any, i: number) => i !== index);
    onUpdate({ seeds: newSeeds });
  };

  const handleAddBeat = (seedIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].beats.push("");
    onUpdate({ seeds: newSeeds });
  };

  const handleUpdateBeat = (seedIndex: number, beatIndex: number, value: string) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].beats[beatIndex] = value;
    onUpdate({ seeds: newSeeds });
  };

  const handleRemoveBeat = (seedIndex: number, beatIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].beats = newSeeds[seedIndex].beats.filter((_: string, i: number) => i !== beatIndex);
    onUpdate({ seeds: newSeeds });
  };

  const handleAddNPC = (seedIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].ties.npcs.push("");
    onUpdate({ seeds: newSeeds });
  };

  const handleUpdateNPC = (seedIndex: number, npcIndex: number, value: string) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].ties.npcs[npcIndex] = value;
    onUpdate({ seeds: newSeeds });
  };

  const handleRemoveNPC = (seedIndex: number, npcIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].ties.npcs = newSeeds[seedIndex].ties.npcs.filter((_: string, i: number) => i !== npcIndex);
    onUpdate({ seeds: newSeeds });
  };

  const handleAddPlace = (seedIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].ties.places.push("");
    onUpdate({ seeds: newSeeds });
  };

  const handleUpdatePlace = (seedIndex: number, placeIndex: number, value: string) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].ties.places[placeIndex] = value;
    onUpdate({ seeds: newSeeds });
  };

  const handleRemovePlace = (seedIndex: number, placeIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].ties.places = newSeeds[seedIndex].ties.places.filter((_: string, i: number) => i !== placeIndex);
    onUpdate({ seeds: newSeeds });
  };

  const handleAddPivot = (seedIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].pivotVariants.push("");
    onUpdate({ seeds: newSeeds });
  };

  const handleUpdatePivot = (seedIndex: number, pivotIndex: number, value: string) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].pivotVariants[pivotIndex] = value;
    onUpdate({ seeds: newSeeds });
  };

  const handleRemovePivot = (seedIndex: number, pivotIndex: number) => {
    const newSeeds = [...data.seeds];
    newSeeds[seedIndex].pivotVariants = newSeeds[seedIndex].pivotVariants.filter((_: string, i: number) => i !== pivotIndex);
    onUpdate({ seeds: newSeeds });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Campaign Seeds" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-amber-400 text-center mb-4">MVS Required Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Create ready-to-run adventure frameworks that connect to setting elements.
      </div>

      {/* Campaign Seeds */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Adventure Seeds</h3>
        <div className="text-sm text-zinc-400">
          Complete adventure frameworks with premise, beats, and connections
        </div>
        
        <div className="space-y-8">
          {data.seeds.map((seed: any, index: number) => (
            <div key={index} className="p-4 border border-zinc-700 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-white">Campaign Seed {index + 1}</h4>
                <button
                  onClick={() => handleRemoveSeed(index)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Remove Seed
                </button>
              </div>
              
              <FormField
                label="Premise (One Line)"
                value={seed.premise}
                onCommit={(value: string) => handleUpdateSeed(index, 'premise', value)}
                placeholder="The merchant guild's caravans are vanishing, but the guild is covering it up"
                maxLength={150}
                helperText="The core conflict or mystery in one compelling sentence"
              />

              {/* Story Beats */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white">Story Beats (4-6)</h5>
                <div className="text-sm text-zinc-400">Key scenes or developments that advance the plot</div>
                
                {seed.beats.map((beat: string, beatIndex: number) => (
                  <div key={beatIndex} className="flex gap-2">
                    <FormField
                      label={`Beat ${beatIndex + 1}`}
                      value={beat}
                      onCommit={(value: string) => handleUpdateBeat(index, beatIndex, value)}
                      placeholder="PCs discover the missing cargo contains illegal magical artifacts"
                      maxLength={120}
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleRemoveBeat(index, beatIndex)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddBeat(index)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Add Beat
                </button>
              </div>

              {/* Story Ties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="text-md font-medium text-white">Connected NPCs (2)</h5>
                  {seed.ties.npcs.map((npc: string, npcIndex: number) => (
                    <div key={npcIndex} className="flex gap-2">
                      <FormField
                        label={`NPC ${npcIndex + 1}`}
                        value={npc}
                        onCommit={(value: string) => handleUpdateNPC(index, npcIndex, value)}
                        placeholder="Guildmaster Velora (worried but hiding something)"
                        maxLength={80}
                        className="flex-1"
                      />
                      <button
                        onClick={() => handleRemoveNPC(index, npcIndex)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddNPC(index)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    Add NPC
                  </button>
                </div>

                <div className="space-y-3">
                  <h5 className="text-md font-medium text-white">Connected Places (2)</h5>
                  {seed.ties.places.map((place: string, placeIndex: number) => (
                    <div key={placeIndex} className="flex gap-2">
                      <FormField
                        label={`Place ${placeIndex + 1}`}
                        value={place}
                        onCommit={(value: string) => handleUpdatePlace(index, placeIndex, value)}
                        placeholder="The Broken Crown Tavern (meeting point)"
                        maxLength={80}
                        className="flex-1"
                      />
                      <button
                        onClick={() => handleRemovePlace(index, placeIndex)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddPlace(index)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    Add Place
                  </button>
                </div>
              </div>

              <FormField
                label="Stakes & Clocks"
                value={seed.stakesAndClocks}
                onCommit={(value: string) => handleUpdateSeed(index, 'stakesAndClocks', value)}
                placeholder="If PCs don't act within 10 days, the guild war begins / Clock: Guild Suspicion (6 segments)"
                maxLength={180}
                helperText="What happens if PCs don't act? What tracks rising tension?"
              />

              {/* Pivot Variants */}
              <div className="space-y-3">
                <h5 className="text-md font-medium text-white">Pivot Variants</h5>
                <div className="text-sm text-zinc-400">Alternative directions if the main premise doesn't land</div>
                
                {seed.pivotVariants.map((pivot: string, pivotIndex: number) => (
                  <div key={pivotIndex} className="flex gap-2">
                    <FormField
                      label={`Variant ${pivotIndex + 1}`}
                      value={pivot}
                      onCommit={(value: string) => handleUpdatePivot(index, pivotIndex, value)}
                      placeholder="Instead of covering up, the guild is being blackmailed by the real thieves"
                      maxLength={120}
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleRemovePivot(index, pivotIndex)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddPivot(index)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Add Pivot Variant
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddSeed}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Campaign Seed
          </button>
        </div>
      </div>

      {/* Helpful Prompts */}
      <div className="border border-blue-500/30 bg-blue-950/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Quick Fill Prompts</h4>
        <div className="space-y-2 text-sm text-blue-200">
          <div><strong>Premise:</strong> "What's the central conflict or mystery that gets PCs involved?"</div>
          <div><strong>Beats:</strong> "What are 4-6 major developments that reveal the truth?"</div>
          <div><strong>Stakes:</strong> "What bad thing happens if PCs don't act? How do you track rising tension?"</div>
          <div><strong>Connections:</strong> "Which NPCs and places from other sections tie into this story?"</div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.seeds.length >= 2 ? "text-green-400" : "text-zinc-400"}>
            {data.seeds.length >= 2 ? "✓" : "○"} Campaign Seeds (2+ recommended)
          </div>
          <div className={data.seeds.every(s => s.premise && s.beats.length >= 4) ? "text-green-400" : "text-zinc-400"}>
            {data.seeds.every(s => s.premise && s.beats.length >= 4) ? "✓" : "○"} Complete seed frameworks
          </div>
          <div className={data.seeds.some(s => s.ties.npcs.length >= 2 && s.ties.places.length >= 2) ? "text-green-400" : "text-zinc-400"}>
            {data.seeds.some(s => s.ties.npcs.length >= 2 && s.ties.places.length >= 2) ? "✓" : "○"} Setting connections
          </div>
        </div>
      </div>
    </div>
  );
}

interface MagicProfileFormProps {
  data: MagicProfileData;
  onUpdate: (updates: Partial<MagicProfileData>) => void;
  eraData?: any; // Era context for inheritance
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

export function MagicProfileForm({ data, onUpdate, eraData, onManualSave, isManualSaving }: MagicProfileFormProps) {
  const handleAddTaboo = () => {
    onUpdate({ localTaboos: [...data.localTaboos, ""] });
  };

  const handleUpdateTaboo = (index: number, value: string) => {
    const newTaboos = [...data.localTaboos];
    newTaboos[index] = value;
    onUpdate({ localTaboos: newTaboos });
  };

  const handleRemoveTaboo = (index: number) => {
    const newTaboos = data.localTaboos.filter((_: string, i: number) => i !== index);
    onUpdate({ localTaboos: newTaboos });
  };

  const handleAddHook = () => {
    onUpdate({ cosmicEventHooks: [...data.cosmicEventHooks, ""] });
  };

  const handleUpdateHook = (index: number, value: string) => {
    const newHooks = [...data.cosmicEventHooks];
    newHooks[index] = value;
    onUpdate({ cosmicEventHooks: newHooks });
  };

  const handleRemoveHook = (index: number) => {
    const newHooks = data.cosmicEventHooks.filter((_: string, i: number) => i !== index);
    onUpdate({ cosmicEventHooks: newHooks });
  };

  const handleSystemToggle = (systemId: string) => {
    const newSystems = data.systemsInUse.includes(systemId)
      ? data.systemsInUse.filter(id => id !== systemId)
      : [...data.systemsInUse, systemId];
    onUpdate({ systemsInUse: newSystems });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Magic Profile" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-violet-400 text-center mb-4">Advanced Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Purpose:</strong> Customize how magical systems from the World and Era manifest in this specific setting.
      </div>

      {/* Era Magic Context */}
      {eraData?.backdropDefaults && (
        <div className="border border-blue-500/30 bg-blue-950/20 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">Era Magic Context</h4>
          <div className="text-sm text-blue-100">
            <div><strong>Magic Tide:</strong> {eraData.backdropDefaults.magicTide}</div>
            <div className="text-xs text-blue-300 mt-1">
              This affects how readily available magical power is throughout the era
            </div>
          </div>
        </div>
      )}

      {/* Systems in Use */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Magic Systems in Use</h3>
        <div className="text-sm text-zinc-400">
          Which magical systems from the World's catalog are present in this setting?
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {["Arcane", "Divine", "Primal", "Pact", "Psionics", "Alchemy", "Artifice", "Blood Magic"].map((system) => (
            <button
              key={system}
              onClick={() => handleSystemToggle(system)}
              className={`p-2 rounded text-sm border ${
                data.systemsInUse.includes(system)
                  ? "border-green-500 bg-green-500/20 text-green-300"
                  : "border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {system}
            </button>
          ))}
        </div>
      </div>

      <FormField
        label="Availability Notes"
        value={data.availabilityNotes}
        onCommit={(value: string) => onUpdate({ availabilityNotes: value })}
        type="textarea"
        rows={3}
        placeholder="Magic is regulated by the Mage's Guild. Unlicensed casting is punishable by imprisonment..."
        maxLength={400}
        helperText="How does magic availability differ from Era defaults?"
      />

      <FormField
        label="Corruption Pace"
        value={data.corruptionPace}
        onCommit={(value: string) => onUpdate({ corruptionPace: value })}
        placeholder="Standard, Accelerated (+50%), Delayed (-25%)"
        maxLength={100}
        helperText="Local modifier to magical corruption rates"
      />

      {/* Local Taboos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Local Magical Taboos</h3>
        <div className="text-sm text-zinc-400">
          Magical practices that are forbidden, regulated, or culturally unacceptable here
        </div>
        
        <div className="space-y-3">
          {data.localTaboos.map((taboo: string, index: number) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Taboo ${index + 1}`}
                value={taboo}
                onCommit={(value: string) => handleUpdateTaboo(index, value)}
                placeholder="Necromancy is punishable by death"
                maxLength={120}
                className="flex-1"
              />
              <button
                onClick={() => handleRemoveTaboo(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAddTaboo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Taboo
          </button>
        </div>
      </div>

      {/* Cosmic Event Hooks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Cosmic Event Hooks</h3>
        <div className="text-sm text-zinc-400">
          Ongoing magical phenomena that create adventure opportunities
        </div>
        
        <div className="space-y-3">
          {data.cosmicEventHooks.map((hook: string, index: number) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Event Hook ${index + 1}`}
                value={hook}
                onCommit={(value: string) => handleUpdateHook(index, value)}
                placeholder="The ley lines surge every full moon, causing wild magic zones"
                maxLength={150}
                className="flex-1"
              />
              <button
                onClick={() => handleRemoveHook(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAddHook}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Event Hook
          </button>
        </div>
      </div>
    </div>
  );
}

export function RacesBeingsForm({ data, onUpdate, onManualSave, isManualSaving }: { 
  data: RacesBeingsData; 
  onUpdate: (updates: Partial<RacesBeingsData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}) {
  const [showAddRace, setShowAddRace] = useState(false);
  const [newRaceName, setNewRaceName] = useState("");

  const handleRaceAvailabilityChange = (race: string, availability: 'Playable' | 'NPC-only' | 'Other') => {
    onUpdate({
      raceAvailability: { ...data.raceAvailability, [race]: availability }
    });
  };

  const handleRaceNoteChange = (race: string, note: string) => {
    onUpdate({
      raceNotes: { ...data.raceNotes, [race]: note }
    });
  };

  const handleAddRace = () => {
    if (newRaceName.trim()) {
      onUpdate({
        raceAvailability: { ...data.raceAvailability, [newRaceName.trim()]: 'Playable' },
        raceNotes: { ...data.raceNotes, [newRaceName.trim()]: '' }
      });
      setNewRaceName("");
      setShowAddRace(false);
    }
  };

  const handleCancelAddRace = () => {
    setNewRaceName("");
    setShowAddRace(false);
  };

  const handleRemoveRace = (race: string) => {
    const newAvailability = { ...data.raceAvailability };
    const newNotes = { ...data.raceNotes };
    delete newAvailability[race];
    delete newNotes[race];
    onUpdate({
      raceAvailability: newAvailability,
      raceNotes: newNotes
    });
  };

  // Common fantasy races as defaults
  const defaultRaces = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Tiefling', 'Gnome', 'Half-Elf', 'Half-Orc'];
  
  // Combine default races with custom ones
  const allRaces = [...new Set([...defaultRaces, ...Object.keys(data.raceAvailability)])];

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Races & Beings" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-violet-400 text-center mb-4">Advanced Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Purpose:</strong> Define which races are available to players and how they're perceived in this setting.
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Race Availability</h3>
        {!showAddRace && (
          <button
            onClick={() => setShowAddRace(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Add Custom Race
          </button>
        )}
      </div>

      {/* Inline add race form */}
      {showAddRace && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-medium text-amber-200">Add Custom Race</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={newRaceName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRaceName(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddRace()}
              placeholder="Enter race name (e.g., Aasimar, Genasi)"
              className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
            />
            <button
              onClick={handleAddRace}
              disabled={!newRaceName.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black rounded"
            >
              Add
            </button>
            <button
              onClick={handleCancelAddRace}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {allRaces.map((race) => (
          <div key={race} className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">{race}</h4>
              {!defaultRaces.includes(race) && (
                <button
                  onClick={() => handleRemoveRace(race)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Availability
                </label>
                <select
                  value={data.raceAvailability[race] || 'Playable'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRaceAvailabilityChange(race, e.target.value as 'Playable' | 'NPC-only' | 'Other')}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                >
                  <option value="Playable">Playable</option>
                  <option value="NPC-only">NPC-only</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Regional Notes
                </label>
                <FormField
                  label=""
                  value={data.raceNotes[race] || ''}
                  onChange={(value: string) => handleRaceNoteChange(race, value)}
                  placeholder="Local customs, restrictions, or cultural notes..."
                  maxLength={200}
                  showLabel={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-2">Guidelines:</h4>
        {React.createElement('ul', {
          className: "text-xs text-zinc-400 space-y-1"
        }, [
          React.createElement('li', { key: 1 }, "• Playable: Available as player characters"),
          React.createElement('li', { key: 2 }, "• NPC-only: Present in world but not as PCs"),
          React.createElement('li', { key: 3 }, "• Other: Special circumstances or restrictions"),
          React.createElement('li', { key: 4 }, "• Use Regional Notes for cultural context and local variations")
        ])}
      </div>
    </div>
  );
}

export function CreaturesForm({ data, onUpdate, onManualSave, isManualSaving }: { 
  data: CreaturesData; 
  onUpdate: (updates: Partial<CreaturesData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}) {
  const [showAddCreature, setShowAddCreature] = useState(false);
  const [newCreatureName, setNewCreatureName] = useState("");

  const handleCreatureStatusChange = (creature: string, status: 'Common' | 'Uncommon' | 'Rare' | 'Protected' | 'Hunted') => {
    onUpdate({
      creatureStatus: { ...data.creatureStatus, [creature]: status }
    });
  };

  const handleAreaChange = (creature: string, areas: string) => {
    const areaArray = areas.split(',').map(s => s.trim()).filter(s => s);
    onUpdate({
      regionalAreas: { ...data.regionalAreas, [creature]: areaArray }
    });
  };

  const handleModifierChange = (field: keyof typeof data.localModifiers, value: string) => {
    onUpdate({
      localModifiers: { ...data.localModifiers, [field]: value }
    });
  };

  const handleAddCreature = () => {
    if (newCreatureName.trim()) {
      onUpdate({
        creatureStatus: { ...data.creatureStatus, [newCreatureName.trim()]: 'Common' },
        regionalAreas: { ...data.regionalAreas, [newCreatureName.trim()]: [] }
      });
      setNewCreatureName("");
      setShowAddCreature(false);
    }
  };

  const handleCancelAddCreature = () => {
    setNewCreatureName("");
    setShowAddCreature(false);
  };

  const handleRemoveCreature = (creature: string) => {
    const newStatus = { ...data.creatureStatus };
    const newAreas = { ...data.regionalAreas };
    delete newStatus[creature];
    delete newAreas[creature];
    onUpdate({
      creatureStatus: newStatus,
      regionalAreas: newAreas
    });
  };

  // Common fantasy creatures as defaults
  const defaultCreatures = [
    'Wolf', 'Bear', 'Goblin', 'Orc', 'Dragon', 'Giant Spider', 'Owlbear', 
    'Basilisk', 'Troll', 'Wyvern', 'Bandit', 'Undead', 'Fey', 'Elemental'
  ];

  // Combine default creatures with custom ones
  const allCreatures = [...new Set([...defaultCreatures, ...Object.keys(data.creatureStatus)])];

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Creatures" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-violet-400 text-center mb-4">Advanced Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Purpose:</strong> Define creature availability and encounter parameters for this region.
      </div>

      {/* Local Modifiers */}
      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Regional Encounter Modifiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Encounter Difficulty"
            value={data.localModifiers.encounterDifficulty}
            onChange={(value: string) => handleModifierChange('encounterDifficulty', value)}
            placeholder="Normal / Increased / Reduced"
          />
          <FormField
            label="Seasonal Window"
            value={data.localModifiers.seasonalWindow}
            onChange={(value: string) => handleModifierChange('seasonalWindow', value)}
            placeholder="Year-round / Spring-Summer / etc."
          />
          <FormField
            label="Laws & Protections"
            value={data.localModifiers.lawsProtections}
            onChange={(value: string) => handleModifierChange('lawsProtections', value)}
            placeholder="Royal hunting preserve / Open season / etc."
          />
        </div>
      </div>

      {/* Creature Status */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Creature Status</h3>
        {!showAddCreature && (
          <button
            onClick={() => setShowAddCreature(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Add Custom Creature
          </button>
        )}
      </div>

      {/* Inline add creature form */}
      {showAddCreature && (
        <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-medium text-green-200">Add Custom Creature</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCreatureName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCreatureName(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddCreature()}
              placeholder="Enter creature name (e.g., Phoenix, Manticore)"
              className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
            />
            <button
              onClick={handleAddCreature}
              disabled={!newCreatureName.trim()}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black rounded"
            >
              Add
            </button>
            <button
              onClick={handleCancelAddCreature}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {allCreatures.map((creature) => (
          <div key={creature} className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">{creature}</h4>
              {!defaultCreatures.includes(creature) && (
                <button
                  onClick={() => handleRemoveCreature(creature)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Regional Status
                </label>
                <select
                  value={data.creatureStatus[creature] || 'Common'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCreatureStatusChange(creature, e.target.value as any)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                >
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Protected">Protected</option>
                  <option value="Hunted">Hunted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Regional Areas (comma-separated)
                </label>
                <FormField
                  label=""
                  value={(data.regionalAreas[creature] || []).join(', ')}
                  onChange={(value: string) => handleAreaChange(creature, value)}
                  placeholder="forests, mountains, caves..."
                  showLabel={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-2">Status Guidelines:</h4>
        {React.createElement('ul', {
          className: "text-xs text-zinc-400 space-y-1"
        }, [
          React.createElement('li', { key: 1 }, "• Common: Regularly encountered, no special circumstances"),
          React.createElement('li', { key: 2 }, "• Uncommon: Occasional encounters, specific conditions"),
          React.createElement('li', { key: 3 }, "• Rare: Very infrequent, special events or locations"),
          React.createElement('li', { key: 4 }, "• Protected: Legally protected, penalties for harming"),
          React.createElement('li', { key: 5 }, "• Hunted: Actively pursued, bounties may be offered")
        ])}
      </div>
    </div>
  );
}

export function DeitiesBeliefForm({ data, onUpdate, onManualSave, isManualSaving }: { 
  data: DeitiesBeliefData; 
  onUpdate: (updates: Partial<DeitiesBeliefData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}) {
  const [showAddDeity, setShowAddDeity] = useState(false);
  const [newDeityName, setNewDeityName] = useState("");

  const handleDeityInfluenceChange = (deity: string, influence: 'Low' | 'Medium' | 'High' | 'Dominant') => {
    onUpdate({
      chosenDeities: { ...data.chosenDeities, [deity]: influence }
    });
  };

  const handleTeachingChange = (deity: string, teaching: string) => {
    onUpdate({
      teachingsWorship: { ...data.teachingsWorship, [deity]: teaching }
    });
  };

  const handleAddDeity = () => {
    if (newDeityName.trim()) {
      onUpdate({
        chosenDeities: { ...data.chosenDeities, [newDeityName.trim()]: 'Low' },
        teachingsWorship: { ...data.teachingsWorship, [newDeityName.trim()]: '' }
      });
      setNewDeityName("");
      setShowAddDeity(false);
    }
  };

  const handleCancelAddDeity = () => {
    setNewDeityName("");
    setShowAddDeity(false);
  };

  const handleRemoveDeity = (deity: string) => {
    const newDeities = { ...data.chosenDeities };
    const newTeachings = { ...data.teachingsWorship };
    delete newDeities[deity];
    delete newTeachings[deity];
    onUpdate({
      chosenDeities: newDeities,
      teachingsWorship: newTeachings
    });
  };

  // Common fantasy deities/belief systems as defaults
  const defaultDeities = [
    'Nature Spirits', 'Ancestor Worship', 'Solar Deity', 'Storm Lord', 
    'Death God', 'War God', 'Wisdom Goddess', 'Trickster', 'Sea God',
    'Mountain King', 'Moon Goddess', 'Fire Lord'
  ];

  // Combine default deities with custom ones
  const allDeities = [...new Set([...defaultDeities, ...Object.keys(data.chosenDeities)])];

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Deities & Belief" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-violet-400 text-center mb-4">Advanced Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Purpose:</strong> Define religious and spiritual influences in this setting, from dominant faiths to local customs.
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Religious Influence</h3>
        {!showAddDeity && (
          <button
            onClick={() => setShowAddDeity(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Add Deity/Belief
          </button>
        )}
      </div>

      {/* Inline add deity form */}
      {showAddDeity && (
        <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-medium text-purple-200">Add Deity or Belief System</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={newDeityName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeityName(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddDeity()}
              placeholder="Enter deity or belief name (e.g., Sky Father, Coin Lord)"
              className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
            />
            <button
              onClick={handleAddDeity}
              disabled={!newDeityName.trim()}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white rounded"
            >
              Add
            </button>
            <button
              onClick={handleCancelAddDeity}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {allDeities.map((deity) => (
          <div key={deity} className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">{deity}</h4>
              {!defaultDeities.includes(deity) && (
                <button
                  onClick={() => handleRemoveDeity(deity)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Regional Influence
                </label>
                <select
                  value={data.chosenDeities[deity] || 'Low'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleDeityInfluenceChange(deity, e.target.value as any)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Dominant">Dominant</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Local Teachings & Worship
                </label>
                <FormField
                  label=""
                  value={data.teachingsWorship[deity] || ''}
                  onChange={(value: string) => handleTeachingChange(deity, value)}
                  placeholder="Local customs, temples, festivals, taboos..."
                  maxLength={300}
                  showLabel={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-2">Influence Guidelines:</h4>
        {React.createElement('ul', {
          className: "text-xs text-zinc-400 space-y-1"
        }, [
          React.createElement('li', { key: 1 }, "• Low: Minority followers, little social influence"),
          React.createElement('li', { key: 2 }, "• Medium: Established presence, some political weight"),
          React.createElement('li', { key: 3 }, "• High: Major social force, influences law and culture"),
          React.createElement('li', { key: 4 }, "• Dominant: Primary religious authority, shapes society"),
          React.createElement('li', { key: 5 }, "• Use Teachings field for local practices, holidays, taboos")
        ])}
      </div>
    </div>
  );
}

export function RelationsLawForm({ data, onUpdate, onManualSave, isManualSaving }: { 
  data: RelationsLawData; 
  onUpdate: (updates: Partial<RelationsLawData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}) {
  const [showAddConsequence, setShowAddConsequence] = useState(false);
  const [newConsequenceAction, setNewConsequenceAction] = useState("");
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");

  const handleGovernanceChange = (field: keyof typeof data.governance, value: string) => {
    onUpdate({
      governance: { ...data.governance, [field]: value }
    });
  };

  const handleConsequenceChange = (action: string, consequence: string) => {
    if (consequence.trim() === '') {
      const newTable = { ...data.consequencesTable };
      delete newTable[action];
      onUpdate({ consequencesTable: newTable });
    } else {
      onUpdate({
        consequencesTable: { ...data.consequencesTable, [action]: consequence }
      });
    }
  };

  const handleAddConsequence = () => {
    if (newConsequenceAction.trim()) {
      onUpdate({
        consequencesTable: { ...data.consequencesTable, [newConsequenceAction.trim()]: '' }
      });
      setNewConsequenceAction("");
      setShowAddConsequence(false);
    }
  };

  const handleCancelAddConsequence = () => {
    setNewConsequenceAction("");
    setShowAddConsequence(false);
  };

  const handleRemoveConsequence = (action: string) => {
    const newTable = { ...data.consequencesTable };
    delete newTable[action];
    onUpdate({ consequencesTable: newTable });
  };

  const handleAddCourt = () => {
    if (newCourtName.trim()) {
      onUpdate({
        governance: {
          ...data.governance,
          courts: [...data.governance.courts, newCourtName.trim()]
        }
      });
      setNewCourtName("");
      setShowAddCourt(false);
    }
  };

  const handleCancelAddCourt = () => {
    setNewCourtName("");
    setShowAddCourt(false);
  };

  const handleUpdateCourt = (index: number, value: string) => {
    const newCourts = [...data.governance.courts];
    newCourts[index] = value;
    onUpdate({
      governance: { ...data.governance, courts: newCourts }
    });
  };

  const handleRemoveCourt = (index: number) => {
    const newCourts = data.governance.courts.filter((_: string, i: number) => i !== index);
    onUpdate({
      governance: { ...data.governance, courts: newCourts }
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Relations & Law" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-violet-400 text-center mb-4">Advanced Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Purpose:</strong> Define how justice, governance, and social order function in this setting.
      </div>

      {/* Governance Structure */}
      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Governance Structure</h3>
        <div className="space-y-4">
          <FormField
            label="Who Decides (Authority)"
            value={data.governance.whoDecides}
            onChange={(value: string) => handleGovernanceChange('whoDecides', value)}
            placeholder="Mayor, Council of Elders, Noble House, etc."
          />
          
          <FormField
            label="How It Reaches the Streets"
            value={data.governance.howItReachesStreets}
            onChange={(value: string) => handleGovernanceChange('howItReachesStreets', value)}
            placeholder="Town criers, posted notices, guards, etc."
          />
          
          <FormField
            label="Enforcement Style"
            value={data.governance.enforcementStyle}
            onChange={(value: string) => handleGovernanceChange('enforcementStyle', value)}
            placeholder="Heavy-handed, corrupt, fair but slow, etc."
          />
        </div>
      </div>

      {/* Courts & Tribunals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Courts & Tribunals</h3>
          {!showAddCourt && (
            <button
              onClick={() => setShowAddCourt(true)}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Add Court
            </button>
          )}
        </div>

        {/* Inline add court form */}
        {showAddCourt && (
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-medium text-blue-200">Add Court or Tribunal</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCourtName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCourtName(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddCourt()}
                placeholder="Enter court name (e.g., Trade Disputes Court, Criminal Tribunal)"
                className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
              />
              <button
                onClick={handleAddCourt}
                disabled={!newCourtName.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white rounded"
              >
                Add
              </button>
              <button
                onClick={handleCancelAddCourt}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {data.governance.courts.map((court: string, index: number) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <FormField
                  label={`Court ${index + 1}`}
                  value={court}
                  onChange={(value: string) => handleUpdateCourt(index, value)}
                  placeholder="e.g. Trade Disputes Court, Criminal Tribunal"
                  showLabel={false}
                />
              </div>
              <button
                onClick={() => handleRemoveCourt(index)}
                className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                title="Remove court"
              >
                ×
              </button>
            </div>
          ))}
          {data.governance.courts.length === 0 && (
            <div className="text-zinc-400 text-sm italic">
              Add courts or tribunals that handle different types of cases.
            </div>
          )}
        </div>
      </div>

      {/* Justice Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Fair Justice Example"
          value={data.governance.fairExample}
          onChange={(value: string) => handleGovernanceChange('fairExample', value)}
          placeholder="A case where justice was served properly..."
          textarea={true}
        />
        
        <FormField
          label="Unfair Justice Example"
          value={data.governance.unfairExample}
          onChange={(value: string) => handleGovernanceChange('unfairExample', value)}
          placeholder="A case where justice was corrupted or failed..."
          textarea={true}
        />
      </div>

      {/* Consequences Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Consequences Table</h3>
          {!showAddConsequence && (
            <button
              onClick={() => setShowAddConsequence(true)}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Add Rule
            </button>
          )}
        </div>

        {/* Inline add consequence form */}
        {showAddConsequence && (
          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-medium text-red-200">Add Consequence Rule</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={newConsequenceAction}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewConsequenceAction(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddConsequence()}
                placeholder="Enter PC action (e.g., 'Steals from a merchant', 'Casts magic publicly')"
                className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
              />
              <button
                onClick={handleAddConsequence}
                disabled={!newConsequenceAction.trim()}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded"
              >
                Add
              </button>
              <button
                onClick={handleCancelAddConsequence}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="text-sm text-zinc-400 mb-4">
          Define "If PC does X, then likely Y" rules for common actions.
        </div>
        
        <div className="space-y-3">
          {Object.entries(data.consequencesTable).map(([action, consequence]) => (
            <div key={action} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <div className="font-medium text-zinc-200 p-2 bg-zinc-700/50 rounded">
                If PC: {action}
              </div>
              <div className="flex gap-3 items-start">
                <FormField
                  label=""
                  value={consequence}
                  onChange={(value: string) => handleConsequenceChange(action, value)}
                  placeholder="Then likely..."
                  showLabel={false}
                />
                <button
                  onClick={() => handleRemoveConsequence(action)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                  title="Remove rule"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {Object.keys(data.consequencesTable).length === 0 && (
            <div className="text-zinc-400 text-sm italic">
              Add consequences for common PC actions in this region.
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-2">Guidelines:</h4>
        {React.createElement('ul', {
          className: "text-xs text-zinc-400 space-y-1"
        }, [
          React.createElement('li', { key: 1 }, "• Focus on how laws actually work in practice, not just theory"),
          React.createElement('li', { key: 2 }, "• Include corruption, delays, and regional variations"),
          React.createElement('li', { key: 3 }, "• Consequences should reflect local culture and enforcement"),
          React.createElement('li', { key: 4 }, "• Examples help players understand the justice system's nature")
        ])}
      </div>
    </div>
  );
}

export function CurrencyForm({ data, onUpdate, onManualSave, isManualSaving }: { 
  data: CurrencyData; 
  onUpdate: (updates: Partial<CurrencyData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}) {
  const [showAddSlang, setShowAddSlang] = useState(false);
  const [newSlangDenomination, setNewSlangDenomination] = useState("");

  const handleBarterQuirksChange = (value: string) => {
    onUpdate({ barterQuirks: value });
  };

  const handleSlangChange = (denomination: string, slang: string) => {
    if (slang.trim() === '') {
      const newSlang = { ...data.currencySlang };
      delete newSlang[denomination];
      onUpdate({ currencySlang: newSlang });
    } else {
      onUpdate({
        currencySlang: { ...data.currencySlang, [denomination]: slang }
      });
    }
  };

  const handleAddSlang = () => {
    if (newSlangDenomination.trim()) {
      onUpdate({
        currencySlang: { ...data.currencySlang, [newSlangDenomination.trim()]: '' }
      });
      setNewSlangDenomination("");
      setShowAddSlang(false);
    }
  };

  const handleCancelAddSlang = () => {
    setNewSlangDenomination("");
    setShowAddSlang(false);
  };

  const handleRemoveSlang = (denomination: string) => {
    const newSlang = { ...data.currencySlang };
    delete newSlang[denomination];
    onUpdate({ currencySlang: newSlang });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Currency (Region-Inherited)" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-violet-400 text-center mb-4">Advanced Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Purpose:</strong> Display inherited currency from Era/Region settings plus local variations and slang.
      </div>

      {/* Resolved Denominations (Read-Only) */}
      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Standard Denominations
          <span className="text-sm font-normal text-zinc-400 ml-2">(From Era/Region)</span>
        </h3>
        
        {Object.keys(data.resolvedDenominations).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.resolvedDenominations).map(([name, value]) => (
              <div key={name} className="bg-zinc-700/50 rounded p-3">
                <div className="font-medium text-zinc-200">{name}</div>
                <div className="text-sm text-zinc-400">Value: {value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-400 italic">
            No standard denominations defined at Era/Region level. 
            Configure currency in the Era or World details first.
          </div>
        )}
      </div>

      {/* Local Barter Quirks */}
      <div>
        <FormField
          label="Local Barter & Exchange Quirks"
          value={data.barterQuirks}
          onChange={handleBarterQuirksChange}
          placeholder="Regional preferences, trade goods, seasonal variations..."
          textarea={true}
          maxLength={300}
        />
        <div className="text-xs text-zinc-400 mt-1">
          How currency works differently in this specific region
        </div>
      </div>

      {/* Currency Slang */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Local Currency Slang</h3>
          {!showAddSlang && (
            <button
              onClick={() => setShowAddSlang(true)}
              className="px-3 py-1 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
            >
              Add Slang Term
            </button>
          )}
        </div>

        {/* Inline add slang form */}
        {showAddSlang && (
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-4 space-y-3">
            <h4 className="text-lg font-medium text-amber-200">Add Currency Slang</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={newSlangDenomination}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSlangDenomination(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddSlang()}
                placeholder="Enter denomination name (e.g., Gold Piece, Silver Mark)"
                className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 px-3 py-2"
              />
              <button
                onClick={handleAddSlang}
                disabled={!newSlangDenomination.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black rounded"
              >
                Add
              </button>
              <button
                onClick={handleCancelAddSlang}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="text-sm text-zinc-400 mb-4">
          Regional nicknames and colloquialisms for money
        </div>
        
        <div className="space-y-3">
          {Object.entries(data.currencySlang).map(([denomination, slang]) => (
            <div key={denomination} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <div className="font-medium text-zinc-200 p-2 bg-zinc-700/50 rounded">
                {denomination}
              </div>
              <div className="flex gap-3 items-start">
                <FormField
                  label=""
                  value={slang}
                  onChange={(value: string) => handleSlangChange(denomination, value)}
                  placeholder='Local slang (e.g. "coppers", "dragons")'
                  showLabel={false}
                />
                <button
                  onClick={() => handleRemoveSlang(denomination)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                  title="Remove slang"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {Object.keys(data.currencySlang).length === 0 && (
            <div className="text-zinc-400 text-sm italic">
              Add local slang terms for different denominations.
            </div>
          )}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-zinc-800/50 border border-zinc-600/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-2">Currency in Practice:</h4>
        {React.createElement('ul', {
          className: "text-xs text-zinc-400 space-y-1"
        }, [
          React.createElement('li', { key: 1 }, "• Standard denominations come from Era/Region settings"),
          React.createElement('li', { key: 2 }, "• Use Barter Quirks for local trade preferences"),
          React.createElement('li', { key: 3 }, "• Add slang terms that NPCs would actually use"),
          React.createElement('li', { key: 4 }, "• Consider seasonal variations (harvest payments, etc.)")
        ])}
      </div>
    </div>
  );
}

export default PlacesOfInterestForm;