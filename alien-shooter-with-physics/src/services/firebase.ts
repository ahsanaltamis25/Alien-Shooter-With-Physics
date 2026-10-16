/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentProfile, GameSave, LeaderboardEntry } from '../types/game';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot according to skill guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
    }
  }
}
testConnection();

// Student Profile Services
export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  const path = `students/${uid}`;
  try {
    const docRef = doc(db, 'students', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StudentProfile;
    }
    // Check localStorage fallback
    const local = localStorage.getItem(`student_profile_${uid}`);
    if (local) return JSON.parse(local);
    return null;
  } catch (error) {
    console.warn('Firestore read error, checking local cache:', error);
    const local = localStorage.getItem(`student_profile_${uid}`);
    if (local) return JSON.parse(local);
    return null;
  }
}

export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  const path = `students/${profile.uid}`;
  // Always update local storage for immediate persistence & offline
  localStorage.setItem(`student_profile_${profile.uid}`, JSON.stringify(profile));

  try {
    const docRef = doc(db, 'students', profile.uid);
    await setDoc(docRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to save to Firestore, saved locally:', error);
    // Note: Do not crash game flow if Firestore has network lag
  }
}

// Game Save State Services
export async function saveGameProgress(saveData: GameSave): Promise<void> {
  const path = `saves/${saveData.uid}`;
  localStorage.setItem(`game_save_${saveData.uid}`, JSON.stringify(saveData));

  try {
    const docRef = doc(db, 'saves', saveData.uid);
    await setDoc(docRef, saveData, { merge: true });
  } catch (error) {
    console.warn('Failed to push game save to Firestore, saved locally:', error);
  }
}

export async function loadGameProgress(uid: string): Promise<GameSave | null> {
  try {
    const docRef = doc(db, 'saves', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GameSave;
    }
  } catch (error) {
    console.warn('Loading from Firestore failed, checking local storage:', error);
  }
  const local = localStorage.getItem(`game_save_${uid}`);
  return local ? JSON.parse(local) : null;
}

// Benchmark historical physicists as baseline galactic cadets
const DEFAULT_LEADERBOARD_BENCHMARKS: LeaderboardEntry[] = [
  {
    uid: 'hero-1',
    displayName: 'Commander Isaac Newton',
    avatar: 'cyber',
    gradeLevel: 'College Classical Mechanics',
    highScore: 18500,
    questionsCorrect: 24,
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'hero-2',
    displayName: 'Dr. Marie Curie',
    avatar: 'scientist',
    gradeLevel: 'AP Physics 1: Mechanics',
    highScore: 14200,
    questionsCorrect: 19,
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'hero-3',
    displayName: 'Cadet Albert Einstein',
    avatar: 'cosmonaut',
    gradeLevel: 'High School Physics',
    highScore: 11800,
    questionsCorrect: 15,
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'hero-4',
    displayName: 'Pilot Galileo Galilei',
    avatar: 'pilot',
    gradeLevel: 'Introductory Physics',
    highScore: 8900,
    questionsCorrect: 12,
    updatedAt: new Date().toISOString(),
  },
];

// Leaderboard Services
export async function submitLeaderboardScore(entry: LeaderboardEntry): Promise<void> {
  // Save locally
  const localListStr = localStorage.getItem('local_leaderboard');
  let localList: LeaderboardEntry[] = localListStr ? JSON.parse(localListStr) : [];
  localList = localList.filter((e) => e.uid !== entry.uid);
  localList.push(entry);
  localStorage.setItem('local_leaderboard', JSON.stringify(localList));

  // Save to Firestore
  try {
    const docRef = doc(db, 'leaderboard', entry.uid);
    await setDoc(docRef, entry, { merge: true });
  } catch (err) {
    console.warn('Leaderboard cloud sync warning (cached locally):', err);
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const mergedMap = new Map<string, LeaderboardEntry>();

  // 1. Add benchmarks
  DEFAULT_LEADERBOARD_BENCHMARKS.forEach((item) => mergedMap.set(item.uid, item));

  // 2. Add local entries
  const localListStr = localStorage.getItem('local_leaderboard');
  if (localListStr) {
    try {
      const localList: LeaderboardEntry[] = JSON.parse(localListStr);
      localList.forEach((item) => mergedMap.set(item.uid, item));
    } catch (e) {
      // ignore
    }
  }

  // 3. Try to fetch from Firestore
  try {
    const q = query(collection(db, 'leaderboard'), limit(25));
    const snapshot = await getDocs(q);
    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as LeaderboardEntry;
        mergedMap.set(data.uid, data);
      }
    });
  } catch (err) {
    console.warn('Could not query remote leaderboard, using cached entries:', err);
  }

  // Return sorted descending by highScore
  return Array.from(mergedMap.values()).sort((a, b) => b.highScore - a.highScore);
}
