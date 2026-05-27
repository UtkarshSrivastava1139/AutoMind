"use client";

import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { TutorChat } from './TutorChat';

export function TutorDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 z-40 p-4 rounded-full bg-primary text-white shadow-[0_0_20px_rgba(78,70,229,0.3)] hover:shadow-[0_0_30px_rgba(78,70,229,0.5)] hover:-translate-y-1 transition-all duration-300"
        aria-label="Open AI Tutor"
      >
        <Bot size={24} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-bg-app border-l border-border transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-text-primary text-sm">AI Tutor</h3>
              <p className="text-[10px] text-text-muted">Explain, verify, and guide.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Chat Area - We reuse the existing TutorChat which handles its own state and scroll */}
        <div className="flex-1 overflow-hidden p-2 relative">
          <TutorChat />
        </div>
      </div>
    </>
  );
}
