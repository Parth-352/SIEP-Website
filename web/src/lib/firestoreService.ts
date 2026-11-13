import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
} from 'firebase/firestore';
import { Task, WorkLog, TeamId, TaskStatus, TaskPriority, MemberProfileData, ResearchMaterial } from './types';
import { TeamMemberEntry } from './members';

// ======================== TASKS FIRESTORE ========================

export async function getFirestoreTasks(teamId?: TeamId | string): Promise<Task[] | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const tasksCol = collection(db, 'tasks');
    const snapshot = await getDocs(tasksCol);
    const tasks: Task[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      tasks.push({
        id: d.id,
        title: data.title || '',
        description: data.description || '',
        teamId: (data.teamId || 'core') as TeamId,
        assignedMembers: Array.isArray(data.assignedMembers) ? data.assignedMembers : [],
        status: (data.status || 'todo') as TaskStatus,
        priority: (data.priority || 'medium') as TaskPriority,
        dueDate: data.dueDate || undefined,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
        subtasks: Array.isArray(data.subtasks) ? data.subtasks : [],
        comments: Array.isArray(data.comments) ? data.comments : [],
        estimatedHours: Number(data.estimatedHours || 0),
        actualHours: Number(data.actualHours || 0),
        isBlocked: Boolean(data.isBlocked),
        blockerReason: data.blockerReason || '',
      });
    });

    if (!teamId || teamId === 'core' || teamId === 'all') {
      return tasks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    return tasks
      .filter((t) => t.teamId === teamId)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (err) {
    console.warn('Firestore getTasks error (falling back to local store):', err);
    return null;
  }
}

export async function saveFirestoreTask(task: Task): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const taskRef = doc(db, 'tasks', task.id);
    await setDoc(taskRef, {
      title: task.title,
      description: task.description || '',
      teamId: task.teamId,
      assignedMembers: task.assignedMembers || [],
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      subtasks: task.subtasks || [],
      comments: task.comments || [],
      estimatedHours: Number(task.estimatedHours || 0),
      actualHours: Number(task.actualHours || 0),
      isBlocked: Boolean(task.isBlocked),
      blockerReason: task.blockerReason || '',
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore saveTask error:', err);
    return false;
  }
}

export async function deleteFirestoreTask(id: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const taskRef = doc(db, 'tasks', id);
    await deleteDoc(taskRef);
    return true;
  } catch (err) {
    console.warn('Firestore deleteTask error:', err);
    return false;
  }
}

// ======================== LOGS FIRESTORE ========================

export async function getFirestoreLogs(teamId?: TeamId | string): Promise<WorkLog[] | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const logsCol = collection(db, 'logs');
    const snapshot = await getDocs(logsCol);
    const logs: WorkLog[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      logs.push({
        id: d.id,
        stepNumber: data.stepNumber || 1,
        stepTitle: data.stepTitle || '',
        phase: data.phase || 'Engineering Move',
        teamId: (data.teamId || 'core') as TeamId,
        teamName: data.teamName || '',
        authorName: data.authorName || 'Team Member',
        date: data.date || new Date().toISOString().split('T')[0],
        workTime: data.workTime || '12:00 PM',
        membersPresent: Array.isArray(data.membersPresent) ? data.membersPresent : [],
        hoursSpent: Number(data.hoursSpent) || 0,
        description: data.description || '',
        achievements: data.achievements || '',
        blockers: data.blockers || undefined,
        videoUrl: data.videoUrl || undefined,
        driveFileId: data.driveFileId || undefined,
        videoSource: data.videoSource || undefined,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || undefined,
      });
    });

    if (!teamId || teamId === 'core' || teamId === 'all') {
      return logs.sort((a, b) => b.createdAt - a.createdAt);
    }
    return logs
      .filter((l) => l.teamId === teamId)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.warn('Firestore getLogs error (falling back to local store):', err);
    return null;
  }
}

