/**
 * ============================================================================
 * RIDERS BAY (SIEP E-BIKE) — PERSONAL GOOGLE DRIVE UPLOAD WEB APP SCRIPT
 * Version: 2.0 (High-Speed Resumable Upload Architecture: Up to 5 GB)
 * ============================================================================
 * 
 * INSTRUCTIONS FOR DEPLOYMENT / UPDATE (Takes 1-2 minutes):
 * 1. Open https://script.google.com/ in your browser.
 * 2. Open your existing project (e.g. "SIEP Video Uploader") or click "+ New Project".
 * 3. Replace all code in "Code.gs" with this entire file.
 * 4. Click "Deploy" (top right) -> "Manage deployments".
 * 5. Click the Edit (pencil) icon next to your active deployment.
 * 6. Under "Version", select "New version" (Description: "v2.0 5GB Resumable").
 * 7. Ensure "Execute as": "Me (<your-email>)"
 * 8. Ensure "Who has access": "Anyone"  <-- CRITICAL for public uploads to work!
 * 9. Click "Deploy".
 * 10. If prompted, click "Authorize access", choose your Google account, 
 *     click "Advanced", and click "Go to SIEP Video Uploader (unsafe)".
 * ============================================================================
 */

const ROOT_FOLDER_NAME = "SIEP Team Logs";

/**
 * ============================================================================
 * ONE-CLICK PERMISSION AUTHORIZER:
 * ============================================================================
 * In the Apps Script toolbar at the top:
 * 1. Select "authorizeScript" in the function dropdown (next to "Run" and "Debug").
 * 2. Click "Run" (▶).
 * 3. When the popup appears: "Authorization required"
 *    -> Click "Review permissions"
 *    -> Choose your Google Account
 *    -> Click "Advanced" (bottom left)
 *    -> Click "Go to SIEP Video Uploader (unsafe)"
 *    -> Click "Allow"
 * 4. Done! This permanently authorizes UrlFetchApp & DriveApp for your script.
 * 5. Now click "Deploy" -> "Manage deployments" -> Edit (pencil) -> Version: "New version" -> "Deploy".
 * ============================================================================
 */
function authorizeScript() {
  DriveApp.getRootFolder();
  UrlFetchApp.fetch("https://www.google.com");
  Logger.log("ALL PERMISSIONS AUTHORIZED! You can now deploy and upload 5 GB files.");
}


/**
 * Handles incoming POST requests.
 * Supports:
 *  1. action = "createResumableSession" (Fast <1KB session initiation for up to 5 GB uploads)
 *  2. action = "finalizeFile" (Sets sharing permission and generates embed links)
 *  3. action = "classic" / base64Data (Legacy base64 upload for smaller clips)
 */
function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return responseJSON({ success: false, error: "No post data received" });
    }

    const action = data.action || (data.base64Data ? "classic" : "createResumableSession");

    if (action === "sendInquiryMail") {
      return handleSendInquiryMail(data);
    } else if (action === "createResumableSession") {
      return handleCreateResumableSession(data);
    } else if (action === "finalizeFile") {
      return handleFinalizeFile(data);
    } else {
      return handleClassicUpload(data);
    }

  } catch (err) {
    return responseJSON({
      success: false,
      error: "Apps Script doPost error: " + err.toString()
    });
  }
}

/**
 * STEP 1: Initiates a Google Drive Resumable Upload Session (Tiny payload <1KB).
 * Returns the resumable upload URL directly from Google Drive API v3.
 */
function handleCreateResumableSession(data) {
  try {
    const filename = data.filename || "clip_" + Date.now() + ".mp4";
    const mimeType = data.mimeType || "video/mp4";
    const teamName = data.teamName || "General";
    const stepTitle = data.stepTitle || "Step Update";
    const fileSize = data.fileSize || 0;
    const clientOrigin = data.origin || "";

    // 1. Get or create root & team destination folder
    const targetFolder = getOrCreateFolder(ROOT_FOLDER_NAME);
    const sanitizedTeam = teamName.replace(/[^a-zA-Z0-9 &_-]/g, "");
    const destinationFolder = getOrCreateSubfolder(targetFolder, sanitizedTeam);

    // 2. Format final standardized filename
    const datePrefix = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm");
    const sanitizedTitle = stepTitle.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    const finalFilename = `[${sanitizedTeam}]_${datePrefix}_${sanitizedTitle}_${filename}`;

    // 3. Initiate Google Drive v3 Resumable Session using script OAuth token
    const metadata = {
      name: finalFilename,
      parents: [destinationFolder.getId()]
    };

    const headers = {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType
    };

    if (fileSize > 0) {
      headers["X-Upload-Content-Length"] = fileSize.toString();
    }

    if (clientOrigin) {
      headers["Origin"] = clientOrigin;
    }

    const apiUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
    const res = UrlFetchApp.fetch(apiUrl, {
      method: "POST",
      headers: headers,
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true
    });

    const statusCode = res.getResponseCode();
    const allHeaders = res.getAllHeaders();
    const uploadUrl = allHeaders["Location"] || allHeaders["location"];

    if (!uploadUrl || (statusCode !== 200 && statusCode !== 201)) {
      return responseJSON({
        success: false,
        error: "Google Drive API failed to initiate resumable session: HTTP " + statusCode + " - " + res.getContentText()
      });
    }

    return responseJSON({
      success: true,
      action: "createResumableSession",
      uploadUrl: uploadUrl,
      filename: finalFilename,
      folderId: destinationFolder.getId()
    });

  } catch (err) {
    return responseJSON({
      success: false,
      error: "Error in handleCreateResumableSession: " + err.toString()
    });
  }
}

