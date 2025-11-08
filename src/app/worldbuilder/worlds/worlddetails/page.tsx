"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ---- Types with stable ids ----
type UID = string;
type Moon  = { id: UID; name: string; cycle: number | ""; omen: string };
type Month = { id: UID; name: string; days: number | "" };
type Realm = { id: UID; name: string; type: string; traits: string; travel: string; bleed: string };
type Named = { id: UID; value: string };

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const presetGenreTags = ["Fantasy","Sci-Fi","Dieselpunk","Cyberpunk","Weird","Mythic","Pulp","Grim","Heroic","Cosmic"];

// ====== TEMP SOURCE LISTS (replace with API later) ======
const raceOptions     = ["Human","Elf","Dwarf","Orc","Gnome","Halfling","Tiefling","Aasimar","Dragonkin","Construct"];
const creatureOptions = ["Wolf","Goblin","Dragon","Slime","Giant Spider","Undead","Elemental","Harpy","Hydra","Mimic"];

export default function WorldDetailsPage() {
  // ===== Global guards =====
  useEffect(() => {
    if ("scrollRestoration" in history) {
      const prev = history.scrollRestoration;
      history.scrollRestoration = "manual";
      return () => { history.scrollRestoration = prev; };
    }
  }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a[href='#'], a[href='']") as HTMLAnchorElement | null;
      if (a) e.preventDefault();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ===== Basic Info =====
  const [worldName, setWorldName] = useState("");
  const [pitch, setPitch] = useState("");
  const [tags, setTags] = useState<string[]>(["Fantasy"]);
  const [customTag, setCustomTag] = useState("");

  // ===== Astral Bodies =====
  const [sunCount, setSunCount] = useState(1);
  const [moons, setMoons] = useState<Moon[]>([]);

  // ===== Time & Calendar =====
  const [dayHours, setDayHours] = useState<number | "">("");
  const [yearDays, setYearDays] = useState<number | "">("");
  const [months, setMonths] = useState<Month[]>([]);
  const [weekdays, setWeekdays] = useState<Named[]>([]);
  const [leapRule, setLeapRule] = useState("");

  // ===== Planet Profile =====
  const [planetType, setPlanetType] = useState("Terrestrial");
  const [sizeClass, setSizeClass] = useState("");
  const [gravity, setGravity] = useState<number | "">("");
  const [waterPct, setWaterPct] = useState<number | "">("");
  const [climates, setClimates] = useState<string[]>([]);
  const [tectonics, setTectonics] = useState("Medium");

  // ===== Magic Model =====
  const [magicSystems, setMagicSystems] = useState<string[]>([]);
  const [customMagic, setCustomMagic] = useState<string[]>([]); // ← NEW
  const [sourceStatement, setSourceStatement] = useState("");
  const [unbreakables, setUnbreakables] = useState<Named[]>([]);
  const [newRule, setNewRule] = useState("");
  const [corruption, setCorruption] = useState("Moderate");

  // Combined list for save/export (excludes the sentinel "Custom(+name)")
  const effectiveMagicSystems = [
    ...magicSystems.filter((m) => m !== "Custom(+name)"),
    ...customMagic,
  ];

  // ===== Tech Window =====
  const techLevels = ["Stone","Bronze","Iron","Medieval","Renaissance","Industrial","Diesel","Atomic","Digital","Cyber","Interstellar"];
  const [techFrom, setTechFrom] = useState("Iron");
  const [techTo, setTechTo] = useState("Industrial");
  const [bans, setBans] = useState<Named[]>([]);

  // ===== Tone & Canon =====
  const [worldTruths, setWorldTruths] = useState<Named[]>([]);
  const [truthDraft, setTruthDraft] = useState("");
  const toneFlagsAll = ["Heroic","Grim","Pulp","Mythic","Weird","Cosmic"];
  const [toneFlags, setToneFlags] = useState<string[]>(["Heroic"]);

  // ===== Cosmology & Realms =====
  const [realms, setRealms] = useState<Realm[]>([]);
  const [playerSafeSummaryOn, setPlayerSafeSummaryOn] = useState(true);

  // ===== Master Catalogs =====
  const [races, setRaces] = useState<string[]>([]);
  const [creatures, setCreatures] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [deities, setDeities] = useState<string[]>([]);
  const [factions, setFactions] = useState<string[]>([]);

  // ===== Refs =====
  const eWeekRef = useRef<HTMLInputElement>(null);

  // ===== Utilities =====
  const addChip = (list: string[], setList: (v: string[]) => void, value: string) => {
    const v = value.trim();
    if (!v || list.includes(v)) return;
    setList([...list, v]);
  };
  const removeChip = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.filter((t) => t !== value));
  const moveIndex = <T,>(arr: T[], from: number, to: number) => {
    if (from === to) return arr;
    const c = [...arr];
    const [it] = c.splice(from, 1);
    c.splice(to, 0, it);
    return c;
  };

  // ===== UI atoms =====
  const Section = ({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-5 md:p-6 backdrop-blur-sm shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-300 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-white/15 bg-black/30 p-4">
      <h3 className="font-semibold mb-3 text-zinc-100">{title}</h3>
      {children}
    </div>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      autoComplete="off"
      className={`w/full rounded-lg bg-white/10 text-zinc-100 placeholder:text-zinc-400 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${props.className || ""}`}
    />
  );

  const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      {...props}
      autoComplete="off"
      className={`w/full rounded-lg bg-white/10 text-zinc-100 placeholder:text-zinc-400 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${props.className || ""}`}
    />
  );

  // --- BetterSelect: dark dropdowns that are readable ---
  const BetterSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
      <select
        {...props}
        className={`w/full appearance-none rounded-lg bg-[#0b0b0f] text-zinc-100 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 pr-9 ${props.className || ""}`}
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300">▾</span>
    </div>
  );

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="min-h-screen px-4 md:px-8 py-8 space-y-6 max-w-6xl mx-auto"
      style={{ overflowAnchor: "none" as any }}
    >
      {/* GLOBAL dark dropdown fix */}
      <DarkSelectStyles />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">World Details</h1>
          <p className="text-zinc-300 text-sm">
            World = non-negotiable rules + master catalogs. Era/Setting choose subsets; they can’t invent new items.
          </p>
        </div>
        <Link
          href="/worldbuilder/worlds"
          scroll={false}
          prefetch={false}
          className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          ← Back to Worlds
        </Link>
      </header>

      {/* BASIC INFO */}
      <Section
        title="1) Basic Info — Player-Facing"
        subtitle="World base currency is fixed at 1 Credit (no denominations here). Slug will be auto-derived from name later."
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="World Name">
            <Input
              placeholder="2–60 chars (unique)"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value.slice(0, 60))}
            />
            <p className="text-xs text-zinc-400 mt-2">Appears in UI, exports, and links.</p>
          </Card>

          <Card title="Short Pitch">
            <Textarea
              rows={3}
              maxLength={200}
              placeholder="1–2 sentences, ≤200 chars"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
            />
            <div className="text-xs text-zinc-400 mt-2">{pitch.length}/200</div>
          </Card>
        </div>

        <Card title="Genre / Tone Tags">
          <div className="flex flex-wrap gap-2 mb-3">
            {presetGenreTags.map((t) => (
              <button
                key={t}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addChip(tags, setTags, t)}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm hover:bg-white/15"
              >
                + {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Input
              placeholder="Add custom tag"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChip(tags, setTags, customTag);
                  setCustomTag("");
                }
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { addChip(tags, setTags, customTag); setCustomTag(""); }}
              className="rounded-lg border border-amber-300/60 bg-amber-400/90 text-black px-4 py-2 text-sm hover:bg-amber-300"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => <Chip key={t} label={t} onRemove={() => removeChip(tags, setTags, t)} />)}
          </div>
        </Card>
      </Section>

      {/* ASTRAL BODIES */}
      <Section title="2) Astral Bodies — Player summary; G.O.D details">
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Suns (count)">
            <div className="flex items-center gap-2">
              <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setSunCount(Math.max(0, sunCount - 1))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">−</button>
              <div className="min-w-10 text-center text-zinc-100">{sunCount}</div>
              <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setSunCount(Math.min(5, sunCount + 1))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">＋</button>
            </div>
            <p className="text-xs text-zinc-400 mt-2">0–5 (usually 1)</p>
          </Card>

          <div className="md:col-span-2">
            <Card title="Moons">
              <button
                type="button"
                onMouseDown={(e)=>e.preventDefault()}
                onClick={() => setMoons([...moons, { id: uid(), name: "", cycle: "", omen: "" }])}
                className="mb-3 rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15 text-sm"
              >
                + Add Moon
              </button>
              <div className="space-y-3">
                {moons.map((m, i) => (
                  <div key={m.id} className="grid md:grid-cols-4 gap-2">
                    <Input placeholder="Name ≤40" value={m.name} onChange={(e) => setMoons(moons.map(x => x.id===m.id ? { ...m, name: e.target.value.slice(0,40) } : x))} />
                    <NumberInput placeholder="Cycle (days) 1–999" min={1} max={999}
                      value={m.cycle} onCommit={(val) => setMoons(moons.map(x => x.id===m.id ? { ...m, cycle: val } : x))} />
                    <Input placeholder="Omen ≤120 (optional)" value={m.omen} onChange={(e) => setMoons(moons.map(x => x.id===m.id ? { ...m, omen: e.target.value.slice(0,120) } : x))} />
                    <div className="flex items-center gap-2">
                      <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setMoons(moveIndex(moons, i, Math.max(0, i-1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↑</button>
                      <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setMoons(moveIndex(moons, i, Math.min(moons.length-1, i+1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↓</button>
                      <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setMoons(moons.filter(x => x.id !== m.id))} className="px-3 py-1 rounded border border-red-500/40 text-red-300 hover:bg-red-500/20">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* TIME & CALENDAR */}
      <Section title="3) Time & Calendar — Player-Facing" subtitle="Reorder months/weekdays with ↑/↓.">
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Global Clock">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput placeholder="Length of Day (hours)" step="0.1" min={1} max={100}
                value={dayHours} onCommit={(v)=>setDayHours(v)} />
              <NumberInput placeholder="Length of Year (days)" min={30} max={1000}
                value={yearDays} onCommit={(v)=>setYearDays(v)} />
            </div>
          </Card>

          <Card title="Leap Rule (optional)">
            <Textarea rows={3} placeholder="Example: Every 6 years add 1 day at year’s end."
              value={leapRule} onChange={(e) => setLeapRule(e.target.value.slice(0, 280))} />
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Months (ordered list)">
            <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setMonths([...months, { id: uid(), name: "", days: "" }])}
              className="mb-3 rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15 text-sm">+ Add Month</button>
            <div className="space-y-2">
              {months.map((m, i) => (
                <div key={m.id} className="grid grid-cols-[1fr_140px_auto] gap-2">
                  <Input placeholder="Name ≤30" value={m.name} onChange={(e) => setMonths(months.map(x => x.id===m.id ? { ...m, name: e.target.value.slice(0,30) } : x))} />
                  <NumberInput placeholder="Days 1–60" min={1} max={60}
                    value={m.days} onCommit={(val)=>setMonths(months.map(x=>x.id===m.id?{...m,days:val}:x))}/>
                  <div className="flex items-center gap-2">
                    <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setMonths(moveIndex(months, i, Math.max(0, i - 1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↑</button>
                    <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setMonths(moveIndex(months, i, Math.min(months.length - 1, i + 1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↓</button>
                    <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setMonths(months.filter(x => x.id !== m.id))} className="px-3 py-1 rounded border border-red-500/40 text-red-300 hover:bg-red-500/20">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Weekdays (ordered list, 2–14)">
            <div className="flex gap-2 mb-2">
              <input
                ref={eWeekRef}
                placeholder="Add weekday name"
                className="w-full rounded-lg bg-white/10 text-zinc-100 placeholder:text-zinc-400 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                onKeyDown={(e) => {
                  const t = e.target as HTMLInputElement;
                  if (e.key === "Enter" && t.value.trim()) {
                    e.preventDefault();
                    setWeekdays([...weekdays, { id: uid(), value: t.value.trim().slice(0, 20) }]);
                    t.value = "";
                  }
                }}
              />
              <button
                type="button"
                onMouseDown={(e)=>e.preventDefault()}
                onClick={() => {
                  const el = eWeekRef.current;
                  const v = el?.value.trim();
                  if (v) { setWeekdays([...weekdays, { id: uid(), value: v.slice(0,20) }]); if (el) el.value = ""; }
                }}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15 text-sm"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {weekdays.map((w, i) => (
                <div key={w.id} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-zinc-400">{i + 1}.</span>
                  <span className="flex-1 text-zinc-100">{w.value}</span>
                  <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setWeekdays(moveIndex(weekdays, i, Math.max(0, i - 1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↑</button>
                  <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setWeekdays(moveIndex(weekdays, i, Math.min(weekdays.length - 1, i + 1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↓</button>
                  <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setWeekdays(weekdays.filter(x => x.id !== w.id))} className="px-3 py-1 rounded border border-red-500/40 text-red-300 hover:bg-red-500/20">Delete</button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Preview Calendar (UI-only stub)">
          <p className="text-sm text-zinc-300">A future preview widget can render a sample month/week once we lock data.</p>
        </Card>
      </Section>

      {/* PLANET PROFILE */}
      <Section title="4) Planet Profile — Player summary; details collapsed">
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Type">
            <BetterSelect value={planetType} onChange={(e) => setPlanetType(e.target.value)}>
              {["Terrestrial","Oceanic","Tidally Locked","Ringworld","Custom"].map((t) => <option key={t} value={t}>{t}</option>)}
            </BetterSelect>
            {planetType === "Custom" && <Input placeholder="Custom note" value={sizeClass} onChange={(e) => setSizeClass(e.target.value)} className="mt-2" />}
          </Card>

          <Card title="Size / Class">
            <Input placeholder='e.g., "Earth-like", "Radius ~6,400 km"' value={sizeClass} onChange={(e) => setSizeClass(e.target.value)} />
          </Card>

          <Card title="Gravity vs Earth (0.1–5.0)">
            <NumberInput step="0.1" min={0.1} max={5}
              value={gravity} onCommit={(v)=>setGravity(v)} />
          </Card>

          <Card title="Water Coverage % (0–100)">
            <NumberInput min={0} max={100}
              value={waterPct} onCommit={(v)=>setWaterPct(v)} />
          </Card>

          <Card title="Climate Bands">
            <TagEditor list={climates} setList={setClimates} placeholder="Add climate band (e.g., Temperate)"/>
          </Card>

          <Card title="Tectonic Activity">
            <BetterSelect value={tectonics} onChange={(e) => setTectonics(e.target.value)}>
              {["None","Low","Medium","High"].map((t) => <option key={t}>{t}</option>)}
            </BetterSelect>
          </Card>
        </div>
      </Section>

      {/* MAGIC MODEL */}
      <Section title="5) Magic Model (Global Rules) — Player summary + G.O.D rules">
        <Card title="Allowed Systems (master list)">
          <CheckboxGrid
            options={["Spellcraft","Talisman-making","Faith-based miracles","Psionics","Bardic arts","Custom(+name)"]}
            values={magicSystems}
            onToggle={(v) => {
              setMagicSystems(magicSystems.includes(v) ? magicSystems.filter(x => x !== v) : [...magicSystems, v]);
            }}
          />
        </Card>

        {/* NEW: custom names when Custom(+name) is checked */}
        {magicSystems.includes("Custom(+name)") && (
          <Card title="Custom Systems">
            <TagEditor
              list={customMagic}
              setList={setCustomMagic}
              placeholder="Add custom magic system (e.g., Rune-Weaving)"
            />
            <p className="text-xs text-zinc-400 mt-2">
              These will be combined with checked built-ins on save/export.
            </p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card title="Source Statement (≤240)">
            <Textarea rows={3} maxLength={240} value={sourceStatement} onChange={(e) => setSourceStatement(e.target.value)} />
            <div className="text-xs text-zinc-400 mt-1">{sourceStatement.length}/240</div>
          </Card>

          <Card title="Cost / Corruption Level">
            <BetterSelect value={corruption} onChange={(e) => setCorruption(e.target.value)}>
              {["None","Mild","Moderate","Severe","Custom"].map((t) => <option key={t}>{t}</option>)}
            </BetterSelect>
            {corruption === "Custom" && <Input placeholder="Custom note" className="mt-2" />}
          </Card>
        </div>

        <Card title="Unbreakable Rules (0–10 bullets)">
          <div className="flex gap-2 mb-2">
            <Input placeholder="Add rule ≤120 chars" value={newRule}
              onChange={(e) => setNewRule(e.target.value.slice(0,120))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newRule.trim()) {
                  e.preventDefault();
                  setUnbreakables([...unbreakables, { id: uid(), value: newRule.trim() }]);
                  setNewRule("");
                }
              }} />
            <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => { if (newRule.trim()) { setUnbreakables([...unbreakables, { id: uid(), value: newRule.trim() }]); setNewRule(""); } }}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15 text-sm">Add</button>
          </div>
          <ul className="space-y-1 list-disc pl-5">
            {unbreakables.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="flex-1 text-zinc-100">{r.value}</span>
                <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setUnbreakables(unbreakables.filter(x => x.id !== r.id))}
                  className="px-2 py-0.5 rounded border border-red-500/40 text-red-300 text-xs hover:bg-red-500/20">Delete</button>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      {/* TECH WINDOW */}
      <Section title="6) Technology Window (Global Bounds) — Player-Facing">
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Overall Tech Window (From → To)">
            <div className="grid grid-cols-2 gap-2">
              <BetterSelect value={techFrom} onChange={(e) => setTechFrom(e.target.value)}>
                {techLevels.map(l => <option key={l}>{l}</option>)}
              </BetterSelect>
              <BetterSelect value={techTo} onChange={(e) => setTechTo(e.target.value)}>
                {techLevels.map(l => <option key={l}>{l}</option>)}
              </BetterSelect>
            </div>
            {techLevels.indexOf(techFrom) > techLevels.indexOf(techTo) && (
              <p className="text-xs text-red-300 mt-2">From must be ≤ To</p>
            )}
          </Card>

          <Card title='Ban List (“Does Not Exist”)'>
            <TagEditorObj list={bans} setList={setBans} placeholder="Add ban (e.g., Time Travel, FTL, True AI, Guns)"/>
          </Card>
        </div>
      </Section>

      {/* TONE & CANON */}
      <Section title="7) Tone & Canon — Player-Facing">
        <Card title="Tone Flags">
          <CheckboxGrid
            options={toneFlagsAll}
            values={toneFlags}
            onToggle={(v) => {
              setToneFlags(toneFlags.includes(v) ? toneFlags.filter(x => x !== v) : [...toneFlags, v]);
            }}
          />
        </Card>
      </Section>

      {/* COSMOLOGY */}
      <Section title="8) Cosmology & Realms — G.O.D (with player-safe summary toggle)">
        <div className="flex items-center gap-3 mb-3">
          <Toggle checked={playerSafeSummaryOn} onChange={setPlayerSafeSummaryOn} label="Export player-safe summary" />
        </div>
        <Card title="Realm Map">
          <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setRealms([...realms, { id: uid(), name:"", type:"", traits:"", travel:"", bleed:"" }])}
            className="mb-3 rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15 text-sm">+ Add Realm</button>
          <div className="space-y-3">
            {realms.map((r, i) => (
              <div key={r.id} className="grid md:grid-cols-5 gap-2">
                <Input placeholder="Name" value={r.name} onChange={(e)=>setRealms(realms.map(x=>x.id===r.id?{...r,name:e.target.value.slice(0,40)}:x))}/>
                <Input placeholder="Type (e.g., Astral Sea)" value={r.type} onChange={(e)=>setRealms(realms.map(x=>x.id===r.id?{...r,type:e.target.value.slice(0,40)}:x))}/>
                <Input placeholder="Traits (short)" value={r.traits} onChange={(e)=>setRealms(realms.map(x=>x.id===r.id?{...r,traits:e.target.value.slice(0,80)}:x))}/>
                <Input placeholder="Travel rules" value={r.travel} onChange={(e)=>setRealms(realms.map(x=>x.id===r.id?{...r,travel:e.target.value.slice(0,80)}:x))}/>
                <Input placeholder="Bleed-through" value={r.bleed} onChange={(e)=>setRealms(realms.map(x=>x.id===r.id?{...r,bleed:e.target.value.slice(0,80)}:x))}/>
                <div className="md:col-span-5 flex gap-2 justify-end">
                  <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setRealms(moveIndex(realms, i, Math.max(0, i-1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↑</button>
                  <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setRealms(moveIndex(realms, i, Math.min(realms.length-1, i+1)))} className="px-3 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/15">↓</button>
                  <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setRealms(realms.filter(x => x.id !== r.id))} className="px-3 py-1 rounded border border-red-500/40 text-red-300 hover:bg-red-500/20">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* MASTER CATALOGS */}
      <Section title="9) Master Catalogs — Choose from existing DB (no new adds here)">
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Races (choose from DB)">
            <MultiPicker
              source={raceOptions}             // TODO: replace with data from /api/races
              values={races}
              onChange={setRaces}
              placeholder="Search races…"
              emptyLabel="No races match"
            />
          </Card>
          <Card title="Creatures (choose from DB)">
            <MultiPicker
              source={creatureOptions}         // TODO: replace with data from /api/creatures
              values={creatures}
              onChange={setCreatures}
              placeholder="Search creatures…"
              emptyLabel="No creatures match"
            />
          </Card>
          <Card title="Languages (free list)">
            <TagEditor list={languages} setList={setLanguages} placeholder="Add language"/>
          </Card>
          <Card title="Deities (free list)">
            <TagEditor list={deities} setList={setDeities} placeholder="Add deity"/>
          </Card>
          <Card title="Factions (free list)">
            <TagEditor list={factions} setList={setFactions} placeholder="Add faction"/>
          </Card>
        </div>
      </Section>

      {/* FOOTER ACTIONS */}
      <div className="sticky bottom-4 flex gap-3 justify-end">
        <button type="button" className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 hover:bg-white/15">Save (disabled)</button>
        <button type="button" className="rounded-lg border border-amber-300/60 bg-amber-400/90 text-black px-4 py-2 hover:bg-amber-300">Export Player Handout (stub)</button>
      </div>
    </form>
  );
}

/* ===== NumberInput: free typing, commit on blur/Enter, clamps ===== */
function NumberInput({
  value,
  onCommit,
  min,
  max,
  step,
  placeholder,
}: {
  value: number | "";
  onCommit: (v: number | "") => void;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState<string>(value === "" ? "" : String(value));
  useEffect(() => { const nv = value === "" ? "" : String(value); if (nv !== raw) setRaw(nv); }, [value]); // sync from parent

  const commit = () => {
    const s = raw.trim();
    if (s === "") { onCommit(""); return; }
    const n = Number(s);
    if (Number.isNaN(n)) { onCommit(""); return; }
    const clamped = clamp(n, min, max);
    onCommit(clamped);
    setRaw(String(clamped));
  };

  return (
    <input
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
      className="w-full rounded-lg bg-white/10 text-zinc-100 placeholder:text-zinc-400 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
    />
  );

  function clamp(n: number, min?: number, max?: number) {
    if (typeof min === "number") n = Math.max(min, n);
    if (typeof max === "number") n = Math.min(max, n);
    return n;
  }
}

/* ===== MultiPicker: searchable, chip-based from a fixed source list ===== */
function MultiPicker({
  source,
  values,
  onChange,
  placeholder,
  emptyLabel = "No matches",
}: {
  source: string[];
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = source
    .filter(s => s.toLowerCase().includes(q.toLowerCase()))
    .filter(s => !values.includes(s))
    .slice(0, 50);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map(v => (
          <span key={v} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm text-zinc-100">
            {v}
            <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => onChange(values.filter(x => x !== v))} className="opacity-80 hover:opacity-100">✕</button>
          </span>
        ))}
      </div>

      <input
        value={q}
        onChange={(e)=>{ setQ(e.target.value); setOpen(true); }}
        onFocus={()=>setOpen(true)}
        onBlur={() => setTimeout(()=>setOpen(false), 120)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-white/10 text-zinc-100 placeholder:text-zinc-400 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-white/15 bg-[#0b0b0f] shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-400">{emptyLabel}</div>
          ) : filtered.map(item => (
            <button
              key={item}
              type="button"
              onMouseDown={(e)=>e.preventDefault()}
              onClick={() => { onChange([...values, item]); setQ(""); }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10 text-zinc-100"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Global style to force readable dark dropdowns (native <select>) ===== */
function DarkSelectStyles() {
  return (
    <style jsx global>{`
      select {
        color: #e5e7eb;        /* zinc-200 */
        background-color: #0b0b0f; /* deep dark */
      }
      select:focus {
        outline: none;
      }
      /* Options popup colors (most modern browsers honor this) */
      select option {
        color: #e5e7eb;
        background-color: #0b0b0f;
      }
      /* Increase stacking so the popup isn't hidden by sticky footers */
      select { position: relative; z-index: 10; }
    `}</style>
  );
}

/** ————— Small reusables ————— */

function CheckboxGrid({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {options.map((o) => (
        <label key={o} className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-zinc-100">
          <input type="checkbox" checked={values.includes(o)} onChange={() => onToggle(o)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

/* ===== Chip (used by tags) ===== */
function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm text-zinc-100">
      {label}
      {onRemove && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRemove}
          className="opacity-80 hover:opacity-100"
          aria-label={`Remove ${label}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}

/* ===== Toggle (used in Cosmology header) ===== */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-zinc-100 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span>{label}</span>
    </label>
  );
}

function TagEditor({ list, setList, placeholder }: { list: string[]; setList: (v: string[]) => void; placeholder: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (v: string) => {
    const x = v.trim();
    if (!x || list.includes(x)) return;
    setList([...list, x]);
  };
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          ref={inputRef}
          placeholder={placeholder}
          className="w-full rounded-lg bg-white/10 text-zinc-100 placeholder:text-zinc-400 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
          onKeyDown={(e) => {
            const t = e.target as HTMLInputElement;
            if (e.key === "Enter") { e.preventDefault(); add(t.value); t.value = ""; }
          }}
        />
        <button
          type="button"
          onMouseDown={(e)=>e.preventDefault()}
          onClick={() => {
            const el = inputRef.current;
            if (el && el.value.trim()) { add(el.value); el.value = ""; }
          }}
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15 text-sm"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((v) => (
          <span key={v} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm text-zinc-100">
            {v}
            <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setList(list.filter((x) => x !== v))} className="opacity-80 hover:opacity-100">✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

// Tag editor for Named[] (objects with id/value)
function TagEditorObj({ list, setList, placeholder }: { list: {id: UID; value: string}[]; setList: (v: {id: UID; value: string}[]) => void; placeholder: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (v: string) => {
    const x = v.trim();
    if (!x) return;
    if (list.some(item => item.value === x)) return;
    setList([...list, { id: uid(), value: x }]);
  };
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          ref={inputRef}
          placeholder={placeholder}
          className="w-full rounded-lg bg-white/10 text-zinc-100 placeholder:text-zinc-400 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
          onKeyDown={(e) => {
            const t = e.target as HTMLInputElement;
            if (e.key === "Enter") { e.preventDefault(); add(t.value); t.value = ""; }
          }}
        />
        <button
          type="button"
          onMouseDown={(e)=>e.preventDefault()}
          onClick={() => {
            const el = inputRef.current;
            if (el && el.value.trim()) { add(el.value); el.value = ""; }
          }}
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15 text-sm"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((it) => (
          <span key={it.id} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm text-zinc-100">
            {it.value}
            <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={() => setList(list.filter((x) => x.id !== it.id))} className="opacity-80 hover:opacity-100">✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}