export async function saveFirestoreLog(log: WorkLog): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const logRef = doc(db, 'logs', log.id);
    await setDoc(logRef, {
      stepNumber: log.stepNumber,
      stepTitle: log.stepTitle,
      phase: log.phase || 'Engineering Move',
      teamId: log.teamId,
      teamName: log.teamName,
      authorName: log.authorName || 'Team Member',
      date: log.date,
      workTime: log.workTime,
      membersPresent: log.membersPresent || [],
      hoursSpent: log.hoursSpent || 0,
      description: log.description,
      achievements: log.achievements || '',
      blockers: log.blockers || null,
      videoUrl: log.videoUrl || null,
      driveFileId: log.driveFileId || null,
      videoSource: log.videoSource || null,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt || null,
    });
    return true;
  } catch (err) {
    console.warn('Firestore saveLog error:', err);
    return false;
  }
}

export async function deleteFirestoreLog(id: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const logRef = doc(db, 'logs', id);
    await deleteDoc(logRef);
    return true;
  } catch (err) {
    console.warn('Firestore deleteLog error:', err);
    return false;
  }
}

// ======================== PASSWORDS FIRESTORE ========================

export async function getFirestorePasswords(): Promise<Record<string, string>> {
  if (!isFirebaseConfigured() || !db) return {};
  try {
    const col = collection(db, 'team_passwords');
    const snapshot = await getDocs(col);
    const passwords: Record<string, string> = {};
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.password) {
        passwords[d.id] = data.password;
      }
    });
    return passwords;
  } catch (err) {
    console.warn('Firestore getPasswords error:', err);
    return {};
  }
}

export async function saveFirestorePassword(teamId: string, password: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const docRef = doc(db, 'team_passwords', teamId);
    await setDoc(docRef, {
      teamId,
      password,
      updatedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore savePassword error:', err);
    return false;
  }
}

// ======================== MEMBER PASSWORDS FIRESTORE ========================

export async function getFirestoreMemberPasswords(): Promise<Record<string, string>> {
  if (!isFirebaseConfigured() || !db) return {};
  try {
    const col = collection(db, 'member_passwords');
    const snapshot = await getDocs(col);
    const passwords: Record<string, string> = {};
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.email && data.password) {
        const clean = data.email.toLowerCase().trim();
        passwords[clean] = data.password;
        if (clean === 'parthkshirsagrr@gmail.com') {
          passwords['parthkshirsagr@gmail.com'] = data.password;
        } else if (clean === 'parthkshirsagr@gmail.com') {
          passwords['parthkshirsagrr@gmail.com'] = data.password;
        }
      }
    });
    return passwords;
  } catch (err) {
    console.warn('Firestore getMemberPasswords error:', err);
    return {};
  }
}

export async function saveFirestoreMemberPassword(email: string, password: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const docRef = doc(db, 'member_passwords', docId);
    await setDoc(docRef, {
      email: cleanEmail,
      password: cleanPass,
      updatedAt: Date.now(),
    });

    // Ensure alias emails are strictly kept in sync with the single password
    if (cleanEmail === 'parthkshirsagrr@gmail.com' || cleanEmail === 'parthkshirsagr@gmail.com') {
      const aliasEmail = cleanEmail === 'parthkshirsagrr@gmail.com' ? 'parthkshirsagr@gmail.com' : 'parthkshirsagrr@gmail.com';
      const aliasDocId = aliasEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const aliasDocRef = doc(db, 'member_passwords', aliasDocId);
      await setDoc(aliasDocRef, {
        email: aliasEmail,
        password: cleanPass,
        updatedAt: Date.now(),
      }).catch(() => {});
    }

    return true;
  } catch (err) {
    console.warn('Firestore saveMemberPassword error:', err);
    return false;
  }
}

// ======================== MEMBER PROFILES FIRESTORE ========================

export async function getFirestoreMemberProfiles(): Promise<Record<string, MemberProfileData>> {
  if (!isFirebaseConfigured() || !db) return {};
  try {
    const col = collection(db, 'member_profiles');
    const snapshot = await getDocs(col);
    const profiles: Record<string, MemberProfileData> = {};
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.email) {
        profiles[data.email.toLowerCase()] = {
          email: data.email.toLowerCase(),
          displayName: data.displayName || '',
          photoUrl: data.photoUrl || undefined,
          bio: data.bio || undefined,
          updatedAt: data.updatedAt || Date.now(),
        };
      }
    });
    return profiles;
  } catch (err) {
    console.warn('Firestore getMemberProfiles error:', err);
    return {};
  }
}

