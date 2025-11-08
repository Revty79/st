"use client";

import { useState } from "react";
import { FormField, Button, Input, Textarea } from "@/components/ui";

interface EraFormProps {
  onCancel: () => void;
  onCreate: (name: string, desc: string, start: number | null, end: number | null, color: string) => void;
}

const intOrNull = (s: string): number | null => {
  const trimmed = s.trim();
  return trimmed ? parseInt(trimmed, 10) || null : null;
};

export default function EraForm({ onCancel, onCreate }: EraFormProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [color, setColor] = useState("#8b5cf6");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, desc, intOrNull(start), intOrNull(end), color);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-sm font-semibold text-zinc-100 mb-4">Create Era</div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Era name"
              required
            />
          </FormField>

          <FormField label="Color">
            <Input
              type="color"
              value={color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea
            rows={3}
            value={desc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
            placeholder="Era description..."
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
            Create Era
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