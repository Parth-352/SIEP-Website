import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';
import {
  isRulebookQuestion,
  isBikeQuestion,
  searchRulebook,
  extractCitations,
  synthesizeDeterministicReply,
  RIDERS_BAY_VEHICLE_KNOWLEDGE,
  RulebookCitation,
  ScoredPage,
} from '@/lib/rulebookService';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * GET /api/ai/copilot
 * If accessed directly via browser URL bar, redirects gracefully to /copilot.
 * If accessed via an API consumer, returns service status and metadata.
 */
export async function GET(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  if (acceptHeader.includes('text/html')) {
    return NextResponse.redirect(new URL('/copilot', request.url));
  }

  return NextResponse.json({
    success: true,
    service: 'SIEP Season 7.0 Rulebook & Vehicle AI Copilot',
    status: 'online',
    rulebook: 'ISIEINDIA SIEP E-Bike Challenge Season 7.0 Official Rulebook v1.0',
    totalPages: 46,
    usage: 'Submit a POST request with JSON body { message: string, conversationHistory?: [] }',
    directPage: '/copilot',
  });
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    const userRole = session
      ? session.isCore
        ? 'Core Leadership'
        : session.isLead
        ? 'Squad Lead'
        : 'Team Member'
      : 'Guest / Team Member';
    const userName = session ? session.name : 'Riders Bay Engineer';

    const body = await request.json();
    const { message, conversationHistory = [] }: { message: string; conversationHistory: ChatMessage[] } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Query message is required.' }, { status: 400 });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    const isRulebook = isRulebookQuestion(message);
    const isBike = isBikeQuestion(message);

    // Retrieve relevant rulebook excerpts
    const topPages: ScoredPage[] = searchRulebook(message, 4);
    const rulebookExcerpts = topPages.length > 0
      ? topPages.map((p) => `--- OFFICIAL RULEBOOK EXCERPT: PAGE ${p.page} ---\n${p.text}`).join('\n\n')
      : 'No direct keyword match found in rulebook index.';

    // Construct Grounded Chatbot System Prompt
    const systemPrompt = `You are the AI Engineering Copilot for Riders Bay (SNJB's KBJ College of Engineering, Chandwad) competing in the ISIEINDIA SIEP E-Bike Challenge Season 7.0.
Current User: ${userName} (${userRole}).

KNOWLEDGE BASE:
1. OFFICIAL SIEP SEASON 7.0 RULEBOOK (v1.0):
${rulebookExcerpts}

2. RIDERS BAY VEHICLE ARCHITECTURE & TEAM:
${RIDERS_BAY_VEHICLE_KNOWLEDGE}

CHATBOT BEHAVIOR MANDATES:
1. CHATBOT PERSONA:
   - Speak naturally, directly, and concisely like an expert engineering teammate.
   - NEVER use robotic fluff (e.g. "Greetings, Riders Bay Engineer. My primary function is to serve as...").
   - Jump straight to the point.
2. PROMINENT & CONCISE:
   - Put key answers, numbers, and dimensions prominently at the top in bold.
   - Keep answers tight and readable: 2 to 4 sentences or a short bulleted list.
3. OFFICIAL RULEBOOK CITATIONS:
   - When citing competition regulations, dimensions, safety standards, or scrutiny: Mention the exact Section (e.g. "Section C.2.1.2") and Page Number (e.g. "Page 16").
   - Append this machine-readable citation tag at the end of your response:
     <<<CITATION:{"section": "C.2.1.2", "clause": "b", "page": 16, "topic": "Minimum Ground Clearance"}>>>
4. RIDERS BAY SCRAMBLER SPECS:
   - For vehicle questions (motor, battery, chassis, suspension, CAN-bus, team roster), answer authoritatively using the Riders Bay vehicle knowledge.
5. ZERO EMOJIS: Never output emojis.`;

    // Try Gemini API if key is available
    if (apiKey) {
      const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
      const modelsToTry = [
        preferredModel,
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-2.5-flash',
        'gemini-flash-latest',
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      // Clean and sanitize recent conversation history
      const sanitizedHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
      const historySlice = conversationHistory.slice(-6);

      for (const msg of historySlice) {
        if (!msg.content || msg.content.startsWith('Welcome to')) continue;
        const role = msg.role === 'assistant' ? 'model' : 'user';

        // Gemini requires strict role alternation starting with 'user'
        if (sanitizedHistory.length === 0 && role === 'model') continue;
        if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === role) {
          sanitizedHistory[sanitizedHistory.length - 1].parts[0].text += `\n\n${msg.content}`;
        } else {
          sanitizedHistory.push({ role, parts: [{ text: msg.content }] });
        }
      }

      for (const model of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          // Try with systemInstruction first
          const payload = {
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              ...sanitizedHistory,
              {
                role: 'user',
                parts: [{ text: message }],
              },
            ],
            generationConfig: {
              temperature: isRulebook && !isBike ? 0.05 : 0.25,
              maxOutputTokens: 1000,
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const json = await res.json();
            const rawResponse = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (rawResponse) {
              const { cleanReply, citations } = extractCitations(rawResponse, topPages, isRulebook);

              return NextResponse.json({
                success: true,
                reply: cleanReply,
                isRulebook,
                citations,
                modelUsed: model,
              });
            }
          } else {
            console.warn(`Gemini model ${model} returned HTTP ${res.status}:`, await res.text().catch(() => ''));
          }
        } catch (modelErr) {
          console.warn(`Error querying Gemini model ${model}:`, modelErr);
        }
      }
    }

    // Fallback: Deterministic Synthesis Engine
    // Runs instantaneously if Gemini API key is missing, rate-limited, or offline
    const deterministicResult = synthesizeDeterministicReply(message, topPages);
    return NextResponse.json({
      success: true,
      reply: deterministicResult.reply,
      isRulebook: deterministicResult.isRulebook,
      citations: deterministicResult.citations,
      modelUsed: 'deterministic-knowledge-engine',
    });
  } catch (error: any) {
    console.error('Error in AI Copilot route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error in Copilot pipeline.' },
      { status: 500 }
    );
  }
}
