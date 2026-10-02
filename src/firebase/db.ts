import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  increment,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentNote, AuthorizedTeacher, StudentLetter } from '../types';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'notes', 'health-check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Fallback cache active.');
    }
  }
}

testFirestoreConnection();

export const NOTES_PER_BATCH = 24;

export interface FetchNotesResult {
  notes: StudentNote[];
  lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Fetch notes batch from Firestore supporting 10,000+ records via cursors
 */
export async function fetchNotesPage(
  lastDoc: QueryDocumentSnapshot<DocumentData> | null,
  batchSize: number = NOTES_PER_BATCH,
  subjectFilter?: string | null
): Promise<FetchNotesResult> {
  try {
    const notesRef = collection(db, 'notes');
    let q;

    if (subjectFilter && subjectFilter !== 'All notes') {
      if (lastDoc) {
        q = query(
          notesRef,
          where('subject', '==', subjectFilter.toUpperCase()),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(batchSize)
        );
      } else {
        q = query(
          notesRef,
          where('subject', '==', subjectFilter.toUpperCase()),
          orderBy('createdAt', 'desc'),
          limit(batchSize)
        );
      }
    } else {
      if (lastDoc) {
        q = query(notesRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(batchSize));
      } else {
        q = query(notesRef, orderBy('createdAt', 'desc'), limit(batchSize));
      }
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const notes: StudentNote[] = docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        studentName: data.studentName || 'Student',
        grade: data.grade || '',
        subject: data.subject || 'GENERAL APPRECIATION',
        message: data.message || '',
        color: data.color || 'blush',
        likes: typeof data.likes === 'number' ? data.likes : 1,
        createdAt: data.createdAt || Date.now(),
        isTeacherReply: !!data.isTeacherReply,
      };
    });

    const lastVisibleDoc = docs.length > 0 ? docs[docs.length - 1] : null;
    const hasMore = docs.length === batchSize;

    return { notes, lastVisibleDoc, hasMore };
  } catch (error) {
    console.error('Error fetching notes page:', error);
    return { notes: [], lastVisibleDoc: null, hasMore: false };
  }
}

/**
 * Subscribe to the newest live notes (top 30) for instant real-time synchronization
 */
export function subscribeToRecentNotes(onNotesUpdated: (notes: StudentNote[]) => void) {
  const notesRef = collection(db, 'notes');
  const q = query(notesRef, orderBy('createdAt', 'desc'), limit(30));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: StudentNote[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          studentName: data.studentName || 'Student',
          grade: data.grade || '',
          subject: data.subject || 'GENERAL APPRECIATION',
          message: data.message || '',
          color: data.color || 'blush',
          likes: typeof data.likes === 'number' ? data.likes : 1,
          createdAt: data.createdAt || Date.now(),
          isTeacherReply: !!data.isTeacherReply,
        };
      });
      onNotesUpdated(notes);
    },
    (error) => {
      console.error('Realtime listener error:', error);
    }
  );
}

/**
 * Add a new student note to Cloud Firestore
 */
export async function addNoteToCloud(note: StudentNote) {
  try {
    const docRef = doc(db, 'notes', note.id);
    await setDoc(docRef, {
      id: note.id,
      studentName: note.studentName,
      grade: note.grade,
      subject: note.subject.toUpperCase(),
      message: note.message,
      color: note.color,
      likes: note.likes || 1,
      createdAt: note.createdAt || Date.now(),
      isTeacherReply: !!note.isTeacherReply,
    });
  } catch (error) {
    console.error('Error adding note to Firestore:', error);
  }
}

/**
 * Increment like on a note in Cloud Firestore
 */
