import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AutoMind — Interactive Automata Theory Learning Platform",
  description:
    "Transform Theory of Automata and Formal Languages from abstract notation into visual, interactive, and engaging learning experiences. Build, simulate, convert, and practice finite automata.",
  keywords: [
    "automata theory",
    "DFA",
    "NFA",
    "regex",
    "formal languages",
    "TAFL",
    "computer science education",
    "interactive learning",
  ],
  authors: [{ name: "AutoMind" }],
  openGraph: {
    title: "AutoMind — Interactive Automata Theory Learning Platform",
    description:
      "Visual, interactive learning for automata theory. Build DFAs, NFAs, convert regex, and practice with AI-powered explanations.",
    type: "website",
    locale: "en_US",
  },
};

import { GlobalLayoutWrapper } from "@/components/shared/GlobalLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${caveat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased overflow-y-auto">
        <GlobalLayoutWrapper>{children}</GlobalLayoutWrapper>
      </body>
    </html>
  );
}

