"use client";

import React, { useState } from 'react';

interface MarkdownMessageProps {
  content: string;
}

/**
 * Lightweight, zero-dependency Markdown renderer tailored for technical AI chat.
 * Renders headers, lists, code blocks with copy action, blockquotes, bold/italic text, and inline code.
 */
export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to render inline elements (bold, italic, inline code)
  const renderInline = (text: string): React.ReactNode => {
    // Regex matches inline code `code`, bold **text**, and italic *text*
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // 1. Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={keyIdx++}
            className="font-mono text-[11px] bg-slate-100 text-orange-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // 2. Bold text: **bold**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-slate-900">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // 3. Italic text: *italic* or _italic_
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-700">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Next plain segment up to next special char
      const nextSpecial = remaining.search(/[`*]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  // Break content into blocks: Code blocks vs Text lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let blockQuoteLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul_${elements.length}`} className="list-disc pl-5 space-y-1 my-2 text-slate-800">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushBlockQuote = () => {
    if (blockQuoteLines.length > 0) {
      const quoteText = blockQuoteLines.join('\n');
      elements.push(
        <blockquote
          key={`quote_${elements.length}`}
          className="border-l-3 border-amber-500 bg-amber-50/70 rounded-r-xl px-3.5 py-2 my-2.5 text-xs text-amber-950 font-medium space-y-1 shadow-2xs"
        >
          {quoteText.split('\n').map((qLine, qIdx) => (
            <p key={qIdx} className="leading-relaxed">
              {renderInline(qLine)}
            </p>
          ))}
        </blockquote>
      );
      blockQuoteLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code Block Fence (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeContent = codeBlockLines.join('\n');
        const blockIdx = elements.length;
        elements.push(
          <div key={`code_${blockIdx}`} className="my-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-sm font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="uppercase font-bold tracking-wider">{codeBlockLang || 'EXCERPT'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeContent, blockIdx)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                {copiedIndex === blockIdx ? (
                  <span className="text-emerald-400 font-bold">Copied</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed text-[11px] whitespace-pre">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        flushList();
        flushBlockQuote();
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // 2. Blockquote (> ...)
    if (line.trim().startsWith('>')) {
      flushList();
      blockQuoteLines.push(line.replace(/^>\s?/, ''));
      continue;
    } else {
      flushBlockQuote();
    }

    // 3. Headers
    if (line.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4_${i}`} className="font-bold text-xs text-slate-900 mt-2 mb-1 uppercase tracking-wider">
          {renderInline(line.slice(5))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3_${i}`} className="font-bold text-sm text-slate-950 mt-2.5 mb-1 flex items-center gap-1.5">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2_${i}`} className="font-extrabold text-sm sm:text-base text-slate-950 mt-3 mb-1.5 pb-1 border-b border-slate-200">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1_${i}`} className="font-extrabold text-base sm:text-lg text-slate-950 mt-3 mb-1.5 pb-1 border-b border-slate-300">
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // 4. Horizontal Rules
    if (line.trim() === '---' || line.trim() === '***') {
      flushList();
      elements.push(<hr key={`hr_${i}`} className="border-t border-slate-200 my-3" />);
      continue;
    }

    // 5. Unordered List Items (- or *)
    const listMatch = line.match(/^(\s*)([-*])\s+(.+)$/);
    if (listMatch) {
      inList = true;
      listItems.push(
        <li key={`li_${i}`} className="leading-relaxed text-xs sm:text-[13px]">
          {renderInline(listMatch[3])}
        </li>
      );
      continue;
    } else {
      flushList();
    }

    // 6. Empty Line
    if (!line.trim()) {
      continue;
    }

    // 7. Regular Paragraph
    elements.push(
      <p key={`p_${i}`} className="my-1.5 leading-relaxed text-xs sm:text-[13px] text-slate-800">
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  flushBlockQuote();

  return <div className="space-y-0.5 font-sans leading-relaxed">{elements}</div>;
}
