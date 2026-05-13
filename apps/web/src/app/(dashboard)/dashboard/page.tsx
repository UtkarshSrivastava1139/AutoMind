import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold tracking-tight mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Welcome back 👋
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Continue your automata theory journey
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <QuickActionCard
          href="/simulator"
          icon="◉"
          title="New Automaton"
          description="Create a new DFA or NFA from scratch"
          accentColor="var(--color-primary)"
        />
        <QuickActionCard
          href="/regex"
          icon="⚡"
          title="Regex Converter"
          description="Convert a regular expression to automaton"
          accentColor="var(--color-accent)"
        />
        <QuickActionCard
          href="/quiz"
          icon="✦"
          title="Practice Quiz"
          description="Test your knowledge with interactive quizzes"
          accentColor="var(--color-success)"
        />
      </div>

      {/* Progress Overview */}
      <div className="mb-10">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Your Progress
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Exercises Done" value="0" />
          <StatCard label="Accuracy" value="—" />
          <StatCard label="Current Streak" value="0 days" />
          <StatCard label="XP Earned" value="0" />
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Recent Projects
        </h2>

        {/* Empty State */}
        <div className="glass-card p-12 text-center">
          <div
            className="text-4xl mb-4 opacity-30"
            style={{ color: "var(--color-text-muted)" }}
          >
            ◉
          </div>
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No projects yet
          </p>
          <p
            className="text-xs mb-6"
            style={{ color: "var(--color-text-muted)" }}
          >
            Create your first automaton or try one of our examples
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/simulator"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-150 hover:scale-[1.02]"
              style={{ background: "var(--color-primary)" }}
            >
              Create New DFA
            </Link>
            <button
              className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 glass-card"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Try Example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  accentColor,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  accentColor: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card p-5 group transition-all duration-150 hover:scale-[1.02]"
    >
      <div
        className="text-xl mb-3 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <h3
        className="text-sm font-semibold mb-1"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h3>
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {description}
      </p>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p
        className="text-xl font-semibold font-mono"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