export async function likeNoteInCloud(noteId: string) {
  try {
    const docRef = doc(db, 'notes', noteId);
    await updateDoc(docRef, {
      likes: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing likes:', error);
  }
}

/**
 * Delete inappropriate note from Cloud Firestore (Admin)
 */
export async function deleteNoteFromCloud(noteId: string) {
  try {
    const docRef = doc(db, 'notes', noteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting note from cloud:', error);
  }
}

/**
 * Seed initial sample notes if collection is completely empty
 */
export async function seedInitialNotesIfEmpty(initialNotes: StudentNote[]) {
  try {
    const snapshot = await getDocs(query(collection(db, 'notes'), limit(1)));
    if (snapshot.empty) {
      for (const note of initialNotes) {
        await addNoteToCloud(note);
      }
    }
  } catch (e) {
    console.warn('Notice seeding initial notes:', e);
  }
}

/**
 * Subscribe to authorized teachers collection
 */
export function subscribeToAuthorizedTeachers(onTeachersUpdated: (teachers: AuthorizedTeacher[]) => void) {
  const teachersRef = collection(db, 'teachers');
  return onSnapshot(
    teachersRef,
    (snapshot) => {
      const teachers: AuthorizedTeacher[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: d.name || '',
          subject: d.subject || '',
          accessCode: d.accessCode || '',
          status: d.status || 'pending',
          requestedAt: d.requestedAt,
        };
      });
      onTeachersUpdated(teachers);
    },
    (err) => {
      console.warn('Notice loading teachers from cloud:', err);
    }
  );
}

/**
 * Add or update teacher authorization in Firestore
 */
export async function saveTeacherToCloud(teacher: AuthorizedTeacher) {
  try {
    const docRef = doc(db, 'teachers', teacher.id);
    await setDoc(docRef, teacher);
  } catch (err) {
    console.error('Error saving teacher to cloud:', err);
  }
}

/**
 * Revoke teacher in Firestore
 */
export async function deleteTeacherFromCloud(teacherId: string) {
  try {
    const docRef = doc(db, 'teachers', teacherId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error removing teacher from cloud:', err);
  }
}

/**
 * Remove invalid or student handles mistakenly submitted to the teachers list
 */
export async function cleanupInvalidTeachers() {
  try {
    const snapshot = await getDocs(collection(db, 'teachers'));
    for (const d of snapshot.docs) {
      const data = d.data();
      if (
        data.name?.startsWith('@') ||
        data.name?.toLowerCase().includes('projectastra') ||
        data.subject?.toLowerCase() === 'unknown'
      ) {
        await deleteDoc(doc(db, 'teachers', d.id));
      }
    }
  } catch (e) {
    console.warn('Teacher cleanup notice:', e);
  }
}

/**
 * Send a formal student letter to Cloud Firestore
 */
export async function sendLetterToCloud(letter: StudentLetter) {
  try {
    const docRef = doc(db, 'letters', letter.id);
    await setDoc(docRef, {
      ...letter,
      createdAt: letter.createdAt || Date.now(),
      isRead: !!letter.isRead,
      isBookmarked: !!letter.isBookmarked,
    });
  } catch (err) {
    console.error('Error sending letter to cloud:', err);
  }
}

/**
 * Subscribe to all letters or letters for a specific teacher
 */
export function subscribeToLetters(onLettersUpdated: (letters: StudentLetter[]) => void, teacherName?: string) {
  const lettersRef = collection(db, 'letters');
  const q = query(lettersRef, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      let letters: StudentLetter[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          recipientTeacherName: d.recipientTeacherName || '',
          recipientSubject: d.recipientSubject || '',
          studentName: d.studentName || 'Student',
          grade: d.grade || '',
          templateType: d.templateType || 'custom',
          title: d.title || 'Thank You Teacher',
          body: d.body || '',
          createdAt: d.createdAt || Date.now(),
          isRead: !!d.isRead,
          isBookmarked: !!d.isBookmarked,
          pinPreviewToWall: !!d.pinPreviewToWall,
        };
      });

      if (teacherName) {
        letters = letters.filter(
          (l) => l.recipientTeacherName.toLowerCase().includes(teacherName.toLowerCase())
        );
      }

      onLettersUpdated(letters);
    },
    (err) => {
      console.warn('Notice loading letters from cloud:', err);
    }
  );
}

/**
 * Mark a letter as read in Cloud Firestore
 */
export async function markLetterAsReadInCloud(letterId: string) {
  try {
    const docRef = doc(db, 'letters', letterId);
    await updateDoc(docRef, {
      isRead: true,
    });
  } catch (err) {
    console.error('Error marking letter as read:', err);
  }
}

/**
 * Toggle bookmark on a letter in Cloud Firestore
 */
export async function toggleLetterBookmarkInCloud(letterId: string, isBookmarked: boolean) {
  try {
    const docRef = doc(db, 'letters', letterId);
    await updateDoc(docRef, {
      isBookmarked,
    });
  } catch (err) {
    console.error('Error toggling letter bookmark:', err);
  }
}