/**
 * STEP 3: Finalizes the uploaded file permissions.
 * Sets sharing to ANYONE_WITH_LINK (View) and constructs streaming & preview URLs.
 */
function handleFinalizeFile(data) {
  try {
    const fileId = data.fileId;
    if (!fileId) {
      return responseJSON({ success: false, error: "fileId is required to finalize upload." });
    }

    const file = DriveApp.getFileById(fileId);
    
    // Set permission so video embeds and streams work on website without authentication
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const filename = file.getName();
    const viewUrl = file.getUrl();
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const directStreamUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return responseJSON({
      success: true,
      fileId: fileId,
      filename: filename,
      viewUrl: viewUrl,
      embedUrl: embedUrl,
      directStreamUrl: directStreamUrl
    });

  } catch (err) {
    return responseJSON({
      success: false,
      error: "Error finalizing file: " + err.toString()
    });
  }
}

/**
 * Legacy Base64 Upload (for backwards compatibility with smaller files)
 */
function handleClassicUpload(data) {
  try {
    const filename = data.filename || "upload_" + new Date().getTime() + ".mp4";
    const mimeType = data.mimeType || "video/mp4";
    const base64Data = data.base64Data;
    const teamName = data.teamName || "General";
    const stepTitle = data.stepTitle || "Step Update";

    if (!base64Data) {
      return responseJSON({ success: false, error: "base64Data is required for classic upload" });
    }

    const targetFolder = getOrCreateFolder(ROOT_FOLDER_NAME);
    const sanitizedTeam = teamName.replace(/[^a-zA-Z0-9 &_-]/g, "");
    const destinationFolder = getOrCreateSubfolder(targetFolder, sanitizedTeam);

    const decodedBytes = Utilities.base64Decode(base64Data);
    const datePrefix = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm");
    const sanitizedTitle = stepTitle.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    const finalFilename = `[${sanitizedTeam}]_${datePrefix}_${sanitizedTitle}_${filename}`;

    const blob = Utilities.newBlob(decodedBytes, mimeType, finalFilename);
    const file = destinationFolder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const viewUrl = file.getUrl();
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const directStreamUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return responseJSON({
      success: true,
      fileId: fileId,
      filename: finalFilename,
      viewUrl: viewUrl,
      embedUrl: embedUrl,
      directStreamUrl: directStreamUrl
    });
  } catch (err) {
    return responseJSON({
      success: false,
      error: "Classic upload error: " + err.toString()
    });
  }
}

/**
 * Health check & diagnostic endpoint
 */
function doGet(e) {
  return responseJSON({
    status: "ok",
    version: "2.0-resumable-500mb",
    message: "Riders Bay SIEP Google Drive Resumable Uploader is online.",
    targetFolder: ROOT_FOLDER_NAME,
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper: Find or create root folder
 */
function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}

/**
 * Helper: Find or create subfolder inside parent
 */
function getOrCreateSubfolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(name);
}

/**
 * Handles sending partner inquiry email to ebikeclubcoe@snjb.org
 */
function handleSendInquiryMail(data) {
  try {
    const to = data.to || "ebikeclubcoe@snjb.org";
    const name = data.name || "Anonymous";
    const email = data.email || "no-reply@ridersbay.com";
    const phone = data.phone || "Not provided";
    const organization = data.organization || "Individual";
    const message = data.message || "No message content provided.";

    const htmlBody = 
      '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden; background-color: #FFFFFF;">' +
        '<div style="background-color: #1F242E; padding: 24px 28px; color: #FFFFFF; border-bottom: 3px solid #F97316;">' +
          '<div style="color: #F97316; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">SIEP E-BIKE 2026 // RIDERS BAY</div>' +
          '<h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">New Partnership Inquiry</h1>' +
        '</div>' +
        '<div style="padding: 28px; color: #1F2937; line-height: 1.6; font-size: 14px;">' +
          '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' +
            '<tr><td style="padding: 8px 0; color: #6B7280; width: 140px; font-weight: 600;">Full Name:</td><td style="padding: 8px 0; font-weight: 700; color: #111827;">' + name + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Organization / Role:</td><td style="padding: 8px 0; color: #111827;">' + organization + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Email:</td><td style="padding: 8px 0;"><a href="mailto:' + email + '" style="color: #F97316; text-decoration: none; font-weight: 600;">' + email + '</a></td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Phone / WhatsApp:</td><td style="padding: 8px 0; color: #111827;">' + phone + '</td></tr>' +
          '</table>' +
          '<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />' +
          '<div style="font-weight: 700; color: #374151; margin-bottom: 8px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Inquiry Message:</div>' +
          '<div style="background-color: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0; white-space: pre-wrap; font-size: 14px; color: #0F172A;">' + message + '</div>' +
          '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #94A3B8; text-align: center;">' +
            'Received via Riders Bay Partner Portal • Direct Reply-To configured for ' + email +
          '</div>' +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: to,
      replyTo: email,
      subject: "⚡ New Partner Inquiry: " + name + " (" + organization + ")",
      htmlBody: htmlBody
    });

    return responseJSON({
      success: true,
      message: "Inquiry email sent successfully to " + to
    });
  } catch (mailErr) {
    return responseJSON({
      success: false,
      error: "MailApp error: " + mailErr.toString()
    });
  }
}

/**
 * Formats JSON response
 */
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Internal stub to ensure Apps Script automatically requests Drive, UrlFetch & Mail scopes
 */
function _forceAuthScopes() {
  DriveApp.getRootFolder();
  UrlFetchApp.fetch("https://www.google.com");
  MailApp.getRemainingDailyQuota();
}
