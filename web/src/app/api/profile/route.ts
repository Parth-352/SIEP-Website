import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession, encodeSession } from '@/lib/session';
import { getFirestoreMemberProfiles, saveFirestoreMemberProfile } from '@/lib/firestoreService';

/**
 * GET /api/profile
 * Returns all custom member profiles (useful for Team / About page and Directory)
 */
export async function GET() {
  try {
    const profiles = await getFirestoreMemberProfiles();
    return NextResponse.json({ success: true, profiles });
  } catch (error) {
    console.error('Error fetching member profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member profiles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile
 * Updates the current member's custom profile (displayName, photoUrl, bio)
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session || !session.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session required to update profile.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, photoUrl, bio } = body;

    const cleanEmail = session.email.toLowerCase().trim();
    const updates: Record<string, any> = { updatedAt: Date.now() };

    if (typeof displayName === 'string' && displayName.trim().length > 0) {
      updates.displayName = displayName.trim();
    }
    if (typeof photoUrl === 'string') {
      updates.photoUrl = photoUrl.trim();
    }
    if (typeof bio === 'string') {
      updates.bio = bio.trim();
    }

    // Persist to Cloud Firestore
    await saveFirestoreMemberProfile(cleanEmail, updates);

    // Update local session cookie so next page requests carry the new name/photo
    const updatedSession = {
      ...session,
      ...(updates.displayName ? { displayName: updates.displayName } : {}),
      ...(updates.photoUrl !== undefined ? { photoUrl: updates.photoUrl } : {}),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: updates,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: encodeSession(updatedSession),
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
