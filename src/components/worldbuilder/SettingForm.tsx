"use client";

import { useState } from "react";
import { FormField, Button, Input, Textarea } from "@/components/ui";

interface SettingFormProps {
  onCancel: () => void;
  onCreate: (name: string, desc: string, start: number | null, end: number | null) => void;
}

const intOrNull = (s: string): number | null => {
  const trimmed = s.trim();
  return trimmed ? parseInt(trimmed, 10) || null : null;
};

export default function SettingForm({ onCancel, onCreate }: SettingFormProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, desc, intOrNull(start), intOrNull(end));
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="text-sm font-semibold text-zinc-100 mb-4">Create Setting</div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name" required>
          <Input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Setting name"
            required
          />
        </FormField>

        <FormField label="Short Summary">
          <Textarea
            rows={3}
            value={desc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
            placeholder="Setting description..."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Year">
            <Input
              type="number"
              value={start}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStart(e.target.value)}
              placeholder="Start year (optional)"
            />
          </FormField>

          <FormField label="End Year">
            <Input
              type="number"
              value={end}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnd(e.target.value)}
              placeholder="End year (optional)"
            />
          </FormField>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={!name.trim()}
            variant="primary"
          >
            Create Setting
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