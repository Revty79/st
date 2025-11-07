import Link from "next/link";

export default function WorldBuilderCard({
  canWorldBuild,
  role,
}: {
  canWorldBuild: boolean;
  role: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-400/20">
        <div className="h-3 w-3 rounded-full bg-violet-300" />
      </div>
      <h3 className="font-semibold text-lg text-zinc-100">World Builder</h3>
      <p className="mt-1 text-sm text-zinc-300/90">
        Craft worlds, eras, settings, and campaigns.
      </p>
      <div className="mt-4">
        {canWorldBuild ? (
          <Link
            href="/worldbuilder"
            className="btn btn-gold"
          >
            Open Builder
          </Link>
        ) : (
          <div className="grid gap-2">
            <button
              disabled
              className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-300/50 px-4 py-2 font-semibold text-amber-200/80 opacity-60 cursor-not-allowed"
              title={`World building requires role: worldbuilder, developer, privileged, or admin. You are: ${role}`}
            >
              Access Restricted
            </button>
            <Link
              href="/account/upgrade"
              className="btn btn-gold"
            >
              Request Access
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