export async function saveFirestoreMemberProfile(
  email: string,
  profile: Partial<MemberProfileData>
): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const docRef = doc(db, 'member_profiles', docId);
    await setDoc(
      docRef,
      {
        ...profile,
        email: cleanEmail,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Firestore saveMemberProfile error:', err);
    return false;
  }
}

// ======================== MATERIALS FIRESTORE ========================

export async function getFirestoreMaterials(teamId?: TeamId | string): Promise<ResearchMaterial[] | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const materialsCol = collection(db, 'materials');
    const snapshot = await getDocs(materialsCol);
    const materials: ResearchMaterial[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      materials.push({
        id: d.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'other',
        teamId: (data.teamId || 'core') as TeamId,
        teamName: data.teamName || '',
        authorEmail: data.authorEmail || '',
        authorName: data.authorName || '',
        fileName: data.fileName || '',
        fileSize: Number(data.fileSize || 0),
        mimeType: data.mimeType || '',
        fileUrl: data.fileUrl || '',
        driveFileId: data.driveFileId || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      });
    });

    if (!teamId || teamId === 'core' || teamId === 'all') {
      return materials.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return materials
      .filter((m) => m.teamId === teamId)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.warn('Firestore getMaterials error (falling back to local store):', err);
    return null;
  }
}

export async function saveFirestoreMaterial(material: ResearchMaterial): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const docRef = doc(db, 'materials', material.id);
    await setDoc(docRef, {
      title: material.title,
      description: material.description || '',
      category: material.category,
      teamId: material.teamId,
      teamName: material.teamName,
      authorEmail: material.authorEmail,
      authorName: material.authorName,
      fileName: material.fileName,
      fileSize: material.fileSize || 0,
      mimeType: material.mimeType || '',
      fileUrl: material.fileUrl,
      driveFileId: material.driveFileId || '',
      tags: material.tags || [],
      createdAt: material.createdAt,
      updatedAt: material.updatedAt || Date.now(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore saveMaterial error:', err);
    return false;
  }
}

export async function deleteFirestoreMaterial(id: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const docRef = doc(db, 'materials', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore deleteMaterial error:', err);
    return false;
  }
}

// ======================== ROSTER & ROLES FIRESTORE ========================

export async function getFirestoreMembers(): Promise<TeamMemberEntry[] | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const col = collection(db, 'roster_members');
    const snapshot = await getDocs(col);
    if (snapshot.empty) {
      return null;
    }
    const members: TeamMemberEntry[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      members.push({
        id: d.id,
        name: data.name || '',
        role: data.role || 'Team Member',
        teamId: (data.teamId || 'software') as TeamId,
        secondaryTeams: Array.isArray(data.secondaryTeams) ? data.secondaryTeams : [],
        isLead: Boolean(data.isLead),
        isCore: Boolean(data.isCore),
        tier: data.tier || (data.isCore ? 1 : data.isLead ? 2 : 3),
        email: data.email || '',
        joinedDate: data.joinedDate,
        status: data.status || 'active',
        updatedAt: data.updatedAt || Date.now(),
      });
    });
    return members;
  } catch (err) {
    console.warn('Firestore getFirestoreMembers error (falling back to store):', err);
    return null;
  }
}

export async function saveFirestoreMember(member: TeamMemberEntry): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const docRef = doc(db, 'roster_members', member.id);
    await setDoc(docRef, {
      name: member.name,
      role: member.role,
      teamId: member.teamId,
      secondaryTeams: member.secondaryTeams || [],
      isLead: Boolean(member.isLead),
      isCore: Boolean(member.isCore),
      tier: member.tier || (member.isCore ? 1 : member.isLead ? 2 : 3),
      email: member.email,
      joinedDate: member.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: member.status || 'active',
      updatedAt: Date.now(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore saveFirestoreMember error:', err);
    return false;
  }
}

export async function deleteFirestoreMember(id: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const docRef = doc(db, 'roster_members', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore deleteFirestoreMember error:', err);
    return false;
  }
}


