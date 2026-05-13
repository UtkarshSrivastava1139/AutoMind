"use client";

import { RegexInput } from '@web/components/regex-converter/RegexInput';
import { ConversionPipeline } from '@web/components/regex-converter/ConversionPipeline';

export default function RegexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <RegexInput />
        <ConversionPipeline />
      </div>
    </div>
  );
}
