import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/session";

type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: "free" | "admin" | "worldbuilder" | "developer" | "privileged";
};

// tiny helper: who can use the builder?
function canWorldBuild(role: string) {
  const r = role.toLowerCase();
  return r === "admin" || r === "worldbuilder" || r === "developer" || r === "privileged";
}

export default async function WorldbuilderDashboard() {
  const user = (await getSessionUser()) as SessionUser | null;
  if (!user) redirect("/login");

  const role = user.role.toLowerCase();

  // hard gate: non-builders get sent to Upgrade
  if (!canWorldBuild(role)) {
    redirect("/account/upgrade?from=worldbuilder");
  }

  return (
    <main className="min-h-screen px-6 py-10">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-evanescent st-title-gradient st-glow text-4xl sm:text-5xl tracking-tight">
            Worldsmith’s&nbsp;Forge
          </h1>
          <p className="mt-1 text-sm text-zinc-300">Build worlds, races, creatures, and inventories.</p>
        </div>

        <Link href="/dashboard" className="btn btn-gold text-sm px-3 py-2">
          ← Back to Dashboard
        </Link>
      </header>

      {/* Cards */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Create Worlds */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/20">
              <div className="h-3 w-3 rounded-full bg-violet-300" />
            </div>
            <h3 className="st-card-title-gradient font-portcullion st-card-title-sm">Create Worlds</h3>
            <p className="mt-1 text-sm text-zinc-300/90">Define timelines, regions, and lore pillars.</p>
            <div className="mt-4">
              <Link href="/worldbuilder/worlds" className="btn btn-gold w-full">
                Create Worlds
              </Link>
            </div>
          </div>

          {/* Create Races */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-400/20">
              <div className="h-3 w-3 rounded-full bg-emerald-300" />
            </div>
            <h3 className="st-card-title-gradient font-portcullion st-card-title-sm">Create Races</h3>
            <p className="mt-1 text-sm text-zinc-300/90">Lineages, traits, affinities, and lore ties.</p>
            <div className="mt-4">
              <Link href="/worldbuilder/races" className="btn btn-gold w-full">
                Create Races
              </Link>
            </div>
          </div>

          {/* Create Creatures */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/20">
              <div className="h-3 w-3 rounded-full bg-blue-300" />
            </div>
            <h3 className="st-card-title-gradient font-portcullion st-card-title-sm">Create Creatures</h3>
            <p className="mt-1 text-sm text-zinc-300/90">Bestiary entries, behaviors, and stat blocks.</p>
            <div className="mt-4">
              <Link href="/worldbuilder/creatures" className="btn btn-gold w-full">
                Create Creatures
              </Link>
            </div>
          </div>

          {/* Create Inventories */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-2xl hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-400/20">
              <div className="h-3 w-3 rounded-full bg-amber-300" />
            </div>
            <h3 className="st-card-title-gradient font-portcullion st-card-title-sm">Create Inventories</h3>
            <p className="mt-1 text-sm text-zinc-300/90">Items, gear sets, crafting, and drops.</p>
            <div className="mt-4">
              <Link href="/worldbuilder/inventory" className="btn btn-gold w-full">
                Create Inventories
              </Link>
            </div>
          </div>

          {/* Create Skill Sets */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-2xl hover:shadow-[0_0_40px_rgba(99,102,241,0.18)] transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-400/20">
              <div className="h-3 w-3 rounded-full bg-indigo-300" />
            </div>
            <h3 className="st-card-title-gradient font-portcullion st-card-title-sm">Create Skill Sets</h3>
            <p className="mt-1 text-sm text-zinc-300/90">Define grouped skills for races, classes, and modules.</p>
            <div className="mt-4">
              <Link href="/worldbuilder/skillsets" className="btn btn-gold w-full">
                Create Skill Sets
              </Link>
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div className="mt-10 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-4 backdrop-blur">
          <p className="text-sm text-zinc-200">
            Access: <span className="font-medium text-amber-200">{role}</span> (World Builder enabled)
          </p>
        </div>
      </section>
    </main>
  );
}
