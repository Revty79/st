"use client";

import { useState } from "react";

// Number input component
const NumberInput = ({ value, onCommit, placeholder, min, max, step = 1 }: {
  value: number | null;
  onCommit: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) => {
  const [raw, setRaw] = useState(value?.toString() || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow numbers and decimal point for floats
    if (/^\d*\.?\d*$/.test(newValue) || newValue === "") {
      setRaw(newValue);
    }
  };

  const handleBlur = () => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      onCommit(null);
      setRaw("");
      return;
    }

    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      onCommit(null);
      setRaw("");
      return;
    }

    const clampedValue = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, num));
    onCommit(clampedValue);
    setRaw(clampedValue.toString());
  };

  return (
    <input
      type="text"
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    />
  );
};

// Text input component
const Input = ({ value, onCommit, placeholder, maxLength }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) => {
  const [raw, setRaw] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };

  const handleBlur = () => {
    onCommit(raw);
  };

  return (
    <input
      type="text"
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    />
  );
};

// Text area component
const Textarea = ({ value, onCommit, placeholder }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
}) => {
  const [raw, setRaw] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRaw(e.target.value);
  };

  const handleBlur = () => {
    onCommit(raw);
  };

  return (
    <textarea
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      rows={2}
      className="w-full rounded-lg bg-white/10 text-white placeholder:text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 resize-y"
    />
  );
};

// Month interface
export interface MonthData {
  name: string;
  days: number | null;
}

export interface SeasonBandData {
  name: string;
  startDay: number | null;
  endDay: number | null;
}

// Time & Calendar data interface
export interface TimeCalendarData {
  dayHours: number | null;
  yearDays: number | null;
  months: MonthData[];
  weekdays: string[];
  leapRule: string;
  seasonBands: SeasonBandData[];
}

interface TimeCalendarFormProps {
  data: TimeCalendarData;
  onUpdate: (data: Partial<TimeCalendarData>) => void;
}

