"use client";

import { useState, useEffect } from "react";

export interface MasterCatalogsData {
  _placeholder?: string;
}

interface MasterCatalogsFormProps {
  data: MasterCatalogsData;
  onUpdate: (data: Partial<MasterCatalogsData>) => void;
}

export default function MasterCatalogsForm({ data, onUpdate }: MasterCatalogsFormProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-2xl font-bold text-white">Master Index</h2>
        <p className="text-sm text-white/60 mt-2">
          Read-only catalog browser - coming soon
        </p>
      </div>
    </div>
  );
}
