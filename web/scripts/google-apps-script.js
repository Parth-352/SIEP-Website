/**
 * ============================================================================
 * RIDERS BAY (SIEP E-BIKE) — PERSONAL GOOGLE DRIVE UPLOAD WEB APP SCRIPT
 * Version: 2.1 (With Forgot Password OTP)
 * ============================================================================
 * 
 * INSTRUCTIONS FOR DEPLOYMENT / UPDATE (Takes 1-2 minutes):
 * 1. Open https://script.google.com/ in your browser.
 * 2. Open your existing project (e.g. "SIEP Video Uploader") or click "+ New Project".
 * 3. Replace all code in "Code.gs" with this entire file.
 * 4. Click "Deploy" (top right) -> "Manage deployments".
 * 5. Click the Edit (pencil) icon next to your active deployment.
 * 6. Under "Version", select "New version" (Description: "v2.1 + OTP").
 * 7. Ensure "Execute as": "Me (<your-email>)"
 * 8. Ensure "Who has access": "Anyone"  <-- CRITICAL for public uploads to work!
 * 9. Click "Deploy".
 * 10. If prompted, click "Authorize access", choose your Google account, 
 *     click "Advanced", and click "Go to SIEP Video Uploader (unsafe)".
 * ============================================================================
 */

var ROOT_FOLDER_NAME = "SIEP Team Logs";

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
  MailApp.getRemainingDailyQuota();
  Logger.log("ALL PERMISSIONS AUTHORIZED (Drive, UrlFetch, Mail)! You can now deploy.");
}


/**
 * Handles incoming POST requests.
 * Supports:
 *  1. action = "createResumableSession"
 *  2. action = "finalizeFile"
 *  3. action = "sendInquiryMail"
 *  4. action = "sendForgotPasswordOTP"  <-- NEW
 *  5. action = "classic" / base64Data
 */
