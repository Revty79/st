// src/components/shared/NavigationTabs.tsx
"use client";

interface NavigationTabsProps {
  sections: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function NavigationTabs({ sections, currentSection, onSectionChange }: NavigationTabsProps) {
  return (
    <div className="border-b border-white/15 bg-white/10 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                currentSection === section.id
                  ? "border-amber-400 text-amber-100"
                  : "border-transparent text-zinc-100 hover:text-white hover:border-white/30"
              }`}
            >
              {section.icon && <span className="mr-2">{section.icon}</span>}
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
