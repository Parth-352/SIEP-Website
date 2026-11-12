import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';
import { getMemberPasswords, getMemberPassword, setMemberPassword } from '@/lib/store';
import { getFirestoreMemberPasswords, saveFirestoreMemberPassword } from '@/lib/firestoreService';

const DEFAULT_MEMBER_PIN = '935200';

/**
 * POST /api/change-password
 * Securely changes the 6-digit PIN for the currently authenticated member.
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session || !session.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You must be signed in to change your PIN.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPin, newPin, confirmPin } = body;

    const cleanCurrent = String(currentPin || '').trim();
    const cleanNew = String(newPin || '').trim();
    const cleanConfirm = String(confirmPin || '').trim();

    if (!cleanCurrent) {
      return NextResponse.json(
        { success: false, error: 'Please enter your current 6-digit PIN.' },
        { status: 400 }
      );
    }

    if (!cleanNew) {
      return NextResponse.json(
        { success: false, error: 'Please enter a new 6-digit PIN.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(cleanNew)) {
      return NextResponse.json(
        { success: false, error: 'New PIN must be exactly 6 numeric digits (0-9).' },
        { status: 400 }
      );
    }

    if (cleanNew !== cleanConfirm) {
      return NextResponse.json(
        { success: false, error: 'New PIN and confirmation PIN do not match.' },
        { status: 400 }
      );
    }

    // Determine current active PIN
    const cleanEmail = session.email.toLowerCase().trim();
    const fsPasswords = await getFirestoreMemberPasswords();
    const customPass = fsPasswords[cleanEmail] || getMemberPassword(cleanEmail);
    const activePin = customPass || DEFAULT_MEMBER_PIN;

    // Verify current PIN (allow default PIN fallback if custom exists)
    const isCurrentValid =
      cleanCurrent === activePin ||
      (customPass && cleanCurrent === DEFAULT_MEMBER_PIN);

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect current PIN. Please try again.' },
        { status: 400 }
      );
    }

    // Persist in Cloud Firestore and local store
    await saveFirestoreMemberPassword(cleanEmail, cleanNew);
    setMemberPassword(cleanEmail, cleanNew);

    return NextResponse.json({
      success: true,
      message: 'Your 6-digit PIN has been successfully updated.',
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while updating PIN.' },
      { status: 500 }
    );
  }
}
