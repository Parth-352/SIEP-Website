"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { RulebookCitation } from '@/lib/rulebookService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isRulebook?: boolean;
  citations?: RulebookCitation[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  'What is the minimum ground clearance & wheelbase in Self-Manufactured class?',
  'What are the compulsory paddock stand and side stand dimensions?',
  'What are the chassis tubing and wall thickness rules?',
  'What are the battery safety and mounting requirements?',
  'What are the Kill Switch and HVS Active Lamp rules?',
  'What are the rules for brake system and hydraulic lines?',
];

export default function CopilotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Welcome to the dedicated **Riders Bay SIEP Season 7.0 Rulebook AI Portal**.\n\nAsk any question regarding **SIEP E-Bike competition regulations, technical inspection, vehicle dimensions, battery enclosure safety, or scrutiny requirements**.\n\n**Non-Overridable Policy:** Every rulebook answer is strictly grounded in the official 46-page rulebook, citing the **exact Section number and Page number** without exception.`,
          timestamp: 'Ready',
          isRulebook: false,
        },
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: historyPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to retrieve verified rulebook answer.');
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        isRulebook: data.isRulebook,
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Error: ${err.message || 'Unable to connect to Copilot service.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pt-14">
      {/* Top Bar Banner */}
      <header className="bg-slate-900 border-b border-slate-800 text-white py-3.5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  SIEP Season 7.0 Rulebook AI Copilot
                </h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                  v1.0 Official
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Official ISIEINDIA E-Bike Challenge regulations with non-overridable Section &amp; Page citations
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Dashboard</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Chat Container */}
      <main className="max-w-5xl mx-auto w-full flex-1 flex flex-col p-3 sm:p-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex-1 flex flex-col overflow-hidden">
          
          {/* Grounding Notice Strip */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>
                <strong>Strict Invariant:</strong> Answers strictly verified against official 46-page rulebook text. Outside hallucination blocked.
              </span>
            </div>
            <span className="hidden sm:inline font-mono font-bold text-[10px] text-amber-700">
              46 PAGES INDEXED
            </span>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-mono">
                  <span>{m.role === 'user' ? (user?.displayName || 'Team Member') : 'Official Scrutiny Inspector'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
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
                        <span>Official Rulebook Verification</span>
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

                  <div className="whitespace-pre-wrap font-sans text-slate-800">
                    {m.content}
                  </div>
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
                  Checking official SIEP Rulebook v1.0 &amp; asserting exact section citations...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Prompts */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Quick Inquiries:
            </span>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 px-3 py-1 rounded-full transition-colors cursor-pointer shrink-0 shadow-2xs font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any rulebook specification (e.g. ground clearance, paddock stand, kill switch, frame tubing)..."
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
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Powered by Gemini 2.0 Flash Grounded Model</span>
              <span className="text-amber-600 font-bold">Rule Citations: Non-Overridable</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
