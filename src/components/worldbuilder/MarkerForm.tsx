"use client";

import { useState } from "react";
import { FormField, Button, Input, Textarea, Select } from "@/components/ui";

interface Era {
  id: number;
  name: string;
  description?: string | null;
}

interface MarkerFormProps {
  eras: Era[];
  onCancel: () => void;
  onCreate: (name: string, desc: string, year: number | null, eraId: number | null) => void;
}

const intOrNull = (s: string): number | null => {
  const trimmed = s.trim();
  return trimmed ? parseInt(trimmed, 10) || null : null;
};

export default function MarkerForm({ eras, onCancel, onCreate }: MarkerFormProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [year, setYear] = useState<string>("");
  const [eraId, setEraId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, desc, intOrNull(year), eraId ? Number(eraId) : null);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-sm font-semibold text-zinc-100 mb-4">Create Event Marker</div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Event name"
              required
            />
          </FormField>

          <FormField label="Year">
            <Input
              type="number"
              value={year}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
              placeholder="Year (optional)"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea
            rows={3}
            value={desc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
            placeholder="Event description..."
          />
        </FormField>

        <FormField label="Era">
          <Select
            value={eraId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEraId(e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {eras.map((era) => (
              <option key={era.id} value={String(era.id)}>
                {era.name}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={!name.trim()}
            variant="primary"
          >
            Create Event
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}