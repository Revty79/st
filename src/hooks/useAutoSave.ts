// src/hooks/useAutoSave.ts
"use client";

import { useCallback, useRef, useState } from "react";

interface UseAutoSaveOptions {
  onSave: (data?: any) => Promise<void>;
  debounceMs?: number;
}

export function useAutoSave({ onSave, debounceMs = 500 }: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const save = useCallback(
    async (data?: any) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await onSave(data);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Auto-save failed:", error);
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    },
    [onSave, debounceMs]
  );

  return { save, isSaving, lastSaved };
}
