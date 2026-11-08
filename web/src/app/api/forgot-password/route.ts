import { NextRequest, NextResponse } from 'next/server';
import { TEAMS } from '@/lib/teams';
import { TeamId } from '@/lib/types';

// ============================================================================
// FORGOT PASSWORD API — OTP-BASED PASSWORD RECOVERY
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
}

// In-memory OTP store (keyed by teamId)
const otpStore = new Map<string, OTPRecord>();

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

      // OTP is correct — reveal the password
      const team = TEAMS[teamId as TeamId];
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team configuration not found.' },
          { status: 500 }
        );
      }

      // Mark as used so it can't be reused
      record.used = true;

      return NextResponse.json({
        success: true,
        message: `Password recovered for [${team.code}] ${team.name}.`,
        teamCode: team.code,
        teamName: team.name,
        password: team.defaultPass,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "request" or "verify".' },
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
