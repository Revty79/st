// src/components/shared/RecordSelector.tsx
"use client";

import { useState } from "react";

interface Record {
  id: number;
  name: string;
}

interface RecordSelectorProps {
  records: Record[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onCreate: (name: string) => Promise<void>;
  onRename?: (id: number, newName: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  loading?: boolean;
  recordType?: string; // e.g., "Race", "Creature", "Item"
}

export default function RecordSelector({
  records,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  loading = false,
  recordType = "Record",
}: RecordSelectorProps) {
  const [newName, setNewName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedRecord = records.find((r) => r.id === selectedId);

  const handleCreate = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      await onCreate(newName.trim());
      setNewName("");
    } catch (error) {
      console.error("Create failed:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async () => {
    if (!selectedId || !renameValue.trim() || !onRename || renaming) return;
    setRenaming(true);
    try {
      await onRename(selectedId, renameValue.trim());
      setRenameValue("");
    } catch (error) {
      console.error("Rename failed:", error);
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !onDelete || deleting) return;
    if (!confirm(`Delete ${recordType.toLowerCase()} "${selectedRecord?.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(selectedId);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center gap-3">
      {/* Select existing */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">{recordType}:</span>
        <select
          className="w-64 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-400"
          value={selectedId ?? ""}
          onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
          disabled={loading}
        >
          {records.length === 0 && <option value="">(none)</option>}
          {records.map((r) => (
            <option key={r.id} value={r.id} className="bg-zinc-800">
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Create new */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={`New ${recordType.toLowerCase()} name...`}
          className="w-56 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-amber-400"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          disabled={loading || creating}
        />
        <button
          type="button"
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
          onClick={handleCreate}
          disabled={loading || creating || !newName.trim()}
        >
          {creating ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Rename */}
      {onRename && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={selectedRecord ? `Rename "${selectedRecord.name}"...` : "Rename..."}
            className="w-52 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-amber-400"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            disabled={loading || renaming || !selectedId}
          />
          <button
            type="button"
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
            onClick={handleRename}
            disabled={loading || renaming || !selectedId || !renameValue.trim()}
          >
            {renaming ? "Renaming..." : "Rename"}
          </button>
        </div>
      )}

      {/* Delete */}
      {onDelete && (
        <div className="ml-auto">
          <button
            type="button"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
            onClick={handleDelete}
            disabled={loading || deleting || !selectedId}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
