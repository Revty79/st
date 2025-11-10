"use client";

import { GeographyEnvironmentData } from "@/types/settings";

interface GeographyEnvironmentFormProps {
  data: GeographyEnvironmentData;
  onUpdate: (updates: Partial<GeographyEnvironmentData>) => void;
}

export default function GeographyEnvironmentForm({ data, onUpdate }: GeographyEnvironmentFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Geography & Environment</h2>
        <div className="text-sm text-amber-400">MVS Required Section</div>
      </div>

      <div className="p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <p className="text-amber-200">This form is under construction.</p>
        <p className="text-sm text-amber-300 mt-2">
          Will include: Travel/Tactics Bullets, Resources ↔ Hazards, Signature Features
        </p>
      </div>
    </div>
  );
}