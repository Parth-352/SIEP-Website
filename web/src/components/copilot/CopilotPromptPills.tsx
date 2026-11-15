"use client";

import React from 'react';
import { COPILOT_QUICK_PROMPTS } from './types';

interface CopilotPromptPillsProps {
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export default function CopilotPromptPills({
  isLoading,
  onSelectPrompt,
}: CopilotPromptPillsProps) {
  return (
    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
      {COPILOT_QUICK_PROMPTS.map((prompt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelectPrompt(prompt)}
          disabled={isLoading}
          className="text-[11px] whitespace-nowrap bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 px-3 py-1 rounded-full transition-colors cursor-pointer shrink-0 shadow-2xs font-medium disabled:opacity-40"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
