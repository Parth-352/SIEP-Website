import { NextRequest, NextResponse } from 'next/server';
import { TEAMS } from '@/lib/teams';
import { TeamId } from '@/lib/types';
import {
  getTeamPassword,
  setTeamPassword,
  getMemberPassword,
  setMemberPassword,
} from '@/lib/store';
import {
  getFirestorePasswords,
  saveFirestorePassword,
  getFirestoreMemberPasswords,
  saveFirestoreMemberPassword,
} from '@/lib/firestoreService';
import {
  getMemberByEmail,
  ROSTER_MEMBERS,
} from '@/lib/members';

const ADMIN_EMAIL = 'snjbebikeclub@gmail.com';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_MS = 60 * 1000; // 1 minute between requests
const MAX_VERIFY_ATTEMPTS = 5;

interface OTPRecord {
  otp: string;
  identifier: string; // email or teamId
  isMember: boolean;
  recipientEmail: string;
  recipientName: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  used: boolean;
  verified?: boolean;
  resetToken?: string;
  tokenExpiresAt?: number;
}

// In-memory OTP store (keyed by lowercase identifier)
const otpStore = new Map<string, OTPRecord>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user.slice(0, 2)}${'*'.repeat(Math.min(user.length - 3, 5))}${user.slice(-1)}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, teamId, otp } = body;

    const identifier = String(email || teamId || '').trim().toLowerCase();

    // ─── ACTION: REQUEST OTP ─────────────────────────────────────────────
    if (action === 'request') {
      if (!identifier) {
        return NextResponse.json(
          { success: false, error: 'Please enter your registered email address.' },
          { status: 400 }
        );
      }

      let recipientEmail = '';
      let recipientName = '';
      let roleDescription = '';
      let isMember = false;

      // Check if it's a member email
      const member = getMemberByEmail(identifier);
      if (member) {
        recipientEmail = member.email;
        recipientName = member.name;
        roleDescription = `${member.role} [${member.teamId.toUpperCase()}]`;
        isMember = true;
      } else {
        // Check if legacy teamId
        const team = TEAMS[identifier as TeamId];
        if (team) {
          recipientEmail = team.email;
          recipientName = `Team ${team.name}`;
          roleDescription = `[${team.code}] Squad`;
          isMember = false;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Email address not found in the official SIEP roster. Please verify and try again.',
            },
            { status: 404 }
          );
        }
      }

      // Rate limit check
      const existing = otpStore.get(identifier);
      if (existing && !existing.used && Date.now() - existing.createdAt < COOLDOWN_MS) {
        const waitSec = Math.ceil((COOLDOWN_MS - (Date.now() - existing.createdAt)) / 1000);
        return NextResponse.json(
          {
            success: false,
            error: `An OTP was already dispatched. Please wait ${waitSec}s before requesting again.`,
          },
          { status: 429 }
        );
      }

      const newOTP = generateOTP();
      const now = Date.now();

      const record: OTPRecord = {
        otp: newOTP,
        identifier,
        isMember,
        recipientEmail,
        recipientName,
        createdAt: now,
        expiresAt: now + OTP_EXPIRY_MS,
        attempts: 0,
        used: false,
      };

      otpStore.set(identifier, record);

      // Send OTP via Google Apps Script directly to member's personal Gmail
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
              to: recipientEmail,
              cc: ADMIN_EMAIL, // Admin receives audit copy
              otp: newOTP,
              recipientName,
              role: roleDescription,
              teamEmail: recipientEmail,
              teamLead: recipientName,
              timestamp,
              expiryMinutes: 5,
            }),
          });

          if (gasRes.ok) {
            const gasData = await gasRes.json().catch(() => null);
            if (gasData && gasData.success === true) {
              mailSent = true;
            } else {
              failureReason = gasData?.error || 'Google Apps Script response indicated an issue.';
            }
          } else {
            failureReason = `Google Apps Script returned HTTP ${gasRes.status}.`;
          }
        } catch (gasErr) {
          failureReason = gasErr instanceof Error ? gasErr.message : 'Network error reaching mail relay';
          console.error('Failed to send OTP email:', gasErr);
        }
      }

      if (!mailSent) {
        // If external mail relay failed, still allow dev/emergency OTP logging
        console.warn(`[DEV/RECOVERY OTP] For ${recipientEmail}: ${newOTP}`);
        return NextResponse.json(
          {
            success: false,
            error: `Could not deliver OTP email (${failureReason}). Please check your internet connection or ask Core Leadership.`,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `A 6-digit OTP has been sent directly to ${maskEmail(recipientEmail)}. It expires in 5 minutes.`,
        maskedEmail: maskEmail(recipientEmail),
        recipientName,
        expiresAt: record.expiresAt,
      });
    }

    // ─── ACTION: VERIFY OTP ──────────────────────────────────────────────
    if (action === 'verify') {
      if (!identifier || !otp) {
        return NextResponse.json(
          { success: false, error: 'Email and OTP are required for verification.' },
          { status: 400 }
        );
      }

      const record = otpStore.get(identifier);

      if (!record) {
        return NextResponse.json(
          { success: false, error: 'No active OTP request found. Please request a new code.' },
          { status: 400 }
        );
      }

      if (record.used) {
        return NextResponse.json(
          { success: false, error: 'This OTP has already been used. Please request a new code.' },
          { status: 400 }
        );
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(identifier);
        return NextResponse.json(
          { success: false, error: 'OTP has expired. Please request a new code.', expired: true },
          { status: 400 }
        );
      }

      if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
        otpStore.delete(identifier);
        return NextResponse.json(
          {
            success: false,
            error: 'Too many incorrect attempts. Please request a new code.',
          },
          { status: 429 }
        );
      }

      if (String(otp).trim() !== record.otp) {
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

      // OTP correct: grant 10-minute reset session
      record.used = true;
      record.verified = true;
      const resetToken = crypto.randomUUID();
      record.resetToken = resetToken;
      record.tokenExpiresAt = Date.now() + 10 * 60 * 1000;

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully. You may now create your new 6-digit PIN.',
        resetToken,
        recipientName: record.recipientName,
        email: record.recipientEmail,
      });
    }

    // ─── ACTION: RESET PASSWORD ──────────────────────────────────────────
    if (action === 'reset') {
      const { resetToken, newPassword } = body;

      if (!identifier || !resetToken || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Email, reset token, and new password are required.' },
          { status: 400 }
        );
      }

      const record = otpStore.get(identifier);
      if (!record || record.resetToken !== resetToken || !record.verified) {
        return NextResponse.json(
          { success: false, error: 'Reset session is invalid. Please request a new OTP.' },
          { status: 401 }
        );
      }

      if (record.tokenExpiresAt && Date.now() > record.tokenExpiresAt) {
        otpStore.delete(identifier);
        return NextResponse.json(
          { success: false, error: 'Reset session has expired. Please request a new OTP.' },
          { status: 401 }
        );
      }

      const cleanNewPass = String(newPassword).trim();

      // Check for 6-digit numeric PIN requirement
      if (!/^\d{6}$/.test(cleanNewPass)) {
        return NextResponse.json(
          {
            success: false,
            error: 'PIN must be exactly 6 digits (numbers only, e.g. 935200).',
          },
          { status: 400 }
        );
      }

      if (record.isMember) {
        // Save to member password stores (Firestore + local store)
        setMemberPassword(record.recipientEmail, cleanNewPass);
        await saveFirestoreMemberPassword(record.recipientEmail, cleanNewPass).catch((err) => {
          console.warn('Firestore member password save notice:', err);
        });
      } else {
        // Legacy team password
        setTeamPassword(identifier, cleanNewPass);
        await saveFirestorePassword(identifier, cleanNewPass).catch((err) => {
          console.warn('Firestore team password save notice:', err);
        });
      }

      // Invalidate the reset token
      otpStore.delete(identifier);

      return NextResponse.json({
        success: true,
        message: 'Your 6-digit PIN has been updated successfully! You can now sign in.',
        email: record.recipientEmail,
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
