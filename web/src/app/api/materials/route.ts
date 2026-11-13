import { NextRequest, NextResponse } from 'next/server';
import { getMaterials, createMaterial, deleteMaterial, recordActivity } from '@/lib/store';
import {
  getFirestoreMaterials,
  saveFirestoreMaterial,
  deleteFirestoreMaterial,
} from '@/lib/firestoreService';
import { ResearchMaterial, TeamId, MaterialCategory } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to view project materials.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId') || undefined;

    // 1. Try Firestore first
    const firestoreMaterials = await getFirestoreMaterials(teamId);
    if (firestoreMaterials !== null) {
      return NextResponse.json({ success: true, materials: firestoreMaterials, source: 'firestore' });
    }

    // 2. Fallback to local store
    const materials = getMaterials(teamId);
    return NextResponse.json({ success: true, materials, source: 'local' });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in before uploading materials.' },
        { status: 401 }
      );
    }

    // ANY authenticated member (non-core, non-lead, leads, core admin) is allowed to upload materials!
    const body = await request.json();

    // ─── BATCH UPLOAD SUPPORT ──────────────────────────────────────────
    if (Array.isArray(body.materials)) {
      const createdList: ResearchMaterial[] = [];

      for (const item of body.materials) {
        const title = (item.title || item.fileName || '').trim();
        const fileUrl = (item.fileUrl || '').trim();
        if (!title || !fileUrl) continue;

        const teamId: TeamId = (item.teamId || session.teamId || 'research') as TeamId;
        const category: MaterialCategory = (item.category || 'research') as MaterialCategory;
        const teamName = TEAMS[teamId]?.name || teamId;

        const newMat: ResearchMaterial = {
          id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title,
          description: (item.description || '').trim(),
          category,
          teamId,
          teamName,
          authorEmail: session.email,
          authorName: session.name || session.email.split('@')[0],
          fileName: (item.fileName || title).trim(),
          fileSize: Number(item.fileSize || 0),
          mimeType: item.mimeType || 'application/pdf',
          fileUrl,
          driveFileId: item.driveFileId || undefined,
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        createMaterial(newMat);
        try {
          await saveFirestoreMaterial(newMat);
        } catch (fsErr) {
          console.warn('Firestore saveMaterial batch warn:', fsErr);
        }

        createdList.push(newMat);
      }

      if (createdList.length > 0) {
        try {
          recordActivity({
            type: 'log_submitted',
            memberName: session.name || session.email,
            teamId: session.teamId || 'research',
            title: `Batch Materials Uploaded (${createdList.length} files)`,
            detail: `Published ${createdList.length} new technical documents across squads.`,
          });
        } catch {
          // ignore
        }
      }

      return NextResponse.json(
        { success: true, count: createdList.length, materials: createdList },
        { status: 201 }
      );
    }

    // ─── SINGLE MATERIAL UPLOAD ────────────────────────────────────────
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Document title is required.' },
        { status: 400 }
      );
    }

    const fileUrl = (body.fileUrl || '').trim();
    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: 'File link or Google Drive URL is required.' },
        { status: 400 }
      );
    }

    const teamId: TeamId = (body.teamId || session.teamId || 'research') as TeamId;
    const category: MaterialCategory = (body.category || 'research') as MaterialCategory;
    const teamName = TEAMS[teamId]?.name || teamId;

    const newMaterial: ResearchMaterial = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      description: (body.description || '').trim(),
      category,
      teamId,
      teamName,
      authorEmail: session.email,
      authorName: session.name || session.email.split('@')[0],
      fileName: (body.fileName || title).trim(),
      fileSize: Number(body.fileSize || 0),
      mimeType: body.mimeType || 'application/pdf',
      fileUrl,
      driveFileId: body.driveFileId || undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 1. Save to local store fallback
    createMaterial(newMaterial);

    // 2. Persist to Firestore
    try {
      await saveFirestoreMaterial(newMaterial);
    } catch (fsErr) {
      console.warn('Firestore saveMaterial background warn:', fsErr);
    }

    // 3. Log real-time activity
    try {
      recordActivity({
        type: 'log_submitted',
        memberName: newMaterial.authorName,
        teamId: newMaterial.teamId,
        title: `Material Uploaded: "${title}"`,
        detail: `Added new ${category} document for ${teamName}.`,
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, material: newMaterial }, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload material' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Author, core, or lead can delete
    deleteMaterial(id);
    try {
      await deleteFirestoreMaterial(id);
    } catch (fsErr) {
      console.warn('Firestore deleteMaterial warn:', fsErr);
    }

    return NextResponse.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete material' }, { status: 500 });
  }
}
