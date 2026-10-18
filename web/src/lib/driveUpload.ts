import { DriveUploadResponse } from './types';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB limit

/**
 * Extracts and converts various video URLs (Google Drive, YouTube, or direct MP4)
 * into a responsive inline embeddable URL.
 */
export function getEmbeddableVideoUrl(rawUrl?: string): { embedUrl: string; source: 'drive' | 'youtube' | 'direct' } | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // 1. Google Drive URLs
  // Formats:
  // - https://drive.google.com/file/d/FILE_ID/view...
  // - https://drive.google.com/file/d/FILE_ID/preview
  // - https://drive.google.com/open?id=FILE_ID
  const driveIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`,
      source: 'drive',
    };
  }

  // 2. YouTube URLs
  // Formats:
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/watch?v=VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`,
      source: 'youtube',
    };
  }

  // 3. Direct video (must have video extension or be blob/data URL)
  const isDirectVideo =
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed) ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:video/');

  if (isDirectVideo) {
    return {
      embedUrl: trimmed,
      source: 'direct',
    };
  }

  return null;
}

/**
 * High-Speed Google Drive Resumable Upload
 * Streams raw binary files up to 5 GB directly into personal Google Drive.
 * Bypasses Apps Script single HTTP 50 MB proxy limit via Drive API v3 resumable sessions.
 */
export async function uploadFileToGoogleDrive({
  file,
  teamName,
  stepTitle,
  onProgress,
}: {
  file: File;
  teamName: string;
  stepTitle: string;
  onProgress?: (percent: number) => void;
}): Promise<DriveUploadResponse> {
  const sizeMb = file.size / (1024 * 1024);

  // 1. Enforce 5 GB Limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File is ${(sizeMb / 1024).toFixed(2)} GB, exceeding the 5 GB direct upload limit. For files above 5 GB, drop the video into your Google Drive and paste the share link below.`,
    };
  }

  onProgress?.(3);

  // 2. Step 1: Create Resumable Upload Session (<1KB JSON request)
  let sessionRes;
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createResumableSession',
        filename: file.name,
        mimeType: file.type || 'video/mp4',
        fileSize: file.size,
        teamName,
        stepTitle,
      }),
    });

    sessionRes = await res.json();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Could not connect to upload gateway: ${errorMsg}. Check your internet connection.`,
    };
  }

  if (!sessionRes || !sessionRes.success || !sessionRes.uploadUrl) {
    const errText = sessionRes?.error || '';
    // If the deployed Apps Script requires UrlFetchApp external network authorization
    if (errText.includes('UrlFetchApp') || errText.includes('script.external_request')) {
      return {
        success: false,
        error: 'Google Apps Script requires external network permission. In your Apps Script editor (script.google.com), select "authorizeScript" from the function dropdown at the top, click "Run" (▶), click "Review permissions" -> "Allow", then re-deploy as "New version".',
      };
    }

    // If the deployed Apps Script is still running the old v1 script (requires base64Data)
    if (errText.includes('base64Data is required') || errText.includes('createResumableSession')) {
      // If file is small (<40MB), fallback to classic upload
      if (sizeMb <= 40) {
        return uploadClassicBase64Fallback({ file, teamName, stepTitle, onProgress });
      }
      return {
        success: false,
        error: `Your Google Apps Script needs to be updated to Version 2.0 to support ${sizeMb.toFixed(0)} MB uploads. Please copy the updated script from web/scripts/google-apps-script.js into your Google Apps Script editor and deploy a New Version. Or paste your Google Drive link on the right.`,
      };
    }

    return {
      success: false,
      error: sessionRes?.error || 'Failed to initiate Google Drive upload session.',
    };
  }

  const uploadUrl = sessionRes.uploadUrl;
  onProgress?.(8);

  // 3. Step 2: Stream raw binary file directly to Google Drive uploadUrl
  // First attempt: Direct browser-to-Drive PUT (zero server load, maximum bandwidth)
  let uploadedFileId: string | null = null;
  try {
    uploadedFileId = await uploadBinaryDirect(uploadUrl, file, (p) => {
      // Map 0-100% of binary upload to 8% -> 92% of overall progress
      const mapped = 8 + Math.round((p / 100) * 84);
      onProgress?.(mapped);
    });
  } catch (directErr) {
    console.warn('Direct browser PUT failed (likely browser CORS policy). Falling back to Node streaming bridge...', directErr);
    // Fallback: Stream via Node.js server bridge (zero CORS issues, streaming buffer)
    try {
      uploadedFileId = await uploadBinaryViaProxy(uploadUrl, file, (p) => {
        const mapped = 8 + Math.round((p / 100) * 84);
        onProgress?.(mapped);
      });
    } catch (proxyErr) {
      const msg = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
      return {
        success: false,
        error: `Binary data stream failed: ${msg}. Please verify your network stability or paste a Google Drive link.`,
      };
    }
  }

  if (!uploadedFileId) {
    return {
      success: false,
      error: 'Google Drive finished upload but did not return a valid file ID.',
    };
  }

  onProgress?.(94);

  // 4. Step 3: Finalize file permissions and generate public embed/view URLs
  try {
    const finRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'finalizeFile',
        fileId: uploadedFileId,
      }),
    });

    const finalizeData = await finRes.json();
    onProgress?.(100);

    if (finalizeData.success) {
      return {
        success: true,
        fileId: finalizeData.fileId,
        viewUrl: finalizeData.viewUrl,
        embedUrl: finalizeData.embedUrl,
      };
    } else {
      // If finalize failed, we still have the file ID
      const fallbackEmbed = `https://drive.google.com/file/d/${uploadedFileId}/preview`;
      return {
        success: true,
        fileId: uploadedFileId,
        viewUrl: `https://drive.google.com/file/d/${uploadedFileId}/view`,
        embedUrl: fallbackEmbed,
      };
    }
  } catch (err) {
    console.warn('Error calling finalizeFile, using direct fileId links:', err);
    onProgress?.(100);
    return {
      success: true,
      fileId: uploadedFileId,
      viewUrl: `https://drive.google.com/file/d/${uploadedFileId}/view`,
      embedUrl: `https://drive.google.com/file/d/${uploadedFileId}/preview`,
    };
  }
}

