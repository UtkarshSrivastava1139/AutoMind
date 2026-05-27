"use client";

import React, { useState, useEffect } from "react";
import { TutorChat } from "@/components/ai-tutor/TutorChat";
import { Button } from "@/components/ui/button";
import { Bot, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// Expose a global hook or use simple state for now. 
// A better approach is moving this to a Zustand store (useTutorLayoutStore) 
// but local state + context or singleton is okay. For immediate phase 3 wiring, 
// we will export a standalone Drawer that can be toggled by the host layout.

interface TutorDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function TutorDrawer({ isOpen, onToggle }: TutorDrawerProps) {
  return (
    <>
      <div 
        className={cn(
          "fixed right-0 top-[57px] bottom-0 z-40 bg-bg-app border-l border-border transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl flex flex-col pointer-events-auto",
          isOpen ? "translate-x-0 w-[400px]" : "translate-x-full w-[400px]"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-workspace">
          <div className="flex items-center gap-2 text-text-primary">
            <Bot size={18} className="text-secondary" />
            <span className="font-display font-medium text-sm">AI Tutor</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-text-muted hover:text-text-primary">
            <PanelRightClose size={16} />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <TutorChat />
        </div>
      </div>

      {/* Floating Toggle Button (Visible when drawer is closed) */}
      {!isOpen && (
        <Button
          variant="default"
          size="icon"
          onClick={onToggle}
          className="fixed right-4 bottom-4 z-50 rounded-full h-12 w-12 shadow-glow-primary hover:shadow-glow-cyan transition-shadow duration-300"
          title="Open AI Tutor"
        >
          <Bot size={24} />
        </Button>
      )}
    </>
  );
}