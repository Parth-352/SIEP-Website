import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
} from 'firebase/firestore';
import { Task, WorkLog, TeamId, TaskStatus, TaskPriority } from './types';

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
    });
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
        passwords[data.email.toLowerCase()] = data.password;
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
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const docRef = doc(db, 'member_passwords', docId);
    await setDoc(docRef, {
      email: cleanEmail,
      password: password.trim(),
      updatedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore saveMemberPassword error:', err);
    return false;
  }
}

