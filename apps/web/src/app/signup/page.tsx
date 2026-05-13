"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Auth implementation will be added with Auth.js
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg-app)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: "transparent" }}
          >
            <Image src="/logo.png" alt="AutoMind Logo" width={40} height={40} />
          </div>
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            AutoMind
          </span>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            Create your account
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--color-text-muted)" }}
          >
            Start your automata theory learning journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 text-sm rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2"
                style={{
                  background: "var(--color-bg-workspace)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 text-sm rounded-lg font-mono transition-colors duration-150 focus:outline-none focus:ring-2"
                style={{
                  background: "var(--color-bg-workspace)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="w-full px-4 py-3 text-sm rounded-lg font-mono transition-colors duration-150 focus:outline-none focus:ring-2"
                style={{
                  background: "var(--color-bg-workspace)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--color-primary)" }}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div
            className="mt-6 text-center text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors duration-150"
              style={{ color: "var(--color-primary-light)" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
