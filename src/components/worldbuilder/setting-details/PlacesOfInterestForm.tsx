// Places of Interest Form
"use client";

import { useState } from "react";
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

interface PlacesOfInterestFormProps {
  data: PlacesOfInterestData;
  onUpdate: (updates: Partial<PlacesOfInterestData>) => void;
}

export function PlacesOfInterestForm({ data, onUpdate }: PlacesOfInterestFormProps) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Places of Interest</h2>
        <div className="text-sm text-amber-400">MVS Required Section</div>
      </div>

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
}

export function CampaignSeedsForm({ data, onUpdate }: CampaignSeedsFormProps) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Campaign Seeds</h2>
        <div className="text-sm text-amber-400">MVS Required Section</div>
      </div>

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
}

export function MagicProfileForm({ data, onUpdate, eraData }: MagicProfileFormProps) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Magic Profile</h2>
        <div className="text-sm text-violet-400">Advanced Section</div>
      </div>

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

export function RacesBeingsForm({ data, onUpdate }: { data: RacesBeingsData; onUpdate: (updates: Partial<RacesBeingsData>) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Races & Beings</h2>
      <div className="p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <p className="text-amber-200">This form is under construction.</p>
      </div>
    </div>
  );
}

export function CreaturesForm({ data, onUpdate }: { data: CreaturesData; onUpdate: (updates: Partial<CreaturesData>) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Creatures</h2>
      <div className="p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <p className="text-amber-200">This form is under construction.</p>
      </div>
    </div>
  );
}

export function DeitiesBeliefForm({ data, onUpdate }: { data: DeitiesBeliefData; onUpdate: (updates: Partial<DeitiesBeliefData>) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Deities & Belief</h2>
      <div className="p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <p className="text-amber-200">This form is under construction.</p>
      </div>
    </div>
  );
}

export function RelationsLawForm({ data, onUpdate }: { data: RelationsLawData; onUpdate: (updates: Partial<RelationsLawData>) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Relations & Law</h2>
      <div className="p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <p className="text-amber-200">This form is under construction.</p>
      </div>
    </div>
  );
}

export function CurrencyForm({ data, onUpdate }: { data: CurrencyData; onUpdate: (updates: Partial<CurrencyData>) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Currency (Read-Only)</h2>
      <div className="p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <p className="text-amber-200">This form is under construction.</p>
        <p className="text-sm text-amber-300 mt-2">
          Shows resolved currency from Era/Region settings
        </p>
      </div>
    </div>
  );
}

export default PlacesOfInterestForm;