"use client";

import React, { RefObject } from 'react';
import MarkdownMessage from '@/components/copilot/MarkdownMessage';
import { ChatMessage } from './types';

interface CopilotMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  copiedId: string | null;
  userDisplayName?: string | null;
  onCopyMessage: (content: string, id: string) => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function CopilotMessageList({
  messages,
  isLoading,
  copiedId,
  userDisplayName,
  onCopyMessage,
  messagesEndRef,
}: CopilotMessageListProps) {
  const firstName = userDisplayName?.split(' ')[0] || 'You';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-mono">
            <span>{m.role === 'user' ? firstName : 'Copilot'}</span>
            <span>•</span>
            <span>{m.timestamp}</span>
          </div>

          <div
            className={`max-w-[94%] sm:max-w-[88%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-2xs relative group ${
              m.role === 'user'
                ? 'bg-slate-900 text-white rounded-tr-xs'
                : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
            }`}
          >
            {/* Verified Citation Pill Header */}
            {m.isRulebook && m.citations && m.citations.length > 0 && (
              <div className="mb-3 pb-2.5 border-b border-amber-200 bg-amber-50/80 -mx-4 -mt-4 p-3 rounded-t-2xl">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Rulebook Citation</span>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-950 font-mono text-[10px] font-bold shadow-2xs"
                    >
                      <span className="text-amber-600">SEC</span>
                      <span>{c.section}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-amber-600">PAGE</span>
                      <span className="text-slate-900 underline font-extrabold">{c.page}</span>
                      {c.clause && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-600">({c.clause})</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Prose via Markdown Renderer */}
            {m.role === 'assistant' ? (
              <MarkdownMessage content={m.content} />
            ) : (
              <div className="whitespace-pre-wrap font-sans text-white">
                {m.content}
              </div>
            )}

            {/* Copy Action Footer */}
            {m.role === 'assistant' && !m.id.startsWith('welcome') && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onCopyMessage(m.content, m.id)}
                  className="text-[10px] text-slate-400 hover:text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedId === m.id ? (
                    <span className="text-emerald-600 font-bold">Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 animate-pulse">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-2xs text-xs text-slate-500 font-mono">
            Thinking...
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
