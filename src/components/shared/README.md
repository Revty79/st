# Shared Components for Builder Pages

This directory contains reusable components for creating consistent builder pages (Races, Creatures, Inventory, etc.) that match the World Details layout pattern.

## Components

### `NavigationTabs`
Sticky tab navigation bar with icons and hover effects.

```tsx
import NavigationTabs from "@/components/shared/NavigationTabs";

<NavigationTabs
  sections={[
    { id: "identity", label: "Identity & Lore", icon: "📋" },
    { id: "stats", label: "Stats", icon: "💪" },
    { id: "combat", label: "Combat", icon: "⚔️" },
  ]}
  currentSection={currentSection}
  onSectionChange={setCurrentSection}
/>
```

### `SaveIndicator`
Shows saving status with animations.

```tsx
import SaveIndicator from "@/components/shared/SaveIndicator";

<SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

### `RecordSelector`
Complete dropdown with create/rename/delete functionality.

```tsx
import RecordSelector from "@/components/shared/RecordSelector";

<RecordSelector
  records={races}
  selectedId={selectedId}
  onSelect={setSelectedId}
  onCreate={async (name) => { /* create logic */ }}
  onRename={async (id, name) => { /* rename logic */ }}
  onDelete={async (id) => { /* delete logic */ }}
  loading={loading}
  recordType="Race"
/>
```

### `FormField`
Auto-save form field with onBlur commit.

```tsx
import FormField from "@/components/shared/FormField";

<FormField
  label="Description"
  value={data.description}
  onCommit={(value) => updateData({ description: value })}
  type="textarea"
  placeholder="Enter description..."
  maxLength={500}
/>
```

## Hook

### `useAutoSave`
Debounced auto-save with status tracking.

```tsx
import { useAutoSave } from "@/hooks/useAutoSave";

const { save, isSaving, lastSaved } = useAutoSave({
  onSave: async (data) => {
    await fetch("/api/resource", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  debounceMs: 500,
});

// Call save whenever data changes
const updateField = (field: string, value: any) => {
  setData(prev => ({ ...prev, [field]: value }));
  save({ ...data, [field]: value });
};
```

## Pattern

### Standard Builder Page Structure

```tsx
export default function BuilderPage() {
  // Record selection
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState({});
  
  // UI state
  const [currentSection, setCurrentSection] = useState("identity");
  const [loading, setLoading] = useState(false);
  
  // Auto-save
  const { save, isSaving, lastSaved } = useAutoSave({
    onSave: async (data) => {
      await fetch(`/api/resource?id=${selectedId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  });
  
  const updateData = (updates: any) => {
    const newData = { ...data, ...updates };
    setData(newData);
    save(newData);
  };
  
  return (
    <main className="min-h-screen px-6 py-10">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/worldbuilder">← World Builder</Link>
            <h1 className="font-evanescent st-title-gradient text-4xl">Title</h1>
          </div>
          <WorldBuilderNavigation current="page" />
        </div>
        <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      </header>
      
      {/* Record Selector */}
      <RecordSelector {...props} />
      
      {/* Tab Navigation */}
      <NavigationTabs {...props} />
      
      {/* Content */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-6">
        {currentSection === "identity" && (
          <FormField
            label="Name"
            value={data.name}
            onCommit={(v) => updateData({ name: v })}
          />
        )}
      </div>
    </main>
  );
}
```

## Visual Style

All components use consistent styling:
- **Colors**: `border-white/15`, `bg-white/10`, `text-zinc-200`
- **Focus**: `ring-amber-400`
- **Backdrop**: `backdrop-blur-sm`
- **Active tabs**: `border-amber-400 text-amber-100`
- **Hover**: `hover:bg-white/10`
