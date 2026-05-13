import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-app)" }}>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: "transparent" }}>
            <Image src="/logo.png" alt="AutoMind Logo" width={32} height={32} />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            AutoMind
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-150"
            style={{ background: "var(--color-primary)" }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 glass-card" style={{ color: "var(--color-accent-light)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--color-success)" }} />
            Interactive Automata Learning Platform
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6" style={{ color: "var(--color-text-primary)" }}>
            Automata Theory,{" "}
            <span style={{ color: "var(--color-primary-light)" }}>
              Made Visual
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Build DFAs and NFAs visually, simulate strings step-by-step,
            convert regex with inspectable algorithms, and practice with
            AI-powered explanations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 text-base font-semibold text-white rounded-xl transition-all duration-150 hover:scale-105"
              style={{ background: "var(--color-primary)" }}
            >
              Start Learning — It&apos;s Free
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-base font-medium rounded-xl transition-all duration-150 glass-card"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Explore Dashboard →
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-3xl mx-auto">
            <FeatureCard
              icon="◉"
              title="Visual Builder"
              description="Drag-and-drop DFA/NFA construction with real-time validation"
            />
            <FeatureCard
              icon="▶"
              title="Step Simulation"
              description="Walk through string acceptance with animated state traversal"
            />
            <FeatureCard
              icon="⚡"
              title="Smart Conversion"
              description="Regex → NFA → DFA with algorithm step inspection"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
        Built for CS students, by students. AutoMind © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6 text-left transition-all duration-150">
      <div
        className="text-2xl mb-3 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--color-primary-light)" }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {description}
      </p>
    </div>
  );
}