// Reorderable list component
const ReorderableList = ({ items, onReorder, onUpdate, onRemove, placeholder, maxLength }: {
  items: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  maxLength?: number;
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
    setDragIndex(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className={`flex items-center space-x-2 p-2 border border-white/20 bg-white/5 rounded ${
            dragIndex === index ? "opacity-50" : ""
          }`}
        >
          <div className="cursor-move text-white">⋮⋮</div>
          <Input
            value={item}
            onCommit={(value) => onUpdate(index, value)}
            placeholder={placeholder}
            maxLength={maxLength}
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-300 px-2"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default function TimeCalendarForm({ data, onUpdate }: TimeCalendarFormProps) {
  // Ensure arrays are never undefined
  const safeData = {
    ...data,
    months: data.months || [],
    weekdays: data.weekdays || [],
    seasonBands: data.seasonBands || []
  };

  const addMonth = () => {
    const newMonths = [...safeData.months, { name: "", days: null }];
    onUpdate({ months: newMonths });
  };

  const removeMonth = (index: number) => {
    const newMonths = safeData.months.filter((_, i) => i !== index);
    onUpdate({ months: newMonths });
  };

  const updateMonth = (index: number, updates: Partial<MonthData>) => {
    const newMonths = safeData.months.map((month, i) => 
      i === index ? { ...month, ...updates } : month
    );
    onUpdate({ months: newMonths });
  };

  const reorderMonths = (fromIndex: number, toIndex: number) => {
    const newMonths = [...safeData.months];
    const [moved] = newMonths.splice(fromIndex, 1);
    newMonths.splice(toIndex, 0, moved);
    onUpdate({ months: newMonths });
  };

  const addWeekday = () => {
    if (safeData.weekdays.length < 14) {
      const newWeekdays = [...safeData.weekdays, ""];
      onUpdate({ weekdays: newWeekdays });
    }
  };

  const removeWeekday = (index: number) => {
    if (safeData.weekdays.length > 2) {
      const newWeekdays = safeData.weekdays.filter((_, i) => i !== index);
      onUpdate({ weekdays: newWeekdays });
    }
  };

  const updateWeekday = (index: number, value: string) => {
    const newWeekdays = safeData.weekdays.map((day, i) => i === index ? value : day);
    onUpdate({ weekdays: newWeekdays });
  };

  const reorderWeekdays = (fromIndex: number, toIndex: number) => {
    const newWeekdays = [...safeData.weekdays];
    const [moved] = newWeekdays.splice(fromIndex, 1);
    newWeekdays.splice(toIndex, 0, moved);
    onUpdate({ weekdays: newWeekdays });
  };

  const addSeasonBand = () => {
    const newBands = [...safeData.seasonBands, { name: "", startDay: null, endDay: null }];
    onUpdate({ seasonBands: newBands });
  };

  const removeSeasonBand = (index: number) => {
    const newBands = safeData.seasonBands.filter((_, i) => i !== index);
    onUpdate({ seasonBands: newBands });
  };

  const updateSeasonBand = (index: number, updates: Partial<SeasonBandData>) => {
    const newBands = safeData.seasonBands.map((band, i) => 
      i === index ? { ...band, ...updates } : band
    );
    onUpdate({ seasonBands: newBands });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Time & Calendar — Player-Facing</h2>
        <p className="text-sm text-white mt-1">
          Single clock for eras, catalysts, NPC dates. Sets the rhythm of your world.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Length of Day */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Length of Day (hours)
          </label>
          <p className="text-xs text-white mb-2">
            Float, 1–100 hours.
          </p>
          <NumberInput
            value={safeData.dayHours}
            onCommit={(value) => onUpdate({ dayHours: value })}
            placeholder="24"
            min={1}
            max={100}
            step={0.1}
          />
        </div>

        {/* Length of Year */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Length of Year (days)
          </label>
          <p className="text-xs text-white mb-2">
            Integer, 30–1000 days.
          </p>
          <NumberInput
            value={safeData.yearDays}
            onCommit={(value) => onUpdate({ yearDays: value })}
            placeholder="365"
            min={30}
            max={1000}
          />
        </div>
      </div>

      {/* Months */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-white">
            Months (ordered list)
          </label>
          <button
            type="button"
            onClick={addMonth}
            className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
          >
            Add Month
          </button>
        </div>
        <p className="text-xs text-white mb-4">
          Name (≤30 chars), Days (1–60). Drag to reorder.
        </p>

        <div className="space-y-2">
          {safeData.months.length === 0 ? (
            <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
              No months added yet. Click "Add Month" to create one.
            </div>
          ) : (
            safeData.months.map((month, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 border border-white/20 bg-white/5 rounded"
              >
                <div className="cursor-move text-white">⋮⋮</div>
                <div className="flex-1">
                  <Input
                    value={month.name}
                    onCommit={(value) => updateMonth(index, { name: value })}
                    placeholder="Month name"
                    maxLength={30}
                  />
                </div>
                <div className="w-20">
                  <NumberInput
                    value={month.days}
                    onCommit={(value) => updateMonth(index, { days: value })}
                    placeholder="Days"
                    min={1}
                    max={60}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMonth(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekdays */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-white">
            Weekdays (ordered list)
          </label>
          <button
            type="button"
            onClick={addWeekday}
            disabled={safeData.weekdays.length >= 14}
            className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400 disabled:opacity-50"
          >
            Add Weekday
          </button>
        </div>
        <p className="text-xs text-white mb-4">
          2–14 entries. Drag to reorder.
        </p>

        <ReorderableList
          items={safeData.weekdays}
          onReorder={reorderWeekdays}
          onUpdate={updateWeekday}
          onRemove={removeWeekday}
          placeholder="Weekday name"
          maxLength={20}
        />

        {safeData.weekdays.length < 2 && (
          <p className="text-sm text-amber-400 mt-2">
            At least 2 weekdays are required.
          </p>
        )}
      </div>

      {/* Leap Rule */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Leap Rule (optional)
        </label>
        <p className="text-xs text-white mb-2">
          Description of how leap years work in your calendar system.
        </p>
        <Textarea
          value={safeData.leapRule}
          onCommit={(value) => onUpdate({ leapRule: value })}
          placeholder="e.g., Every 4 years, add an extra day to the last month..."
        />
      </div>

      {/* Season Bands */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-white">
            Season Bands (optional, repeatable)
          </label>
          <button
            type="button"
            onClick={addSeasonBand}
            className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
          >
            Add Season
          </button>
        </div>
        <p className="text-xs text-white mb-4">
          Define the seasons in your world by day range. Useful for climate, agriculture, and narrative pacing.
        </p>

        <div className="space-y-4">
          {safeData.seasonBands.length === 0 ? (
            <div className="text-white text-center py-8 border-2 border-dashed border-white/20 rounded">
              No season bands defined yet. Click "Add Season" to create one.
            </div>
          ) : (
            safeData.seasonBands.map((band, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    Season {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeSeasonBand(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Season Name
                    </label>
                    <Input
                      value={band.name}
                      onCommit={(value) => updateSeasonBand(index, { name: value })}
                      placeholder="e.g., Spring, Winter..."
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Start Day (1–{safeData.yearDays || 365})
                    </label>
                    <NumberInput
                      value={band.startDay}
                      onCommit={(value) => updateSeasonBand(index, { startDay: value })}
                      placeholder="Day"
                      min={1}
                      max={safeData.yearDays || 365}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      End Day (1–{safeData.yearDays || 365})
                    </label>
                    <NumberInput
                      value={band.endDay}
                      onCommit={(value) => updateSeasonBand(index, { endDay: value })}
                      placeholder="Day"
                      min={1}
                      max={safeData.yearDays || 365}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
