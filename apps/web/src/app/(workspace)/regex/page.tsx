"use client";

import { RegexInput } from '@/components/regex-converter/RegexInput';
import { ConversionPipeline } from '@/components/regex-converter/ConversionPipeline';

export default function RegexPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1 font-display">
            Regex Converter
          </h1>
          <p className="text-sm text-text-muted">
            Transform standard regular expressions into NFA, DFA, and minimized DFA.
          </p>
        </div>
        <RegexInput />
        <ConversionPipeline />
      </div>
    </div>
  );
}
