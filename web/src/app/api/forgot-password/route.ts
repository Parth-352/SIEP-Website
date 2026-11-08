import { NextRequest, NextResponse } from 'next/server';
import { TEAMS } from '@/lib/teams';
import { TeamId } from '@/lib/types';
import { getTeamPassword, setTeamPassword } from '@/lib/store';
import { getFirestorePasswords, saveFirestorePassword } from '@/lib/firestoreService';

// ============================================================================
// FORGOT PASSWORD API — OTP-BASED PASSWORD RECOVERY & RESET
// All OTPs go to a single admin email: snjbebikeclub@gmail.com
// Includes rate limiting per team and globally to prevent spam.
// ============================================================================

const ADMIN_EMAIL = 'snjbebikeclub@gmail.com';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_MS = 2 * 60 * 1000;   // 2 minutes between requests per team
const MAX_VERIFY_ATTEMPTS = 5;        // Max wrong OTP attempts before lockout

interface OTPRecord {
  otp: string;
  teamId: TeamId;
  teamName: string;
  teamCode: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  used: boolean;
  verified?: boolean;
  resetToken?: string;
  tokenExpiresAt?: number;
}

// In-memory OTP store (keyed by teamId)
const otpStore = new Map<string, OTPRecord>();

// Validate strict password requirements: 8+ chars, uppercase, lowercase, digit, and symbol
function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  const p = password.trim();
  if (p.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (p.length > 40) {
    return { valid: false, error: 'Password cannot exceed 40 characters.' };
  }
  if (!/[A-Z]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`\\]/.test(p)) {
    return { valid: false, error: 'Password must contain at least one special symbol (e.g. @, #, $, %, !).' };
  }
  return { valid: true };
}

// Generate a 6-digit numeric OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ======================== POST: Request OTP or Verify OTP ========================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, teamId, otp } = body;

    // ─── ACTION: REQUEST OTP ─────────────────────────────────────────────
    if (action === 'request') {
      if (!teamId || !TEAMS[teamId as TeamId]) {
        return NextResponse.json(
          { success: false, error: 'Please select a valid team before requesting a password reset.' },
          { status: 400 }
        );
      }

      const team = TEAMS[teamId as TeamId];

      // Rate limit: check if there's a recent unexpired OTP for this team
      const existing = otpStore.get(teamId);
      if (existing && !existing.used && (Date.now() - existing.createdAt) < COOLDOWN_MS) {
        const waitSec = Math.ceil((COOLDOWN_MS - (Date.now() - existing.createdAt)) / 1000);
        return NextResponse.json(
          {
            success: false,
            error: `A reset OTP was already sent for [${team.code}] ${team.name}. Please wait ${waitSec}s before requesting again.`,
          },
          { status: 429 }
        );
      }

      // Generate new OTP
      const newOTP = generateOTP();
      const now = Date.now();

      const record: OTPRecord = {
        otp: newOTP,
        teamId: teamId as TeamId,
        teamName: team.name,
        teamCode: team.code,
        createdAt: now,
        expiresAt: now + OTP_EXPIRY_MS,
        attempts: 0,
        used: false,
      };

      otpStore.set(teamId, record);

      // Send OTP email via Google Apps Script
      const gasUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
      let mailSent = false;
      let failureReason = '';

      if (!gasUrl) {
        failureReason = 'Google Apps Script URL is not configured on the server.';
      } else {
        try {
          const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

          const gasRes = await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'sendForgotPasswordOTP',
              to: ADMIN_EMAIL,
              otp: newOTP,
              teamId: teamId,
              teamCode: team.code,
              teamName: team.name,
              teamEmail: team.email,
              teamLead: team.lead || 'Unknown',
              timestamp: timestamp,
              expiryMinutes: 5,
            }),
          });

          if (gasRes.ok) {
            const gasData = await gasRes.json().catch(() => null);
            if (gasData && gasData.success === true) {
              mailSent = true;
            } else {
              failureReason = gasData?.error || 'Google Apps Script returned an unhandled error.';
              console.warn('Google Apps Script returned failure for OTP mail:', gasData);
            }
          } else {
            failureReason = `Google Apps Script returned HTTP ${gasRes.status}.`;
          }
        } catch (gasErr) {
          failureReason = gasErr instanceof Error ? gasErr.message : 'Network error reaching Google Apps Script';
          console.error('Failed to send OTP via Google Apps Script:', gasErr);
        }
      }

      if (!mailSent) {
        // Clear the OTP if mail couldn't be sent
        otpStore.delete(teamId);
        return NextResponse.json(
          {
            success: false,
            error: failureReason
              ? `Failed to send OTP email (${failureReason}). Please update the Google Apps Script deployment.`
              : 'Failed to send OTP email. Please try again later or contact administration.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `A 6-digit OTP has been sent to the admin inbox for [${team.code}] ${team.name}. It expires in 5 minutes.`,
        expiresAt: record.expiresAt,
      });
    }

    // ─── ACTION: VERIFY OTP ──────────────────────────────────────────────
    if (action === 'verify') {
      if (!teamId || !otp) {
        return NextResponse.json(
          { success: false, error: 'Team and OTP are required for verification.' },
          { status: 400 }
        );
      }

      const record = otpStore.get(teamId);

      if (!record) {
        return NextResponse.json(
          { success: false, error: 'No OTP was requested for this team. Please request a new one.' },
          { status: 400 }
        );
      }

      if (record.used) {
        return NextResponse.json(
          { success: false, error: 'This OTP has already been used. Please request a new one.' },
          { status: 400 }
        );
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(teamId);
        return NextResponse.json(
          { success: false, error: 'OTP has expired. Please request a new one.', expired: true },
          { status: 400 }
        );
      }

      if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
        otpStore.delete(teamId);
        return NextResponse.json(
          { success: false, error: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new one.' },
          { status: 429 }
        );
      }

      // Verify the OTP
      if (otp.trim() !== record.otp) {
        record.attempts += 1;
        const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
        return NextResponse.json(
          {
            success: false,
            error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
          },
          { status: 401 }
        );
      }

      // OTP is correct — grant reset session
      const team = TEAMS[teamId as TeamId];
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team configuration not found.' },
          { status: 500 }
        );
      }

      // Mark OTP as used and generate a secure 10-minute reset token
      record.used = true;
      record.verified = true;
      const resetToken = crypto.randomUUID();
      record.resetToken = resetToken;
      record.tokenExpiresAt = Date.now() + 10 * 60 * 1000;

      const fsPasswords = await getFirestorePasswords();
      const activePassword = fsPasswords[teamId] || getTeamPassword(teamId) || team.defaultPass;

      return NextResponse.json({
        success: true,
        message: `OTP verified for [${team.code}] ${team.name}. You can now set a new password or continue.`,
        teamCode: team.code,
        teamName: team.name,
        resetToken: resetToken,
        currentPassword: activePassword,
      });
    }

    // ─── ACTION: RESET PASSWORD ──────────────────────────────────────────
    if (action === 'reset') {
      const { teamId, resetToken, newPassword } = body;

      if (!teamId || !resetToken || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Team, reset token, and new password are required.' },
          { status: 400 }
        );
      }

      const team = TEAMS[teamId as TeamId];
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team configuration not found.' },
          { status: 404 }
        );
      }

      const record = otpStore.get(teamId);
      if (!record || record.resetToken !== resetToken || !record.verified) {
        return NextResponse.json(
          { success: false, error: 'Password reset session is invalid. Please request a new OTP.' },
          { status: 401 }
        );
      }

      if (record.tokenExpiresAt && Date.now() > record.tokenExpiresAt) {
        otpStore.delete(teamId);
        return NextResponse.json(
          { success: false, error: 'Password reset session has expired. Please request a new OTP.' },
          { status: 401 }
        );
      }

      const cleanNewPass = String(newPassword).trim();
      const validation = validatePasswordStrength(cleanNewPass);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error || 'Password does not meet security requirements.' },
          { status: 400 }
        );
      }

      // 1. Save new password to the server store & Google Cloud Firestore
      setTeamPassword(teamId, cleanNewPass);
      await saveFirestorePassword(teamId, cleanNewPass).catch((fsErr) => {
        console.warn('Firestore password save notice:', fsErr);
      });

      // Invalidate the reset token
      otpStore.delete(teamId);

      // 2. Dispatch update to Google Apps Script cloud & notify admin email in background
      const gasUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
      if (gasUrl) {
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateTeamPassword',
            teamId: teamId,
            teamCode: team.code,
            teamName: team.name,
            newPassword: cleanNewPass,
            timestamp: timestamp,
          }),
        }).catch((gasErr) => {
          console.warn('Background Google Apps Script password sync notice:', gasErr);
        });
      }

      return NextResponse.json({
        success: true,
        message: `Password for [${team.code}] ${team.name} has been updated successfully!`,
        teamCode: team.code,
        teamName: team.name,
        newPassword: cleanNewPass,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "request", "verify", or "reset".' },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error('Forgot Password API Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
