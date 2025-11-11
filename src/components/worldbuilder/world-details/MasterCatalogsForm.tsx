"use client";

import { useState, useEffect } from "react";

export interface MasterCatalogsData {
  races?: Array<{ id: number; race_id: number; name: string; order_index: number }>;
  creatures?: Array<{ id: number; creature_id: number; name: string; category?: string; order_index: number }>;
}

interface MasterCatalogsFormProps {
  data: MasterCatalogsData;
  onUpdate: (data: Partial<MasterCatalogsData>) => void;
  worldId: number;
}

interface Race {
  id: number;
  name: string;
  description?: string;
}

interface Creature {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

export default function MasterCatalogsForm({ data, onUpdate, worldId }: MasterCatalogsFormProps) {
  const [allRaces, setAllRaces] = useState<Race[]>([]);
  const [allCreatures, setAllCreatures] = useState<Creature[]>([]);
  const [selectedRaceIds, setSelectedRaceIds] = useState<Set<number>>(new Set());
  const [selectedCreatureIds, setSelectedCreatureIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch all available races and creatures from database
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [racesRes, creaturesRes] = await Promise.all([
          fetch("/api/races"),
          fetch("/api/creatures")
        ]);
        
        const racesData = await racesRes.json();
        const creaturesData = await creaturesRes.json();
        
        console.log("Races API response:", racesData);
        console.log("Creatures API response:", creaturesData);
        
        if (racesData.ok) {
          const races = racesData.data || [];
          console.log("Setting races:", races);
          setAllRaces(races);
        }
        if (creaturesData.ok) {
          const creatures = creaturesData.data || [];
          console.log("Setting creatures:", creatures);
          setAllCreatures(creatures);
        }
      } catch (err) {
        console.error("Failed to fetch catalogs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCatalogs();
  }, []);

  // Initialize selected IDs from data prop
  useEffect(() => {
    if (data.races) {
      setSelectedRaceIds(new Set(data.races.map(r => r.race_id)));
    }
    if (data.creatures) {
      setSelectedCreatureIds(new Set(data.creatures.map(c => c.creature_id)));
    }
  }, [data]);

  const handleRaceToggle = async (raceId: number) => {
    const newSelected = new Set(selectedRaceIds);
    if (newSelected.has(raceId)) {
      newSelected.delete(raceId);
      // Remove from world_races
      await fetch(`/api/world-details?worldId=${worldId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldId,
          section: "masterCatalogs",
          action: "removeRace",
          raceId
        })
      });
    } else {
      newSelected.add(raceId);
      // Add to world_races
      await fetch(`/api/world-details?worldId=${worldId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldId,
          section: "masterCatalogs",
          action: "addRace",
          raceId
        })
      });
    }
    setSelectedRaceIds(newSelected);
  };

  const handleCreatureToggle = async (creatureId: number) => {
    const newSelected = new Set(selectedCreatureIds);
    if (newSelected.has(creatureId)) {
      newSelected.delete(creatureId);
      // Remove from world_creatures
      await fetch(`/api/world-details?worldId=${worldId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldId,
          section: "masterCatalogs",
          action: "removeCreature",
          creatureId
        })
      });
    } else {
      newSelected.add(creatureId);
      // Add to world_creatures
      await fetch(`/api/world-details?worldId=${worldId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldId,
          section: "masterCatalogs",
          action: "addCreature",
          creatureId
        })
      });
    }
    setSelectedCreatureIds(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-white/20 pb-4">
          <h2 className="text-2xl font-bold text-white">Master Index</h2>
          <p className="text-sm text-white/60 mt-2">Loading catalogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-2xl font-bold text-white">Master Index</h2>
        <p className="text-sm text-white/60 mt-2">
          Select which races and creatures exist in this world
        </p>
      </div>

      {/* Races Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Races</h3>
        <p className="text-sm text-white/60">
          {selectedRaceIds.size} of {allRaces.length} races selected
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allRaces.map((race) => (
            <label
              key={race.id}
              className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedRaceIds.has(race.id)}
                onChange={() => handleRaceToggle(race.id)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-black/20"
              />
              <div className="flex-1">
                <div className="font-medium text-white">{race.name}</div>
                {race.description && (
                  <div className="text-xs text-white/60 mt-1 line-clamp-2">{race.description}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Creatures Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Creatures</h3>
        <p className="text-sm text-white/60">
          {selectedCreatureIds.size} of {allCreatures.length} creatures selected
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCreatures.map((creature) => (
            <label
              key={creature.id}
              className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCreatureIds.has(creature.id)}
                onChange={() => handleCreatureToggle(creature.id)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-black/20"
              />
              <div className="flex-1">
                <div className="font-medium text-white">{creature.name}</div>
                {creature.category && (
                  <div className="text-xs text-purple-400 mt-0.5">{creature.category}</div>
                )}
                {creature.description && (
                  <div className="text-xs text-white/60 mt-1 line-clamp-2">{creature.description}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