/**
 * Streams raw binary directly to Google Drive via XMLHttpRequest
 */
function uploadBinaryDirect(uploadUrl: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress?.(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const resp = JSON.parse(xhr.responseText);
          if (resp && resp.id) {
            resolve(resp.id);
          } else {
            reject(new Error('Google Drive response missing file id.'));
          }
        } catch {
          reject(new Error(`Could not parse Drive response: ${xhr.responseText.slice(0, 150)}`));
        }
      } else {
        reject(new Error(`Google Drive returned status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Browser network or CORS error during direct upload'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload connection timed out'));
    };

    xhr.send(file);
  });
}

/**
 * Streams raw binary through /api/upload?action=proxyUpload to bypass browser CORS
 */
function uploadBinaryViaProxy(uploadUrl: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const proxyEndpoint = `/api/upload?action=proxyUpload&uploadUrl=${encodeURIComponent(uploadUrl)}`;
    xhr.open('POST', proxyEndpoint, true);
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress?.(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const resp = JSON.parse(xhr.responseText);
          if (resp.success && resp.fileId) {
            resolve(resp.fileId);
          } else {
            reject(new Error(resp.error || 'Server proxy failed to extract file ID'));
          }
        } catch {
          reject(new Error(`Invalid proxy response: ${xhr.responseText.slice(0, 150)}`));
        }
      } else {
        reject(new Error(`Server proxy error ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Server bridge network failure during upload streaming.'));
    };

    xhr.send(file);
  });
}

/**
 * Classic Base64 Fallback (for smaller files <40 MB if running on legacy script)
 */
async function uploadClassicBase64Fallback({
  file,
  teamName,
  stepTitle,
  onProgress,
}: {
  file: File;
  teamName: string;
  stepTitle: string;
  onProgress?: (percent: number) => void;
}): Promise<DriveUploadResponse> {
  onProgress?.(20);
  const base64Data = await readFileAsBase64(file);
  onProgress?.(50);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type || 'video/mp4',
      base64Data,
      teamName,
      stepTitle,
    }),
  });

  onProgress?.(90);
  const data = await res.json();
  onProgress?.(100);

  if (data.success) {
    return {
      success: true,
      fileId: data.fileId,
      viewUrl: data.viewUrl,
      embedUrl: data.embedUrl,
    };
  } else {
    return {
      success: false,
      error: data.error || 'Failed to upload file via classic method.',
    };
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.substring(commaIdx + 1) : result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
