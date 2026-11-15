/**
 * 🤖 COPILOT SUITE - AGENT INDEX MANIFEST
 * =====================================
 * This directory hosts the Season 7.0 Rulebook AI Copilot component architecture.
 * All files are strictly constrained below 300 lines.
 *
 * FILES IN THIS SUITE:
 * 1. types.ts (~20 lines)
 *    - Data interfaces: ChatMessage, RulebookCitation, COPILOT_QUICK_PROMPTS
 * 2. CopilotHeader.tsx (~45 lines)
 *    - Navigation bar, Clear Chat button, link to Dashboard
 * 3. CopilotMessageList.tsx (~135 lines)
 *    - Message stream, verified citations header, markdown render, copy actions, typing indicator
 * 4. CopilotPromptPills.tsx (~30 lines)
 *    - Horizontal pill bar with 6 quick technical prompt queries
 * 5. CopilotInputForm.tsx (~40 lines)
 *    - Input field and submit action button
 * 6. MarkdownMessage.tsx (~180 lines)
 *    - Rich custom markdown renderer for formulas, bullet points, and code
 * 7. RulebookCopilotDrawer.tsx (~280 lines)
 *    - Slide-over drawer version of Copilot used inside Dashboard overview
 */

export * from './types';
export { default as CopilotHeader } from './CopilotHeader';
export { default as CopilotMessageList } from './CopilotMessageList';
export { default as CopilotPromptPills } from './CopilotPromptPills';
export { default as CopilotInputForm } from './CopilotInputForm';
export { default as MarkdownMessage } from './MarkdownMessage';
export { default as RulebookCopilotDrawer } from './RulebookCopilotDrawer';
