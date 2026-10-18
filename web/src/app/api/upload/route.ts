import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';

/**
 * Universal Server-Side Video Upload Gateway for Riders Bay (SIEP).
 * Handles:
 *  1. Resumable Session Creation (tiny <1KB payload to Apps Script)
 *  2. File Finalization (sets public link permissions and generates embeds)
 *  3. Binary Proxy Streaming (bypasses browser CORS for large 500MB uploads when direct PUT is blocked)
 *  4. Classic Base64 Upload (for legacy small clips)
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in before uploading video evidence.' },
        { status: 401 }
      );
    }

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL?.trim();
    if (!scriptUrl) {
      return NextResponse.json(
        { success: false, error: 'Google Apps Script URL is not configured in .env.local.' },
        { status: 500 }
      );
    }

    // Check if this is a binary streaming proxy request
    const actionQuery = request.nextUrl.searchParams.get('action');
    if (actionQuery === 'proxyUpload') {
      const targetUploadUrl = request.nextUrl.searchParams.get('uploadUrl');
      if (!targetUploadUrl) {
        return NextResponse.json(
          { success: false, error: 'Missing uploadUrl parameter for proxy streaming.' },
          { status: 400 }
        );
      }

      // Stream binary body directly to Google Drive uploadUrl without loading into RAM
      const contentType = request.headers.get('content-type') || 'video/mp4';
      const contentLength = request.headers.get('content-length');

      const headers: Record<string, string> = {
        'Content-Type': contentType,
      };
      if (contentLength) {
        headers['Content-Length'] = contentLength;
      }

      const driveRes = await fetch(targetUploadUrl, {
        method: 'PUT',
        headers,
        body: request.body,
        // @ts-expect-error duplex is required for streaming in Node 18+
        duplex: 'half',
      });

      const driveText = await driveRes.text();
      let driveData;
      try {
        driveData = JSON.parse(driveText);
      } catch {
        driveData = { raw: driveText };
      }

      if (!driveRes.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Google Drive upload rejected with HTTP ${driveRes.status}: ${driveText.slice(0, 200)}`,
          },
          { status: driveRes.status }
        );
      }

      return NextResponse.json({
        success: true,
        fileId: driveData.id || driveData.fileId,
        driveData,
      });
    }

    // Otherwise, parse JSON command payload
    const body = await request.json();
    const action = body.action || (body.base64Data ? 'classic' : 'createResumableSession');

    if (action === 'createResumableSession') {
      const payload = {
        action: 'createResumableSession',
        filename: body.filename || `clip_${Date.now()}.mp4`,
        mimeType: body.mimeType || 'video/mp4',
        fileSize: body.fileSize || 0,
        teamName: body.teamName || session.teamId,
        stepTitle: body.stepTitle || 'Step Update',
        origin: request.headers.get('origin') || '',
      };

      const res = await callAppsScript(scriptUrl, payload);
      return NextResponse.json(res.data, { status: res.status });
    }

    if (action === 'finalizeFile') {
      const payload = {
        action: 'finalizeFile',
        fileId: body.fileId,
      };

      const res = await callAppsScript(scriptUrl, payload);
      return NextResponse.json(res.data, { status: res.status });
    }

    // Classic Base64 fallback
    const payload = {
      action: 'classic',
      filename: body.filename || `clip_${Date.now()}.mp4`,
      mimeType: body.mimeType || 'video/mp4',
      base64Data: body.base64Data,
      teamName: body.teamName || session.teamId,
      stepTitle: body.stepTitle || 'Step Update',
    };

    const res = await callAppsScript(scriptUrl, payload);
    return NextResponse.json(res.data, { status: res.status });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('API /api/upload error:', err);
    return NextResponse.json(
      { success: false, error: `Upload server bridge error: ${errorMsg}` },
      { status: 500 }
    );
  }
}

/**
 * Helper to call Google Apps Script Web App following redirects server-to-server
 */
async function callAppsScript(scriptUrl: string, payload: unknown) {
  const res = await fetch(scriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      status: 502,
      data: {
        success: false,
        error: `Invalid response from Google Apps Script. Raw response: ${text.slice(0, 200)}`,
      },
    };
  }

  if (!res.ok || (data && data.success === false)) {
    return {
      status: res.ok ? 400 : res.status,
      data: {
        success: false,
        error: data?.error || `Google Apps Script returned HTTP ${res.status}`,
      },
    };
  }

  return {
    status: 200,
    data,
  };
}
