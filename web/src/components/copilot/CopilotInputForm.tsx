"use client";

import React from 'react';

interface CopilotInputFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export default function CopilotInputForm({
  input,
  setInput,
  isLoading,
  onSubmit,
}: CopilotInputFormProps) {
  return (
    <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about rules or bike specs..."
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-slate-900 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <span>Ask</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}
