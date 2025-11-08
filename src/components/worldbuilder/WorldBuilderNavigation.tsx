"use client";

import Link from "next/link";

interface WorldBuilderNavigationProps {
  current?: "worlds" | "creatures" | "skillsets" | "races" | "inventory";
}

export default function WorldBuilderNavigation({ current = "worlds" }: WorldBuilderNavigationProps) {
  const items = [
    { href: "/worldbuilder/worlds", key: "worlds", label: "Worlds" },
    { href: "/worldbuilder/creatures", key: "creatures", label: "Creatures" },
    { href: "/worldbuilder/skillsets", key: "skillsets", label: "Skillsets" },
    { href: "/worldbuilder/races", key: "races", label: "Races" },
    { href: "/worldbuilder/inventory", key: "inventory", label: "Inventory" },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = current === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={[
              "rounded-xl px-3 py-1.5 text-sm border",
              active
                ? "border-violet-400/40 text-violet-200 bg-violet-400/10"
                : "border-white/15 text-zinc-200 hover:bg-white/10",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}