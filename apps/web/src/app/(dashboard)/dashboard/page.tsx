"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import { useSimulatorStore } from "@/store/useSimulatorStore";
import { useRegexStore } from "@/store/useRegexStore";
import { useTutorStore } from "@/store/useTutorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  ArrowRight,
  Play,
  Sparkles,
  Terminal,
  Sliders,
  Plus,
  Trophy,
  Zap,
  XCircle,
  Code
} from "lucide-react";

// Pre-built automata templates for quick visual loading
const AUTOMATA_TEMPLATES = [
  {
    id: "odd-as",
    title: "DFA: Odd number of 'a's",
    description: "Accepts any binary string over {a, b} containing an odd count of 'a's.",
    type: "DFA" as const,
    complexity: "Easy",
    nodesCount: 2,
    edgesCount: 4,
    automaton: {
      type: "DFA" as const,
      states: ["q0", "q1"],
      alphabet: ["a", "b"],
      startState: "q0",
      acceptStates: ["q1"],
      transitions: [
        { from: "q0", to: "q1", symbol: "a" },
        { from: "q0", to: "q0", symbol: "b" },
        { from: "q1", to: "q0", symbol: "a" },
        { from: "q1", to: "q1", symbol: "b" }
      ]
    },
    // Mini SVG render parameters
    svg: (
      <svg className="w-full h-24 text-text-primary" viewBox="0 0 200 80">
        {/* q0 */}
        <circle cx="50" cy="40" r="16" fill="rgba(255,255,255,0.05)" stroke="var(--color-primary-light)" strokeWidth="2" />
        <text x="50" y="43" textAnchor="middle" fontSize="9" className="fill-text-primary font-mono">q0</text>
        <path d="M 20,40 L 34,40" stroke="var(--color-text-muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        
        {/* q1 (Accepting) */}
        <circle cx="150" cy="40" r="16" fill="rgba(255,255,255,0.05)" stroke="var(--color-accent-light)" strokeWidth="2" />
        <circle cx="150" cy="40" r="12" fill="none" stroke="var(--color-accent-light)" strokeWidth="1" />
        <text x="150" y="43" textAnchor="middle" fontSize="9" className="fill-text-primary font-mono">q1</text>
        
        {/* Transitions */}
        {/* q0 -> q1 (a) */}
        <path d="M 66,35 Q 100,20 134,35" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="100" y="22" textAnchor="middle" fontSize="9" className="fill-primary-light font-mono">a</text>
        
        {/* q1 -> q0 (a) */}
        <path d="M 134,45 Q 100,60 66,45" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="100" y="62" textAnchor="middle" fontSize="9" className="fill-primary-light font-mono">a</text>
        
        {/* q0 self (b) */}
        <path d="M 42,26 C 30,10 70,10 58,26" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="50" y="10" textAnchor="middle" fontSize="8" className="fill-text-muted font-mono">b</text>

        {/* q1 self (b) */}
        <path d="M 142,26 C 130,10 170,10 158,26" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="150" y="10" textAnchor="middle" fontSize="8" className="fill-text-muted font-mono">b</text>
      </svg>
    )
  },
  {
    id: "ends-01",
    title: "NFA: Ends with '01'",
    description: "Matches all binary strings over {0, 1} ending with the suffix '01'.",
    type: "NFA" as const,
    complexity: "Medium",
    nodesCount: 3,
    edgesCount: 4,
    automaton: {
      type: "NFA" as const,
      states: ["q0", "q1", "q2"],
      alphabet: ["0", "1"],
      startState: "q0",
      acceptStates: ["q2"],
      transitions: [
        { from: "q0", to: "q0", symbol: "0" },
        { from: "q0", to: "q0", symbol: "1" },
        { from: "q0", to: "q1", symbol: "0" },
        { from: "q1", to: "q2", symbol: "1" }
      ]
    },
    svg: (
      <svg className="w-full h-24 text-text-primary" viewBox="0 0 200 80">
        {/* q0 */}
        <circle cx="40" cy="45" r="14" fill="rgba(255,255,255,0.05)" stroke="var(--color-primary-light)" strokeWidth="2" />
        <text x="40" y="48" textAnchor="middle" fontSize="9" className="fill-text-primary font-mono">q0</text>
        
        {/* q1 */}
        <circle cx="100" cy="45" r="14" fill="rgba(255,255,255,0.05)" stroke="var(--color-primary-light)" strokeWidth="2" />
        <text x="100" y="48" textAnchor="middle" fontSize="9" className="fill-text-primary font-mono">q1</text>
        
        {/* q2 (Accepting) */}
        <circle cx="160" cy="45" r="14" fill="rgba(255,255,255,0.05)" stroke="var(--color-accent-light)" strokeWidth="2" />
        <circle cx="160" cy="45" r="11" fill="none" stroke="var(--color-accent-light)" strokeWidth="1" />
        <text x="160" y="48" textAnchor="middle" fontSize="9" className="fill-text-primary font-mono">q2</text>
        
        {/* Transitions */}
        {/* q0 self (0,1) */}
        <path d="M 32,33 C 20,17 60,17 48,33" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="40" y="16" textAnchor="middle" fontSize="8" className="fill-text-muted font-mono">0,1</text>

        {/* q0 -> q1 (0) */}
        <path d="M 54,45 L 86,45" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="70" y="38" textAnchor="middle" fontSize="9" className="fill-primary-light font-mono">0</text>

        {/* q1 -> q2 (1) */}
        <path d="M 114,45 L 146,45" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="130" y="38" textAnchor="middle" fontSize="9" className="fill-accent-light font-mono">1</text>
      </svg>
    )
  },
  {
    id: "substring-abb",
    title: "DFA: Substring 'abb'",
    description: "Accepts any binary string over {a, b} containing 'abb' as a continuous block.",
    type: "DFA" as const,
    complexity: "Hard",
    nodesCount: 4,
    edgesCount: 8,
    automaton: {
      type: "DFA" as const,
      states: ["q0", "q1", "q2", "q3"],
      alphabet: ["a", "b"],
      startState: "q0",
      acceptStates: ["q3"],
      transitions: [
        { from: "q0", to: "q1", symbol: "a" },
        { from: "q0", to: "q0", symbol: "b" },
        { from: "q1", to: "q1", symbol: "a" },
        { from: "q1", to: "q2", symbol: "b" },
        { from: "q2", to: "q1", symbol: "a" },
        { from: "q2", to: "q3", symbol: "b" },
        { from: "q3", to: "q3", symbol: "a" },
        { from: "q3", to: "q3", symbol: "b" }
      ]
    },
    svg: (
      <svg className="w-full h-24 text-text-primary" viewBox="0 0 200 80">
        {/* states */}
        <circle cx="30" cy="45" r="12" fill="rgba(255,255,255,0.05)" stroke="var(--color-primary-light)" strokeWidth="1.5" />
        <text x="30" y="47" textAnchor="middle" fontSize="8" className="fill-text-primary font-mono">q0</text>
        
        <circle cx="75" cy="45" r="12" fill="rgba(255,255,255,0.05)" stroke="var(--color-primary-light)" strokeWidth="1.5" />
        <text x="75" y="47" textAnchor="middle" fontSize="8" className="fill-text-primary font-mono">q1</text>
        
        <circle cx="120" cy="45" r="12" fill="rgba(255,255,255,0.05)" stroke="var(--color-primary-light)" strokeWidth="1.5" />
        <text x="120" y="47" textAnchor="middle" fontSize="8" className="fill-text-primary font-mono">q2</text>
        
        <circle cx="165" cy="45" r="12" fill="rgba(255,255,255,0.05)" stroke="var(--color-accent-light)" strokeWidth="1.5" />
        <circle cx="165" cy="45" r="9" fill="none" stroke="var(--color-accent-light)" strokeWidth="1" />
        <text x="165" y="47" textAnchor="middle" fontSize="8" className="fill-text-primary font-mono">q3</text>

        {/* transitions */}
        {/* q0->q1 (a) */}
        <path d="M 42,45 L 63,45" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1" markerEnd="url(#arrow)" />
        <text x="52" y="39" textAnchor="middle" fontSize="7" className="fill-primary-light font-mono">a</text>

        {/* q1->q2 (b) */}
        <path d="M 87,45 L 108,45" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1" markerEnd="url(#arrow)" />
        <text x="97" y="39" textAnchor="middle" fontSize="7" className="fill-accent-light font-mono">b</text>

        {/* q2->q3 (b) */}
        <path d="M 132,45 L 153,45" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1" markerEnd="url(#arrow)" />
        <text x="142" y="39" textAnchor="middle" fontSize="7" className="fill-accent-light font-mono">b</text>
      </svg>
    )
  }
];

// Daily Challenge Config
const DAILY_CHALLENGE = {
  question: "Which of the following describes the Kleene closure (star) of a formal language L = { ab } over the alphabet Σ = {a, b}?",
  options: [
    { key: "A", text: "L* = { ε, ab, abab, ababab, abababab, ... }" },
    { key: "B", text: "L* = { ab, abab, ababab, abababab, ... }" },
    { key: "C", text: "L* = { ε, a, b, ab, ba, aab, abb, ... }" },
    { key: "D", text: "L* = { ε, ab, ba, abab, baba, ... }" }
  ],
  correctKey: "A",
  explanation: "The Kleene closure L* of L contains all possible concatenations of strings from L, including the empty string ε (zero concatenations). Since L contains only 'ab', L* is {ε, ab, abab, ababab, ...}."
};

export default function DashboardPage() {
  const router = useRouter();
  
  // Zustand Store selections
  const attempts = useQuizStore((state) => state.attempts);
  const importAutomaton = useSimulatorStore((state) => state.importAutomaton);
  const sendTutorMessage = useTutorStore((state) => state.sendMessage);

  // Client states
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string | null>(null);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [isChallengeCorrect, setIsChallengeCorrect] = useState<boolean | null>(null);
  const [dailyXPBonus, setDailyXPBonus] = useState(0);

  // Sync state values dynamically
  const quizXP = attempts.reduce((sum, a) => sum + (a.score * 50), 0);
  const totalXP = quizXP + dailyXPBonus;
  
  // Level & progression tiering logic
  let currentLevel = 1;
  let levelName = "Automata Apprentice";
  let nextLevelXP = 200;
  let prevLevelXP = 0;
  
  if (totalXP >= 1500) {
    currentLevel = 5;
    levelName = "Turing Overlord";
    nextLevelXP = 3000;
    prevLevelXP = 1500;
  } else if (totalXP >= 800) {
    currentLevel = 4;
    levelName = "Regular wizard";
    nextLevelXP = 1500;
    prevLevelXP = 800;
  } else if (totalXP >= 350) {
    currentLevel = 3;
    levelName = "DFA Architect";
    nextLevelXP = 800;
    prevLevelXP = 350;
  } else if (totalXP >= 100) {
    currentLevel = 2;
    levelName = "State Transitioner";
    nextLevelXP = 350;
    prevLevelXP = 100;
  }

  const levelRange = nextLevelXP - prevLevelXP;
  const levelProgress = totalXP - prevLevelXP;
  const levelPercent = Math.min(100, Math.max(0, Math.round((levelProgress / levelRange) * 100)));

  // Attempts logic
  const totalCompleted = attempts.length;
  const accuracy = totalCompleted > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalCompleted) 
    : 0;

  // Active streak logic (adds +1 if challenge is correctly solved)
  const baseStreak = totalCompleted > 0 ? Math.min(5, Math.ceil(totalCompleted * 0.7)) : 0;
  const currentStreak = baseStreak + (isChallengeCorrect ? 1 : 0);

  // Effect to load solved daily challenge status from local storage
  useEffect(() => {
    const solved = localStorage.getItem("automind_daily_solved");
    const wasCorrect = localStorage.getItem("automind_daily_correct");
    if (solved) {
      setChallengeSubmitted(true);
      if (wasCorrect === "true") {
        setIsChallengeCorrect(true);
        setDailyXPBonus(50);
      } else {
        setIsChallengeCorrect(false);
      }
    }
  }, []);

  // Quick sandbox template visual loading
  const handleLoadTemplate = (template: typeof AUTOMATA_TEMPLATES[0]) => {
    importAutomaton(template.automaton);
    router.push("/simulator");
  };


  // Handle daily challenge option submissions
  const handleChallengeSubmit = () => {
    if (!selectedChallengeOption || challengeSubmitted) return;

    const correct = selectedChallengeOption === DAILY_CHALLENGE.correctKey;
    setIsChallengeCorrect(correct);
    setChallengeSubmitted(true);
    
    localStorage.setItem("automind_daily_solved", "true");
    if (correct) {
      localStorage.setItem("automind_daily_correct", "true");
      setDailyXPBonus(50);
    } else {
      localStorage.setItem("automind_daily_correct", "false");
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-16 px-4 md:px-6 pt-6 font-sans">
      
      {/* ── DEFINE MARKER DEFINITION FOR AUTOMATA SVGS ── */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-text-secondary)" />
          </marker>
        </defs>
      </svg>

      {/* Hero Welcome & Gamified Rank Bar */}
      <div className="relative glass-card p-6 md:p-8 overflow-hidden mb-8 border border-border/80 bg-gradient-to-r from-bg-card to-primary/5 shadow-glow-primary">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl font-mono select-none">
          Σ*
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary-light border border-primary/30 flex items-center gap-1.5">
                <Sparkles size={12} className="fill-primary-light/30" />
                Active Session
              </span>
              {currentStreak > 0 && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning border border-warning/20 flex items-center gap-1">
                  <Flame size={12} className="fill-warning/20" />
                  {currentStreak} Day Streak
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2 text-text-primary">
              Welcome back, Scholar
            </h1>
            <p className="text-sm md:text-base text-text-secondary max-w-xl">
              Ready to explore formal languages? Design machines, convert expressions, or test your computational limits today.
            </p>
          </div>

          {/* Gamified Level & XP Section */}
          <div className="w-full md:w-80 bg-black/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-warning fill-warning/10" />
                <span className="text-xs font-sans text-text-muted font-medium uppercase tracking-wider">Level {currentLevel}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-primary-light">{totalXP} / {nextLevelXP} XP</span>
            </div>
            
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden mb-2 relative">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${levelPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-display font-medium text-text-primary">{levelName}</span>
              <span className="text-text-muted">{nextLevelXP - totalXP} XP to level up</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ── MAIN DASHBOARD LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Left Column: Action Zone (Launchpad + Templates) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Workspace Launchpad (Bento Grid) */}
          <div>
            <h2 className="text-xl font-display font-semibold mb-5 text-text-primary flex items-center gap-2.5">
              <Terminal size={18} className="text-primary-light" />
              Workspace Launchpad
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LaunchButton
                href="/simulator"
                title="Visual Simulator"
                icon={<Sliders size={18} />}
                gradientClass="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#5A50ED] hover:to-[#6E71FA]"
                shadowClass="shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)]"
              />
              <LaunchButton
                href="/question-solver"
                title="Question Solver"
                icon={<Brain size={18} />}
                gradientClass="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#864DF7] hover:to-[#966CF8]"
                shadowClass="shadow-[0_4px_14px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)]"
              />
              <LaunchButton
                href="/regex"
                title="Regex Converter"
                icon={<Code size={18} />}
                gradientClass="bg-gradient-to-r from-[#0891B2] to-[#06B6D4] hover:from-[#0BA5CA] hover:to-[#0EC2E0]"
                shadowClass="shadow-[0_4px_14px_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.35)]"
              />
              <LaunchButton
                href="/quiz"
                title="Practice Quizzes"
                icon={<BookOpen size={18} />}
                gradientClass="bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#E6820E] hover:to-[#FAA819]"
                shadowClass="shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)]"
              />
              <LaunchButton
                href="/ai-tutor"
                title="AI Study Tutor"
                icon={<Sparkles size={18} />}
                gradientClass="bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#06A977] hover:to-[#12C88C]"
                shadowClass="shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] lg:col-span-2"
              />
            </div>
          </div>

          {/* Sandbox & Templates Panel */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2.5">
                <Sliders size={18} className="text-accent-light" />
                Visual Sandbox Templates
              </h2>
              <span className="text-xs text-text-muted font-mono">Select to load</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {AUTOMATA_TEMPLATES.map((template) => (
                <div 
                  key={template.id} 
                  className="glass-card hover:border-accent-light/50 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Badge */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-white/5 border border-border text-text-secondary rounded">
                      {template.type}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${
                      template.complexity === "Easy" ? "bg-green-900/30 text-green-400 border border-green-700/30" : 
                      template.complexity === "Medium" ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/30" :
                      "bg-red-900/30 text-red-400 border border-red-700/30"
                    }`}>
                      {template.complexity}
                    </span>
                  </div>

                  {/* Thumbnail render */}
                  <div className="p-4 pt-10 border-b border-border/30 bg-black/20 flex items-center justify-center select-none group-hover:bg-black/30 transition-colors">
                    {template.svg}
                  </div>

                  {/* Body description */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <h4 className="text-sm font-display font-semibold text-text-primary mb-1">
                        {template.title}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    <Button 
                      onClick={() => handleLoadTemplate(template)}
                      className="w-full text-xs h-8 bg-white/5 border border-border hover:bg-accent hover:border-accent hover:text-black hover:font-bold transition-all text-text-secondary flex items-center justify-center gap-1.5"
                    >
                      <Play size={12} fill="currentColor" /> Load Sandbox
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Gamified Challenge Widget & Stats */}
        <div className="space-y-6">

          {/* Progress & Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatWidget 
              label="Completed" 
              value={totalCompleted.toString()} 
              subtitle="Exercises"
              icon={<BookOpen size={16} className="text-primary-light" />} 
            />
            <StatWidget 
              label="Accuracy" 
              value={totalCompleted > 0 ? `${accuracy}%` : "—"} 
              subtitle="Quiz score"
              icon={<Award size={16} className="text-accent-light" />} 
            />
            <StatWidget 
              label="Streak" 
              value={`${currentStreak}`} 
              subtitle="Days active"
              icon={<Flame size={16} className="text-warning fill-warning/10" />} 
            />
            <StatWidget 
              label="XP Points" 
              value={totalXP.toLocaleString()} 
              subtitle="Total earned"
              icon={<Zap size={16} className="text-success" />} 
            />
          </div>

          {totalCompleted === 0 && (
            <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
              <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="text-primary-light font-medium block mb-1">Begin your journey</span>
                Complete your first quiz or solve a question to start tracking your XP, streak, and accuracy.
              </p>
            </div>
          )}
          
          {/* Daily CS Challenge Card */}
          <div className="glass-card border-border/80 relative overflow-hidden bg-gradient-to-b from-bg-card to-black/30">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-accent" />
            
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={18} className="text-warning fill-warning/10" />
                <h3 className="text-base font-display font-semibold text-text-primary">
                  Challenge of the Day
                </h3>
              </div>

              <p className="text-sm text-text-primary leading-relaxed font-sans mb-5 font-medium bg-white/5 p-3 rounded-lg border border-border/30">
                {DAILY_CHALLENGE.question}
              </p>

              {/* Multiple Choice Options */}
              <div className="space-y-3 mb-5">
                {DAILY_CHALLENGE.options.map((option) => {
                  const isSelected = selectedChallengeOption === option.key;
                  const isCorrectAnswer = option.key === DAILY_CHALLENGE.correctKey;
                  
                  let optionClass = "border-border/60 hover:border-border hover:bg-white/5";
                  if (isSelected) {
                    optionClass = "border-primary bg-primary/10 text-primary-light shadow-[0_0_10px_rgba(99,102,241,0.1)]";
                  }
                  
                  if (challengeSubmitted) {
                    if (isCorrectAnswer) {
                      optionClass = "border-success bg-success/15 text-success shadow-[0_0_10px_rgba(34,197,94,0.1)]";
                    } else if (isSelected && !isCorrectAnswer) {
                      optionClass = "border-error bg-error/15 text-error";
                    } else {
                      optionClass = "opacity-50 border-border/30";
                    }
                  }

                  return (
                    <button
                      key={option.key}
                      onClick={() => !challengeSubmitted && setSelectedChallengeOption(option.key)}
                      disabled={challengeSubmitted}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${optionClass}`}
                    >
                      <span className="flex-1 pr-2">{option.text}</span>
                      
                      {/* Checkmarks / crosses based on submission status */}
                      {challengeSubmitted && isCorrectAnswer && (
                        <CheckCircle2 size={14} className="text-success shrink-0" />
                      )}
                      {challengeSubmitted && isSelected && !isCorrectAnswer && (
                        <XCircle size={14} className="text-error shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submitting Buttons / Feedback details */}
              {!challengeSubmitted ? (
                <Button 
                  onClick={handleChallengeSubmit}
                  disabled={!selectedChallengeOption}
                  className="w-full font-semibold flex items-center justify-center gap-1.5"
                >
                  Submit Answer <ArrowRight size={14} />
                </Button>
              ) : (
                <div className="mt-4 p-4 rounded-lg bg-white/5 border border-border/40 text-xs text-text-secondary leading-relaxed">
                  <div className="flex items-center gap-2 mb-2">
                    {isChallengeCorrect ? (
                      <span className="text-success font-semibold flex items-center gap-1">
                        Correct! +50 XP
                      </span>
                    ) : (
                      <span className="text-error font-semibold flex items-center gap-1">
                        Incorrect State
                      </span>
                    )}
                  </div>
                  <p>{DAILY_CHALLENGE.explanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Quiz Navigation */}
          <div className="glass-card p-5 border-border/60">
            <h3 className="text-base font-display font-semibold mb-3 text-text-primary flex items-center gap-2">
              <BookOpen size={16} className="text-primary-light" />
              Practice Quizzes
            </h3>
            
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Test your theoretical knowledge about DFA regular equivalence, subset construction, and epsilon transition closures.
            </p>

            <Button asChild variant="outline" className="w-full text-xs h-9 hover:bg-primary hover:text-white transition-all font-semibold">
              <Link href="/quiz" className="flex items-center justify-center gap-1.5">
                Go to Practice Arena <ArrowRight size={12} />
              </Link>
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}

// Custom Tactile Launch Button component for Dashboard Launchpad
function LaunchButton({
  href,
  title,
  icon,
  gradientClass,
  shadowClass,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  gradientClass: string;
  shadowClass: string;
}) {
  return (
    <Link
      href={href}
      className={`relative overflow-hidden h-12 rounded-xl flex items-center justify-center gap-2.5 px-4 font-display font-bold text-[10px] uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95 border border-white/10 group ${gradientClass} ${shadowClass}`}
    >
      {/* Premium glossy overlay sheen */}
      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      <span className="shrink-0 scale-100 group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span className="truncate">{title}</span>
      <ArrowRight size={12} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </Link>
  );
}

// Stats helper component
function StatWidget({ 
  label, 
  value, 
  subtitle, 
  icon 
}: { 
  label: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode; 
}) {
  return (
    <Card className="border-border/60 relative overflow-hidden flex flex-col justify-between hover:border-border hover:bg-bg-card-hover transition-colors duration-300">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-sans text-text-muted uppercase tracking-wider font-semibold">
            {label}
          </span>
          <div className="p-1.5 rounded-lg bg-white/5 border border-border/20">
            {icon}
          </div>
        </div>
        
        <div className="mb-1">
          <p className="text-2xl font-mono font-bold text-text-primary">
            {value}
          </p>
        </div>
        
        <p className="text-[10px] font-sans text-text-muted leading-none">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}