function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return responseJSON({ success: false, error: "No post data received" });
    }

    var action = data.action || (data.base64Data ? "classic" : "createResumableSession");

    if (action === "sendInquiryMail") {
      return handleSendInquiryMail(data);
    } else if (action === "sendForgotPasswordOTP") {
      return handleSendForgotPasswordOTP(data);
    } else if (action === "updateTeamPassword") {
      return handleUpdateTeamPassword(data);
    } else if (action === "getTeamPasswords") {
      return handleGetTeamPasswords();
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
 * STEP 1: Initiates a Google Drive Resumable Upload Session.
 */
function handleCreateResumableSession(data) {
  try {
    var filename = data.filename || "clip_" + Date.now() + ".mp4";
    var mimeType = data.mimeType || "video/mp4";
    var teamName = data.teamName || "General";
    var stepTitle = data.stepTitle || "Step Update";
    var fileSize = data.fileSize || 0;
    var clientOrigin = data.origin || "";

    var targetFolder = getOrCreateFolder(ROOT_FOLDER_NAME);
    var sanitizedTeam = teamName.replace(/[^a-zA-Z0-9 &_-]/g, "");
    var destinationFolder = getOrCreateSubfolder(targetFolder, sanitizedTeam);

    var datePrefix = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm");
    var sanitizedTitle = stepTitle.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    var finalFilename = "[" + sanitizedTeam + "]_" + datePrefix + "_" + sanitizedTitle + "_" + filename;

    var metadata = {
      name: finalFilename,
      parents: [destinationFolder.getId()]
    };

    var headers = {
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

    var apiUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
    var res = UrlFetchApp.fetch(apiUrl, {
      method: "POST",
      headers: headers,
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true
    });

    var statusCode = res.getResponseCode();
    var allHeaders = res.getAllHeaders();
    var uploadUrl = allHeaders["Location"] || allHeaders["location"];

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
 */
function handleFinalizeFile(data) {
  try {
    var fileId = data.fileId;
    if (!fileId) {
      return responseJSON({ success: false, error: "fileId is required to finalize upload." });
    }

    var file = DriveApp.getFileById(fileId);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var filename = file.getName();
    var viewUrl = file.getUrl();
    var embedUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    var directStreamUrl = "https://drive.google.com/uc?export=view&id=" + fileId;

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
    var filename = data.filename || "upload_" + new Date().getTime() + ".mp4";
    var mimeType = data.mimeType || "video/mp4";
    var base64Data = data.base64Data;
    var teamName = data.teamName || "General";
    var stepTitle = data.stepTitle || "Step Update";

    if (!base64Data) {
      return responseJSON({ success: false, error: "base64Data is required for classic upload" });
    }

    var targetFolder = getOrCreateFolder(ROOT_FOLDER_NAME);
    var sanitizedTeam = teamName.replace(/[^a-zA-Z0-9 &_-]/g, "");
    var destinationFolder = getOrCreateSubfolder(targetFolder, sanitizedTeam);

    var decodedBytes = Utilities.base64Decode(base64Data);
    var datePrefix = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm");
    var sanitizedTitle = stepTitle.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    var finalFilename = "[" + sanitizedTeam + "]_" + datePrefix + "_" + sanitizedTitle + "_" + filename;

    var blob = Utilities.newBlob(decodedBytes, mimeType, finalFilename);
    var file = destinationFolder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var viewUrl = file.getUrl();
    var embedUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    var directStreamUrl = "https://drive.google.com/uc?export=view&id=" + fileId;

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
    version: "2.1-with-otp",
    message: "Riders Bay SIEP Google Drive Resumable Uploader is online.",
    targetFolder: ROOT_FOLDER_NAME,
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper: Find or create root folder
 */
function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}

/**
 * Helper: Find or create subfolder inside parent
 */
function getOrCreateSubfolder(parent, name) {
  var folders = parent.getFoldersByName(name);
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
    var to = data.to || "ebikeclubcoe@snjb.org";
    var name = data.name || "Anonymous";
    var email = data.email || "no-reply@ridersbay.com";
    var phone = data.phone || "Not provided";
    var organization = data.organization || "Individual";
    var message = data.message || "No message content provided.";

    var htmlBody = 
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
      subject: "New Partner Inquiry: " + name + " (" + organization + ")",
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
 * Handles sending Forgot Password OTP email to the single SIEP admin mailbox.
 * Includes which team/domain is requesting the reset to prevent abuse.
 */
function handleSendForgotPasswordOTP(data) {
  try {
    var to = data.to || "snjbebikeclub@gmail.com";
    var otp = data.otp || "000000";
    var teamCode = data.teamCode || "???";
    var teamName = data.teamName || "Unknown Team";
    var teamEmail = data.teamEmail || "unknown@ridersbay.com";
    var teamLead = data.teamLead || "Unknown";
    var timestamp = data.timestamp || new Date().toLocaleString();
    var expiryMinutes = data.expiryMinutes || 5;

    var htmlBody =
      '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden; background-color: #FFFFFF;">' +
        '<div style="background-color: #1F242E; padding: 24px 28px; color: #FFFFFF; border-bottom: 3px solid #F97316;">' +
          '<div style="color: #F97316; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">SIEP E-BIKE 2026 // RIDERS BAY SECURITY</div>' +
          '<h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Password Reset OTP</h1>' +
        '</div>' +
        '<div style="padding: 28px; color: #1F2937; line-height: 1.6; font-size: 14px;">' +

          '<div style="background-color: #FFF7ED; border: 2px solid #FDBA74; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">' +
            '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #9A3412; font-weight: 700; margin-bottom: 8px;">One-Time Password (OTP)</div>' +
            '<div style="font-size: 36px; font-weight: 900; letter-spacing: 0.3em; color: #1F242E; font-family: monospace;">' + otp + '</div>' +
            '<div style="font-size: 12px; color: #C2410C; margin-top: 8px; font-weight: 600;">Expires in ' + expiryMinutes + ' minutes</div>' +
          '</div>' +

          '<div style="font-weight: 700; color: #374151; margin-bottom: 12px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Reset Request Details:</div>' +
          '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' +
            '<tr><td style="padding: 8px 0; color: #6B7280; width: 150px; font-weight: 600;">Team Division:</td><td style="padding: 8px 0; font-weight: 700; color: #111827;">[' + teamCode + '] ' + teamName + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Team Email:</td><td style="padding: 8px 0; color: #111827;">' + teamEmail + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Team Lead:</td><td style="padding: 8px 0; color: #111827;">' + teamLead + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Requested At:</td><td style="padding: 8px 0; color: #111827;">' + timestamp + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Domain:</td><td style="padding: 8px 0; color: #111827;">ridersbay.com (SIEP Portal)</td></tr>' +
          '</table>' +

          '<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />' +

          '<div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px; font-size: 12px; color: #991B1B;">' +
            '<strong>Security Notice:</strong> This OTP was generated from the Riders Bay login portal. ' +
            'If you did not expect a password reset request from <strong>[' + teamCode + '] ' + teamName + '</strong>, ' +
            'please ignore this email. The OTP will expire automatically in ' + expiryMinutes + ' minutes.' +
          '</div>' +

          '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #94A3B8; text-align: center;">' +
            'Riders Bay SIEP Portal - Automated Security Alert - Do not forward this email' +
          '</div>' +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: to,
      subject: "[" + teamCode + "] " + teamName + " — Password Reset OTP: " + otp,
      htmlBody: htmlBody
    });

    return responseJSON({
      success: true,
      message: "Forgot password OTP sent to admin inbox for [" + teamCode + "] " + teamName
    });
  } catch (mailErr) {
    return responseJSON({
      success: false,
      error: "MailApp error sending OTP: " + mailErr.toString()
    });
  }
}

/**
 * Handles permanent update of team password in Google Cloud Script Properties
 * and emails an audit alert to snjbebikeclub@gmail.com
 */
function handleUpdateTeamPassword(data) {
  try {
    var teamId = data.teamId;
    var newPassword = data.newPassword;
    var teamName = data.teamName || teamId;
    var teamCode = data.teamCode || "TEAM";
    var timestamp = data.timestamp || new Date().toLocaleString();
    var to = "snjbebikeclub@gmail.com";

    if (!teamId || !newPassword) {
      return responseJSON({
        success: false,
        error: "teamId and newPassword are required."
      });
    }

    // 1. Store permanently in Google Script Properties (cloud key-value store)
    var props = PropertiesService.getScriptProperties();
    props.setProperty("team_pass_" + teamId, newPassword);

    // 2. Dispatch security audit alert email to snjbebikeclub@gmail.com
    var htmlBody =
      '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden; background-color: #FFFFFF;">' +
        '<div style="background-color: #1F242E; padding: 24px 28px; color: #FFFFFF; border-bottom: 3px solid #10B981;">' +
          '<div style="color: #10B981; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">SIEP E-BIKE 2026 // RIDERS BAY SECURITY</div>' +
          '<h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Password Changed Successfully</h1>' +
        '</div>' +
        '<div style="padding: 28px; color: #1F2937; line-height: 1.6; font-size: 14px;">' +
          '<p style="margin: 0 0 16px 0; color: #374151;">The login password for <strong>[' + teamCode + '] ' + teamName + '</strong> was updated via verified OTP recovery.</p>' +
          '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' +
            '<tr><td style="padding: 8px 0; color: #6B7280; width: 140px; font-weight: 600;">Team Division:</td><td style="padding: 8px 0; font-weight: 700; color: #111827;">[' + teamCode + '] ' + teamName + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">New Password:</td><td style="padding: 8px 0; font-family: monospace; font-size: 16px; font-weight: 800; color: #059669;">' + newPassword + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Timestamp:</td><td style="padding: 8px 0; color: #111827;">' + timestamp + '</td></tr>' +
          '</table>' +
          '<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px; font-size: 12px; color: #166534;">' +
            'This change is now active across the portal. Team members can sign in using this new password immediately.' +
          '</div>' +
          '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #94A3B8; text-align: center;">' +
            'Riders Bay SIEP Portal Security Alert' +
          '</div>' +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: to,
      subject: "[" + teamCode + "] " + teamName + " — Password Changed Successfully",
      htmlBody: htmlBody
    });

    return responseJSON({
      success: true,
      message: "Password updated in cloud store and confirmation email sent."
    });
  } catch (err) {
    return responseJSON({
      success: false,
      error: "Error updating password: " + err.toString()
    });
  }
}

/**
 * Returns all custom team passwords stored in Google Script Properties
 */
function handleGetTeamPasswords() {
  try {
    var props = PropertiesService.getScriptProperties();
    var keys = props.getKeys();
    var passwords = {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf("team_pass_") === 0) {
        var tId = k.substring("team_pass_".length);
        passwords[tId] = props.getProperty(k);
      }
    }
    return responseJSON({
      success: true,
      passwords: passwords
    });
  } catch (err) {
    return responseJSON({
      success: false,
      error: "Error getting passwords: " + err.toString()
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
