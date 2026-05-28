"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Code,
  Flame,
  Trophy,
  Target,
  Cpu,
  Layers,
  Send,
  ExternalLink,
  BookOpen,
  Brain,
  Sliders,
  Users,
  GraduationCap,
  Star,
  ChevronRight,
  Quote,
  Zap,
  Play,
} from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

// ========================================================
// MOCK DATA & TYPES
// ========================================================

interface MockData {
  title: string;
  states: Array<{
    id: string;
    x: number;
    y: number;
    isStart?: boolean;
    isAccept?: boolean;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label: string;
    isLoop?: boolean;
    curve?: number;
  }>;
}

const QSOLVER_MOCKS: Record<string, MockData> = {
  nfa: {
    title: "(a|b)*abb",
    states: [
      { id: "q0", x: 60, y: 100, isStart: true, isAccept: false },
      { id: "q1", x: 180, y: 100, isStart: false, isAccept: false },
      { id: "q2", x: 300, y: 100, isStart: false, isAccept: false },
      { id: "q3", x: 420, y: 100, isStart: false, isAccept: true },
    ],
    edges: [
      { from: "q0", to: "q0", label: "a, b", isLoop: true },
      { from: "q0", to: "q1", label: "a" },
      { from: "q1", to: "q2", label: "b" },
      { from: "q2", to: "q3", label: "b" },
    ],
  },
  even0s: {
    title: "Even number of 0s",
    states: [
      { id: "S0", x: 150, y: 100, isStart: true, isAccept: true },
      { id: "S1", x: 330, y: 100, isStart: false, isAccept: false },
    ],
    edges: [
      { from: "S0", to: "S0", label: "1", isLoop: true },
      { from: "S1", to: "S1", label: "1", isLoop: true },
      { from: "S0", to: "S1", label: "0", curve: 30 },
      { from: "S1", to: "S0", label: "0", curve: 30 },
    ],
  },
  atMostTwo: {
    title: "At most two a's",
    states: [
      { id: "q0", x: 80, y: 100, isStart: true, isAccept: true },
      { id: "q1", x: 200, y: 100, isStart: false, isAccept: true },
      { id: "q2", x: 320, y: 100, isStart: false, isAccept: true },
      { id: "q3", x: 440, y: 100, isStart: false, isAccept: false },
    ],
    edges: [
      { from: "q0", to: "q0", label: "b", isLoop: true },
      { from: "q1", to: "q1", label: "b", isLoop: true },
      { from: "q2", to: "q2", label: "b", isLoop: true },
      { from: "q3", to: "q3", label: "a, b", isLoop: true },
      { from: "q0", to: "q1", label: "a" },
      { from: "q1", to: "q2", label: "a" },
      { from: "q2", to: "q3", label: "a" },
    ],
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background texture */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden bg-indigo-500/10 border border-indigo-500/20 shadow-glow-primary">
            <Image
              src="/logo.png"
              alt="AutoMind Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-display font-bold tracking-tight text-white">
            AutoMind
          </span>
        </div>
        <div className="flex items-center gap-5">
          {/* Sign In temporarily hidden as auth is not established yet
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          */}
          <Link
            href="/dashboard"
            className="px-4 py-2 text-xs font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 hover:border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* SECTION 1: HERO — Empathy + Live Demo */}
      <ScrollReveal direction="none" duration={1000}>
        <HeroSection />
      </ScrollReveal>

      {/* SECTION 2: QSOLVER SHOWCASE — The Star Feature */}
      <ScrollReveal direction="up" delay={50} duration={800}>
        <QSolverSection />
      </ScrollReveal>

      {/* SECTION 3: FEATURE TRIPTYCH — Simulator, Regex, AI Tutor */}
      <ScrollReveal direction="up" delay={50} duration={800}>
        <FeatureTriptychSection />
      </ScrollReveal>

      {/* SECTION 4: SOCIAL PROOF — Trust Signals */}
      <ScrollReveal direction="up" delay={50} duration={800}>
        <SocialProofSection />
      </ScrollReveal>

      {/* SECTION 5: GAMIFICATION PREVIEW */}
      <ScrollReveal direction="up" delay={50} duration={800}>
        <GamificationSection />
      </ScrollReveal>

      {/* SECTION 6: FINAL CTA + FOOTER */}
      <ScrollReveal direction="none" duration={1000}>
        <FinalCTASection />
      </ScrollReveal>
    </div>
  );
}

