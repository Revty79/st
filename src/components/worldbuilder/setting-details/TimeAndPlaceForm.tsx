"use client";

import { useState } from "react";
import FormField from "@/components/shared/FormField";
import { TimeAndPlaceData } from "@/types/settings";

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

interface TimeAndPlaceFormProps {
  data: TimeAndPlaceData;
  onUpdate: (updates: Partial<TimeAndPlaceData>) => void;
  onManualSave?: () => void;
  isManualSaving?: boolean;
}

export default function TimeAndPlaceForm({ data, onUpdate, onManualSave, isManualSaving }: TimeAndPlaceFormProps) {
  const handleAddQuirk = () => {
    if (data.calendarQuirks.length < 3) {
      onUpdate({ calendarQuirks: [...data.calendarQuirks, ""] });
    }
  };

  const handleUpdateQuirk = (index: number, value: string) => {
    const newQuirks = [...data.calendarQuirks];
    newQuirks[index] = value;
    onUpdate({ calendarQuirks: newQuirks });
  };

  const handleRemoveQuirk = (index: number) => {
    const newQuirks = data.calendarQuirks.filter((_, i) => i !== index);
    onUpdate({ calendarQuirks: newQuirks });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Time & Place" 
        onSave={onManualSave} 
        isSaving={isManualSaving} 
      />

      <div className="text-sm text-amber-400 text-center mb-4">MVS Required Section</div>

      <div className="text-sm text-zinc-300 bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
        <strong>Fill Goal:</strong> Anchor this setting in time and add local calendar quirks that create gameplay opportunities.
      </div>

      {/* Local Date Span */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Local Date Span (within Era)</h3>
        <div className="text-sm text-zinc-400">
          When is this setting "hot" or active? Use the World calendar system.
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Start Date"
            value={data.localDateSpan.start}
            onCommit={(value: string) => onUpdate({ 
              localDateSpan: { ...data.localDateSpan, start: value }
            })}
            placeholder="318 AF, Month of Storms, Day 15"
            helperText="When does this setting become active?"
          />
          
          <FormField
            label="End Date"
            value={data.localDateSpan.end}
            onCommit={(value: string) => onUpdate({ 
              localDateSpan: { ...data.localDateSpan, end: value }
            })}
            placeholder="320 AF, Month of Harvest, Day 30"
            helperText="When does this setting period end? (optional if ongoing)"
          />
        </div>

        <div className="text-xs text-zinc-400">
          Examples: "318-320 AF", "Spring Equinox to Summer Solstice, Year 1247", "The three months after the Great Storm"
        </div>
      </div>

      {/* Calendar Quirks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Calendar Quirks (2-3)</h3>
        <div className="text-sm text-zinc-400">
          Regional twists that affect scenes and create gameplay opportunities
        </div>
        
        <div className="space-y-3">
          {data.calendarQuirks.map((quirk, index) => (
            <div key={index} className="flex gap-2">
              <FormField
                label={`Quirk ${index + 1}`}
                value={quirk}
                onCommit={(value: string) => handleUpdateQuirk(index, value)}
                placeholder="Storm-week every 60 days - all travel impossible"
                maxLength={120}
                className="flex-1"
                helperText="How does local time create drama?"
              />
              <button
                onClick={() => handleRemoveQuirk(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          
          {data.calendarQuirks.length < 3 && (
            <button
              onClick={handleAddQuirk}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Add Calendar Quirk
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs text-zinc-400">
          <div><strong>Examples:</strong></div>
          <div>• "Duel-amnesty on Tidesend" - legal consequences suspended</div>
          <div>• "Storm week every 60 days" - weather blocks travel/communication</div>
          <div>• "Double-moon nights" - magic surges, strange behavior</div>
          <div>• "Market silence on seventh day" - economic/social restriction</div>
          <div>• "Tide-courts only during high water" - legal system quirk</div>
        </div>
      </div>

      {/* Helpful Prompts */}
      <div className="border border-blue-500/30 bg-blue-950/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Quick Fill Prompts</h4>
        <div className="space-y-2 text-sm text-blue-200">
          <div><strong>Date Span:</strong> "What crisis/opportunity makes this timeframe special?"</div>
          <div><strong>Calendar Quirks:</strong> "What local time rules create pressure or opportunity for PCs?"</div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-6 p-4 border border-amber-500/30 bg-amber-950/30 rounded-lg">
        <h4 className="text-sm font-medium text-amber-400 mb-2">MVS Completion Checklist</h4>
        <div className="space-y-1 text-sm">
          <div className={data.localDateSpan.start ? "text-green-400" : "text-zinc-400"}>
            {data.localDateSpan.start ? "✓" : "○"} Start Date
          </div>
          <div className={data.calendarQuirks.length >= 2 ? "text-green-400" : "text-zinc-400"}>
            {data.calendarQuirks.length >= 2 ? "✓" : "○"} Calendar Quirks (2-3)
          </div>
        </div>
      </div>
    </div>
  );
}