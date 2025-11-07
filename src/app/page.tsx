import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-8">
        <h1 className="font-evanescent st-title-gradient st-glow text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight">
          SERRIAN TIDE
        </h1>

        <p className="max-w-xl mx-auto text-lg opacity-90">
          Enter your imagination.
        </p>

        <Link
          href="/start"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold
                     bg-amber-400/90 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300
                     transition shadow-md"
        >
          Enter Your Imagination
        </Link>
      </div>
    </main>
  );
}