// ========================================================
// SECTION 1: HERO
// ========================================================

function HeroSection() {
  const [typedText, setTypedText] = useState("");
  const [simulationState, setSimulationState] = useState<
    "idle" | "typing" | "parsing" | "verified" | "simulating"
  >("idle");
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeEdgeIndex, setActiveEdgeIndex] = useState<number | null>(null);
  const [simString, setSimString] = useState("1101");
  const [simCharIndex, setSimCharIndex] = useState(-1);
  const [simResult, setSimResult] = useState<"none" | "accept" | "reject">(
    "none"
  );

  const fullPrompt = "Construct DFA accepting strings ending with 101";

  useEffect(() => {
    let active = true;

    const runFlow = async () => {
      while (active) {
        // Idle
        setSimulationState("idle");
        setTypedText("");
        setActiveNode(null);
        setActiveEdgeIndex(null);
        setSimCharIndex(-1);
        setSimResult("none");
        await new Promise((r) => setTimeout(r, 1500));
        if (!active) break;

        // Typing
        setSimulationState("typing");
        for (let i = 0; i <= fullPrompt.length; i++) {
          setTypedText(fullPrompt.slice(0, i));
          await new Promise((r) => setTimeout(r, 40));
          if (!active) break;
        }
        await new Promise((r) => setTimeout(r, 800));
        if (!active) break;

        // Parsing
        setSimulationState("parsing");
        await new Promise((r) => setTimeout(r, 2000));
        if (!active) break;

        // Verified
        setSimulationState("verified");
        await new Promise((r) => setTimeout(r, 1200));
        if (!active) break;

        // Simulating string 1101
        setSimulationState("simulating");
        setSimString("1101");
        setSimCharIndex(-1);
        setSimResult("none");
        await new Promise((r) => setTimeout(r, 800));

        const path = [
          { node: "q0", edge: null },
          { node: "q1", edge: 1 },
          { node: "q1", edge: 0 },
          { node: "q2", edge: 2 },
          { node: "q3", edge: 3 },
        ];

        for (let i = 0; i < path.length; i++) {
          if (i > 0) {
            setActiveEdgeIndex(path[i].edge);
            await new Promise((r) => setTimeout(r, 400));
          }
          setActiveNode(path[i].node);
          setSimCharIndex(i - 1);
          setActiveEdgeIndex(null);
          await new Promise((r) => setTimeout(r, 800));
          if (!active) break;
        }

        setSimResult("accept");
        await new Promise((r) => setTimeout(r, 2000));
        if (!active) break;

        // Run string 100
        setSimString("100");
        setSimCharIndex(-1);
        setSimResult("none");
        setActiveNode(null);
        await new Promise((r) => setTimeout(r, 800));

        const path2 = [
          { node: "q0", edge: null },
          { node: "q1", edge: 1 },
          { node: "q2", edge: 2 },
          { node: "q0", edge: 4 },
        ];

        for (let i = 0; i < path2.length; i++) {
          if (i > 0) {
            setActiveEdgeIndex(path2[i].edge);
            await new Promise((r) => setTimeout(r, 400));
          }
          setActiveNode(path2[i].node);
          setSimCharIndex(i - 1);
          setActiveEdgeIndex(null);
          await new Promise((r) => setTimeout(r, 800));
          if (!active) break;
        }

        setSimResult("reject");
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    runFlow();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        {/* Left: Empathy-first copy */}
        <div className="lg:col-span-6 space-y-8 text-left">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Users size={12} />
            Built by a student. Trusted by students.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.08]">
            Stuck on an
            <br />
            automata question?
            <br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Just type it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg">
            AutoMind is the first AI workspace built for Theory of Computation.
            Enter questions in plain English, get verified automata solutions
            with visual simulations and step-by-step explanations.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/question-solver"
              className="group px-7 py-3.5 font-semibold text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-200 flex items-center gap-2"
            >
              Try QSolver Free
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <Link
              href="/simulator"
              className="px-7 py-3.5 font-semibold text-sm rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              Open Simulator
            </Link>
          </div>

          {/* Feature micro-badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {[
              "AI-powered solutions",
              "Step-by-step proofs",
              "Visual simulations",
            ].map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"
              >
                <CheckCircle2 size={12} className="text-emerald-500" />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Live QSolver demo */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-xl aspect-[1.25] rounded-2xl bg-slate-950/70 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px]" />

            {/* Window bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-slate-950/90 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="text-[11px] font-mono text-slate-500 ml-2">
                  qsolver
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                Live
              </span>
            </div>

            {/* Query box */}
            <div className="p-4 relative z-10">
              <div className="w-full flex items-center justify-between bg-slate-900 border border-white/5 rounded-xl px-4 py-3 min-h-[46px]">
                <div className="flex items-center gap-2 font-mono text-xs text-indigo-300">
                  <span className="text-slate-500 select-none">&gt;</span>
                  <span>{typedText}</span>
                  <span className="w-1.5 h-4 bg-indigo-400 animate-pulse" />
                </div>
                <div className="w-48 shrink-0 flex justify-end items-center text-right font-mono">
                  {simulationState === "parsing" && (
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                      <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  )}
                  {simulationState === "verified" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  )}
                  {simulationState === "simulating" && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-white/5">
                        {simString.split("").map((c, i) => (
                          <span
                            key={i}
                            className={`px-0.5 rounded transition-all duration-200 ${i === simCharIndex
                              ? "bg-indigo-500 text-white font-bold scale-110"
                              : "text-slate-400"
                              }`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      {simResult === "accept" && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ACCEPT
                        </span>
                      )}
                      {simResult === "reject" && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          REJECT
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="absolute inset-x-0 bottom-0 top-[110px] flex items-center justify-center">
              {simulationState === "idle" || simulationState === "typing" ? (
                <div className="text-center space-y-2 opacity-40">
                  <Cpu
                    size={32}
                    className="mx-auto text-indigo-400/80 animate-pulse"
                  />
                  <p className="text-xs font-mono text-slate-400">
                    Waiting for query...
                  </p>
                </div>
              ) : simulationState === "parsing" ? (
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 animate-bounce">
                    <Sparkles size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-slate-300">
                      Generating State Machine...
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Checking for minimal states
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative p-4 flex items-center justify-center">
                  <svg
                    className="w-full h-full max-h-[220px]"
                    viewBox="0 0 520 200"
                  >
                    <defs>
                      <marker
                        id="arrow-hero"
                        markerWidth="8"
                        markerHeight="8"
                        refX="18"
                        refY="4"
                        orient="auto"
                      >
                        <polygon points="0 0, 8 4, 0 8" fill="#475569" />
                      </marker>
                      <marker
                        id="arrow-hero-active"
                        markerWidth="8"
                        markerHeight="8"
                        refX="18"
                        refY="4"
                        orient="auto"
                      >
                        <polygon points="0 0, 8 4, 0 8" fill="#6366F1" />
                      </marker>
                    </defs>

                    {/* Start Arrow */}
                    <path
                      d="M 20 100 L 50 100"
                      stroke="#475569"
                      strokeWidth="2"
                      markerEnd="url(#arrow-hero)"
                    />

                    {/* Edge 0: q1 self loop '1' */}
                    <path
                      d="M 180 80 A 18 18 0 1 1 200 80"
                      fill="none"
                      stroke={
                        activeEdgeIndex === 0 ? "#6366F1" : "#475569"
                      }
                      strokeWidth={activeEdgeIndex === 0 ? "2.5" : "1.5"}
                      className="transition-colors duration-200"
                      markerEnd={
                        activeEdgeIndex === 0
                          ? "url(#arrow-hero-active)"
                          : "url(#arrow-hero)"
                      }
                    />
                    <text
                      x="190"
                      y="45"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94A3B8"
                      fontFamily="monospace"
                    >
                      1
                    </text>

                    {/* Edge 1: q0 -> q1 '1' */}
                    <path
                      d="M 80 100 L 170 100"
                      fill="none"
                      stroke={
                        activeEdgeIndex === 1 ? "#6366F1" : "#475569"
                      }
                      strokeWidth={activeEdgeIndex === 1 ? "2.5" : "1.5"}
                      className="transition-colors duration-200"
                      markerEnd={
                        activeEdgeIndex === 1
                          ? "url(#arrow-hero-active)"
                          : "url(#arrow-hero)"
                      }
                    />
                    <text
                      x="125"
                      y="90"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94A3B8"
                      fontFamily="monospace"
                    >
                      1
                    </text>

                    {/* Edge 2: q1 -> q2 '0' */}
                    <path
                      d="M 200 100 L 290 100"
                      fill="none"
                      stroke={
                        activeEdgeIndex === 2 ? "#6366F1" : "#475569"
                      }
                      strokeWidth={activeEdgeIndex === 2 ? "2.5" : "1.5"}
                      className="transition-colors duration-200"
                      markerEnd={
                        activeEdgeIndex === 2
                          ? "url(#arrow-hero-active)"
                          : "url(#arrow-hero)"
                      }
                    />
                    <text
                      x="245"
                      y="90"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94A3B8"
                      fontFamily="monospace"
                    >
                      0
                    </text>

                    {/* Edge 3: q2 -> q3 '1' */}
                    <path
                      d="M 320 100 L 410 100"
                      fill="none"
                      stroke={
                        activeEdgeIndex === 3 ? "#6366F1" : "#475569"
                      }
                      strokeWidth={activeEdgeIndex === 3 ? "2.5" : "1.5"}
                      className="transition-colors duration-200"
                      markerEnd={
                        activeEdgeIndex === 3
                          ? "url(#arrow-hero-active)"
                          : "url(#arrow-hero)"
                      }
                    />
                    <text
                      x="365"
                      y="90"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94A3B8"
                      fontFamily="monospace"
                    >
                      1
                    </text>

                    {/* Edge 4: q2 -> q0 '0' */}
                    <path
                      d="M 300 115 Q 190 170 80 115"
                      fill="none"
                      stroke={
                        activeEdgeIndex === 4 ? "#6366F1" : "#475569"
                      }
                      strokeWidth={activeEdgeIndex === 4 ? "2.5" : "1.5"}
                      className="transition-colors duration-200"
                      markerEnd={
                        activeEdgeIndex === 4
                          ? "url(#arrow-hero-active)"
                          : "url(#arrow-hero)"
                      }
                    />
                    <text
                      x="190"
                      y="160"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94A3B8"
                      fontFamily="monospace"
                    >
                      0
                    </text>

                    {/* Nodes */}
                    {[
                      { id: "q0", label: "q0", x: 70, y: 100, isAccept: false },
                      {
                        id: "q1",
                        label: "q1",
                        x: 190,
                        y: 100,
                        isAccept: false,
                      },
                      {
                        id: "q2",
                        label: "q2",
                        x: 310,
                        y: 100,
                        isAccept: false,
                      },
                      {
                        id: "q3",
                        label: "q3",
                        x: 430,
                        y: 100,
                        isAccept: true,
                      },
                    ].map((node) => {
                      const isActive = activeNode === node.id;
                      return (
                        <g key={node.id} className="transition-all duration-300">
                          {node.isAccept && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={24}
                              fill="none"
                              stroke={isActive ? "#10B981" : "#1E293B"}
                              strokeWidth="2"
                              className="transition-colors duration-300"
                            />
                          )}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={20}
                            fill={
                              isActive
                                ? node.isAccept
                                  ? "rgba(16,185,129,0.15)"
                                  : "rgba(99,102,241,0.15)"
                                : "#0f172a"
                            }
                            stroke={
                              isActive
                                ? node.isAccept
                                  ? "#10B981"
                                  : "#6366F1"
                                : "#334155"
                            }
                            strokeWidth="2.5"
                            className="transition-all duration-300"
                          />
                          <text
                            x={node.x}
                            y={node.y + 4}
                            textAnchor="middle"
                            fill={isActive ? "#FFFFFF" : "#94A3B8"}
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================================
// SECTION 2: QSOLVER SHOWCASE
// ========================================================

function QSolverSection() {
  const [selectedMock, setSelectedMock] =
    useState<keyof typeof QSOLVER_MOCKS>("nfa");
  const [solvingState, setSolvingState] = useState<
    "idle" | "solving" | "ready"
  >("ready");

  const handleSelectMock = (key: keyof typeof QSOLVER_MOCKS) => {
    setSolvingState("solving");
    setSelectedMock(key);
    setTimeout(() => {
      setSolvingState("ready");
    }, 1200);
  };

  const currentMock = QSOLVER_MOCKS[selectedMock];

  return (
    <section className="py-24 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <Brain size={12} />
            QSolver Engine
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
            Your textbook gives you questions.
            <br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              AutoMind gives you answers.
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Type any TAFL question in plain English. AutoMind parses it, constructs the
            automaton mathematically, verifies with test cases, and renders a
            layout-optimized diagram — all in seconds.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: prompt selector */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
              Try an example
            </p>
            {[
              {
                id: "nfa",
                label: "Build NFA for (a|b)*abb",
                desc: "Thompson construction logic",
              },
              {
                id: "even0s",
                label: "DFA accepting even number of 0s",
                desc: "Simple state cycle",
              },
              {
                id: "atMostTwo",
                label: "DFA with at most two a's",
                desc: "Dead-state transition check",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  handleSelectMock(item.id as keyof typeof QSOLVER_MOCKS)
                }
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${selectedMock === item.id
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-900"
                  }`}
              >
                <div>
                  <div className="text-xs font-mono font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {item.desc}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-500 group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            ))}

            <Link
              href="/question-solver"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 mt-6 transition-colors"
            >
              Try with your own question
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right: preview panel */}
          <div className="lg:col-span-7">
            <div className="w-full aspect-[1.3] bg-slate-950/60 border border-white/5 rounded-2xl overflow-hidden relative flex flex-col shadow-2xl">
              {/* Window bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-slate-950">
                <span className="text-[10px] font-mono text-slate-400">
                  solution_output
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide">
                    Ready
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
                {solvingState === "solving" ? (
                  <div className="text-center space-y-4">
                    <div className="w-9 h-9 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-mono text-slate-500">
                      Synthesizing graph layout...
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        Query: {currentMock.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        States: {currentMock.states.length} | Transitions:{" "}
                        {currentMock.edges.length}
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative">
                      <svg
                        className="w-full h-[180px]"
                        viewBox="0 0 500 200"
                      >
                        <defs>
                          <marker
                            id="arrow-solve"
                            markerWidth="8"
                            markerHeight="8"
                            refX="18"
                            refY="4"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 8 4, 0 8"
                              fill="#475569"
                            />
                          </marker>
                        </defs>

                        {currentMock.edges.map((edge, idx) => {
                          const fromNode = currentMock.states.find(
                            (s) => s.id === edge.from
                          );
                          const toNode = currentMock.states.find(
                            (s) => s.id === edge.to
                          );
                          if (!fromNode || !toNode) return null;

                          if (edge.isLoop) {
                            return (
                              <g key={idx}>
                                <path
                                  d={`M ${fromNode.x + 10} ${fromNode.y - 18} A 15 15 0 1 1 ${fromNode.x - 10} ${fromNode.y - 18}`}
                                  fill="none"
                                  stroke="#475569"
                                  strokeWidth="1.5"
                                  markerEnd="url(#arrow-solve)"
                                />
                                <text
                                  x={fromNode.x}
                                  y={fromNode.y - 38}
                                  textAnchor="middle"
                                  fontSize="9"
                                  fill="#94A3B8"
                                  fontFamily="monospace"
                                >
                                  {edge.label}
                                </text>
                              </g>
                            );
                          }

                          const isCurved = edge.curve !== undefined;
                          const curveValue = edge.curve ?? 0;
                          const d = isCurved
                            ? `M ${fromNode.x} ${fromNode.y} Q ${(fromNode.x + toNode.x) / 2} ${fromNode.y - curveValue} ${toNode.x} ${toNode.y}`
                            : `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;

                          const textX = (fromNode.x + toNode.x) / 2;
                          const textY = isCurved
                            ? fromNode.y - curveValue + 15
                            : fromNode.y - 10;

                          return (
                            <g key={idx}>
                              <path
                                d={d}
                                fill="none"
                                stroke="#475569"
                                strokeWidth="1.5"
                                markerEnd="url(#arrow-solve)"
                              />
                              <text
                                x={textX}
                                y={textY}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#94A3B8"
                                fontFamily="monospace"
                              >
                                {edge.label}
                              </text>
                            </g>
                          );
                        })}

                        {currentMock.states.map((state) => (
                          <g key={state.id}>
                            {state.isAccept && (
                              <circle
                                cx={state.x}
                                cy={state.y}
                                r={22}
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="1.5"
                              />
                            )}
                            <circle
                              cx={state.x}
                              cy={state.y}
                              r={18}
                              fill="#0f172a"
                              stroke={
                                state.isAccept ? "#10B981" : "#334155"
                              }
                              strokeWidth="2"
                            />
                            <text
                              x={state.x}
                              y={state.y + 3}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {state.id}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 mt-auto">
                      <span className="text-[10px] font-mono text-slate-400">
                        Satisfies 10+ test constraints automatically.
                      </span>
                      <Link
                        href="/simulator"
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        Open in Simulator{" "}
                        <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================================
// SECTION 3: FEATURE TRIPTYCH
// ========================================================

function FeatureTriptychSection() {
  const features = [
    {
      icon: <Sliders size={22} />,
      title: "Visual Simulator",
      description:
        "Design state machines on an interactive canvas. Drag nodes, draw transitions, simulate input strings step-by-step, and validate your automata in real time.",
      href: "/simulator",
      cta: "Open Simulator",
      gradient: "from-blue-500/10 to-indigo-500/10",
      borderHover: "hover:border-blue-500/30",
      iconBg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      preview: (
        <div className="bg-slate-950 rounded-lg border border-white/5 p-4 mt-4">
          <svg className="w-full h-20" viewBox="0 0 200 60">
            <defs>
              <marker id="arrow-feat" markerWidth="6" markerHeight="6" refX="14" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#6366F1" />
              </marker>
            </defs>
            <path d="M 10 30 L 30 30" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow-feat)" />
            <circle cx="45" cy="30" r="12" fill="#0f172a" stroke="#6366F1" strokeWidth="2" />
            <text x="45" y="33" textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace">q0</text>
            <path d="M 57 30 L 83 30" fill="none" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrow-feat)" />
            <text x="70" y="24" textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="monospace">a</text>
            <circle cx="100" cy="30" r="12" fill="#0f172a" stroke="#6366F1" strokeWidth="2" />
            <text x="100" y="33" textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace">q1</text>
            <path d="M 112 30 L 138 30" fill="none" stroke="#6366F1" strokeWidth="1.5" markerEnd="url(#arrow-feat)" />
            <text x="125" y="24" textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="monospace">b</text>
            <circle cx="155" cy="30" r="12" fill="none" stroke="#10B981" strokeWidth="2" />
            <circle cx="155" cy="30" r="9" fill="none" stroke="#10B981" strokeWidth="1" />
            <text x="155" y="33" textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace">q2</text>
          </svg>
        </div>
      ),
    },
    {
      icon: <Code size={22} />,
      title: "Regex Converter",
      description:
        "Paste any regular expression and watch it transform through the full compiler pipeline: parse tree, Thompson NFA, subset construction DFA, and Hopcroft minimization.",
      href: "/regex",
      cta: "Convert Expression",
      gradient: "from-cyan-500/10 to-teal-500/10",
      borderHover: "hover:border-cyan-500/30",
      iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      preview: (
        <div className="bg-slate-950 rounded-lg border border-white/5 p-4 mt-4 font-mono text-[10px] text-slate-400 space-y-1">
          <div className="text-cyan-400 font-bold">Input: (a|b)*abb</div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>1. Parse AST</span>
            <ArrowRight size={8} />
            <span>2. NFA</span>
            <ArrowRight size={8} />
            <span>3. DFA</span>
            <ArrowRight size={8} />
            <span className="text-emerald-400">4. Min DFA</span>
          </div>
          <div className="text-emerald-400 mt-1">Output: 4 states, 8 transitions</div>
        </div>
      ),
    },
    {
      icon: <Sparkles size={22} />,
      title: "AI Tutor",
      description:
        "Ask any theory question and get detailed, context-aware explanations with state transition traces, mathematical proofs, and LaTeX-rendered formal derivations.",
      href: "/ai-tutor",
      cta: "Ask AI Tutor",
      gradient: "from-emerald-500/10 to-green-500/10",
      borderHover: "hover:border-emerald-500/30",
      iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      preview: (
        <div className="bg-slate-950 rounded-lg border border-white/5 p-3 mt-4 space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">U</div>
            <div className="text-[10px] text-slate-300 bg-indigo-600/10 border border-indigo-500/20 rounded-lg px-2 py-1.5">Why does q2 reject 010?</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-[7px] font-bold shrink-0">AI</div>
            <div className="text-[10px] text-slate-400 bg-slate-900 border border-white/5 rounded-lg px-2 py-1.5 font-mono">
              The path q0{"\u2192"}q1{"\u2192"}q2{"\u2192"}q0 ends at a non-accepting state.
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 bg-slate-950/40 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Layers size={12} />
            Complete Toolkit
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
            Everything you need to{" "}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              master
            </span>{" "}
            automata.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Three integrated tools that cover the full Theory of Computation
            curriculum, from regex parsing to state machine simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-b ${feat.gradient} rounded-2xl border border-white/5 ${feat.borderHover} p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group`}
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-xl ${feat.iconBg} border flex items-center justify-center mb-5`}
                >
                  {feat.icon}
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
                {feat.preview}
              </div>
              <Link
                href={feat.href}
                className="mt-6 flex items-center gap-2 text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2.5 justify-center transition-all group-hover:border-white/20"
              >
                {feat.cta}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================================
// SECTION 4: SOCIAL PROOF
// ========================================================

function SocialProofSection() {
  const stats = [
    { value: "2,000+", label: "Students", icon: <Users size={18} /> },
    {
      value: "50+",
      label: "Universities",
      icon: <GraduationCap size={18} />,
    },
    { value: "10,000+", label: "Problems Solved", icon: <Target size={18} /> },
    { value: "4.8/5", label: "Student Rating", icon: <Star size={18} /> },
  ];

  const testimonials = [
    {
      quote:
        "I was struggling with NFA to DFA conversion in my TAFL exam prep. AutoMind's QSolver literally saved my semester. I typed the question and got a verified diagram in seconds.",
      name: "Utkarsh Srivastava",
      role: "B.Tech, 2nd Year",
      university: "JSS University, Noida",
    },
    {
      quote:
        "The visual simulator is exactly what I wished existed when I was learning Thompson's construction. Being able to step through input strings state-by-state makes everything click.",
      name: "Sanchita Singh",
      role: "B.Tech, 2nd Year",
      university: "JSS University, Noida",
    },
    {
      quote:
        "I showed AutoMind to my professor and he was impressed by the regex conversion pipeline. Now the whole class uses it as a companion tool alongside lectures.",
      name: "Yash Gupta",
      role: "B.Tech, 2nd Year",
      university: "JSS University, Noida",
    },
  ];

  return (
    <section className="py-24 border-t border-white/5 relative z-10 max-w-7xl mx-auto px-6 md:px-12">
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              {stat.icon}
            </div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Loved by students who{" "}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            get it
          </span>
        </h2>
        <p className="text-slate-400 text-sm">
          Built for CS students, by CS students. Here&apos;s what they say.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 relative hover:border-white/10 transition-all duration-300"
          >
            <Quote
              size={24}
              className="text-indigo-500/20 absolute top-4 right-4"
            />
            <p className="text-sm text-slate-300 leading-relaxed mb-6 relative z-10">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="border-t border-white/5 pt-4">
              <div className="text-sm font-bold text-white">{t.name}</div>
              <div className="text-[11px] text-slate-500">
                {t.role} — {t.university}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ========================================================
// SECTION 5: GAMIFICATION PREVIEW
// ========================================================

function GamificationSection() {
  return (
    <section className="py-24 bg-slate-950/40 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
            <Trophy size={12} />
            Gamified Learning
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
            Theory feels like a{" "}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              game
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Build daily streaks, earn XP from quizzes and challenges, and level
            up from Automata Apprentice to Turing Overlord.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-left">
          {/* Streak */}
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-orange-500/20 transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full" />
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6">
              <Flame size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Daily Streak
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Complete at least one challenge each day to maintain your streak
              and earn multiplied XP.
            </p>
            <div className="text-lg font-display font-bold text-orange-400 flex items-center gap-2">
              <Flame size={16} className="fill-orange-400/20" />
              7 Days
            </div>
          </div>

          {/* XP */}
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-yellow-500/20 transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full" />
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              XP Progress
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Earn XP by completing conversions, designing automata, or solving
              quiz modules.
            </p>
            <div className="text-lg font-display font-bold text-yellow-400 flex items-center gap-2">
              <Zap size={16} />
              1,240 XP
            </div>
          </div>

          {/* Rank */}
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-violet-500/20 transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-2xl rounded-full" />
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
              <Trophy size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Weekly Rank
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Compete against other CS students and climb the leaderboard with
              consistent practice.
            </p>
            <div className="text-lg font-display font-bold text-violet-400 flex items-center gap-2">
              <Trophy size={16} />
              #3 Global
            </div>
          </div>

          {/* Challenges */}
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <Target size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Practice Quests
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Unlock badges and rewards by solving curated computational logic
              challenges.
            </p>
            <div className="text-lg font-display font-bold text-indigo-400 flex items-center gap-2">
              <Target size={16} />
              12 Solved
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            Start your learning streak today
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ========================================================
// SECTION 6: FINAL CTA + FOOTER
// ========================================================

function FinalCTASection() {
  return (
    <section className="relative py-28 border-t border-white/5 overflow-hidden z-10 w-full text-center">
      {/* Background automata decoration */}
      <div className="absolute inset-0 bg-[#0b0f19] opacity-40 pointer-events-none">
        <svg
          className="w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10%"
            cy="20%"
            r="30"
            fill="none"
            stroke="#6366F1"
            strokeWidth="1"
          />
          <circle
            cx="85%"
            cy="30%"
            r="50"
            fill="none"
            stroke="#6366F1"
            strokeWidth="1"
          />
          <circle
            cx="30%"
            cy="80%"
            r="40"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1="10%"
            y1="20%"
            x2="30%"
            y2="80%"
            stroke="#475569"
            strokeWidth="1"
          />
          <line
            x1="85%"
            y1="30%"
            x2="30%"
            y2="80%"
            stroke="#475569"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-8">
        <h2 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white leading-none">
          Stop memorizing.
          <br />
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Start understanding.
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          Join thousands of computer science students using AutoMind to turn
          automata theory from rote memorization into genuine visual
          understanding.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 font-semibold text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Get Started Free
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/question-solver"
            className="w-full sm:w-auto px-8 py-3.5 font-semibold text-sm rounded-xl bg-slate-900 border border-white/5 hover:border-white/10 transition-all duration-200"
          >
            Try QSolver
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-xs text-slate-500 border-t border-white/5 mt-24 relative z-10 w-full">
        Built for CS students, by students. AutoMind &copy;{" "}
        {new Date().getFullYear()}
      </footer>
    </section>
  );
}
