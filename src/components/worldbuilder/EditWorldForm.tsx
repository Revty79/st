"use client";

import { useState } from "react";
import { FormField, Button, Input, Textarea } from "@/components/ui";

interface EditWorldFormProps {
  initial: {
    name: string;
    description: string;
  };
  onUpdate: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function EditWorldForm({ initial, onUpdate, onCancel }: EditWorldFormProps) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(name, description);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-amber-500/20 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-amber-400 mb-4">Edit World</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="World name..."
              required
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="World description..."
              rows={4}
            />
          </FormField>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!name.trim()}
              variant="primary"
            >
              Save
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
    </div>
  );
}