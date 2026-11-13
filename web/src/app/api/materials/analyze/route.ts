import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocumentWithGemini, classifyDocumentHeuristically } from '@/lib/geminiService';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session required for document analysis.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Support single document or batch of documents
    if (Array.isArray(body.files)) {
      const results = await Promise.all(
        body.files.map(async (file: { fileName: string; description?: string; sampleText?: string }) => {
          return {
            fileName: file.fileName,
            analysis: await analyzeDocumentWithGemini(file.fileName, file.description, file.sampleText),
          };
        })
      );
      return NextResponse.json({ success: true, results });
    }

    const { fileName, description, sampleText } = body;
    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'fileName is required for analysis.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeDocumentWithGemini(fileName, description, sampleText);
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error in /api/materials/analyze:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}
