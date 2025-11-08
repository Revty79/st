// src/components/shared/SaveIndicator.tsx
"use client";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export default function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center text-amber-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent mr-2"></div>
        <span className="text-sm">Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center text-green-400">
        <span className="mr-2">✓</span>
        <span className="text-sm">Saved {lastSaved.toLocaleTimeString()}</span>
      </div>
    );
  }

  return null;
}
