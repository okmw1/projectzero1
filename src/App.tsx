import React, { useState, useEffect, useMemo } from 'react';
import { StudentNote, PhotoCard, UserSession, AuthorizedTeacher, StudentLetter } from './types';
import { INITIAL_STUDENT_NOTES, INITIAL_PHOTO_CARDS, INITIAL_AUTHORIZED_TEACHERS } from './data/initialNotes';
import { Navbar } from './components/Navbar';
import { BackgroundDoodles } from './components/BackgroundDoodles';
import { HeroSection } from './components/HeroSection';
import { ClassLetterSection } from './components/ClassLetterSection';
import { GratitudeWallSection } from './components/GratitudeWallSection';
import { WriteNoteSection } from './components/WriteNoteSection';
import { Footer } from './components/Footer';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { TeacherIntroModal } from './components/TeacherIntroModal';
import { TeacherGreetingBanner } from './components/TeacherGreetingBanner';
import { TeacherReplyModal } from './components/TeacherReplyModal';
import { TeacherMailboxModal } from './components/TeacherMailboxModal';
import { realtimeHub } from './utils/realtime';
import {
  addNoteToCloud,
  likeNoteInCloud,
  deleteNoteFromCloud,
  subscribeToRecentNotes,
  subscribeToAuthorizedTeachers,
  saveTeacherToCloud,
  deleteTeacherFromCloud,
  seedInitialNotesIfEmpty,
  sendLetterToCloud,
  subscribeToLetters,
  markLetterAsReadInCloud,
  toggleLetterBookmarkInCloud,
  cleanupInvalidTeachers,
} from './firebase/db';

const cleanTeacherList = (list: AuthorizedTeacher[]) =>
  list.filter(
    (t) =>
      t &&
      t.name &&
      !t.name.startsWith('@') &&
      t.name.toLowerCase() !== 'projectastra' &&
      (t.subject || '').toLowerCase() !== 'unknown'
  );

export default function App() {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const savedUser = localStorage.getItem('teacher_day_user_session_v2');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Error loading session', e);
    }
    return null;
  });

  const [authorizedTeachers, setAuthorizedTeachers] = useState<AuthorizedTeacher[]>(() => {
    try {
      const saved = localStorage.getItem('authorized_teachers_v1');
      if (saved) {
        return cleanTeacherList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading authorized teachers', e);
    }
    return INITIAL_AUTHORIZED_TEACHERS;
  });

  const [notes, setNotes] = useState<StudentNote[]>(() => {
    try {
      const saved = localStorage.getItem('teachers_day_gratitude_notes_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading notes', e);
    }
    return INITIAL_STUDENT_NOTES;
  });

  const [photoCards, setPhotoCards] = useState<PhotoCard[]>(() => {
    try {
      const saved = localStorage.getItem('teachers_day_photos_v3');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading photos', e);
    }
    return INITIAL_PHOTO_CARDS;
  });

  const [letters, setLetters] = useState<StudentLetter[]>(() => {
    try {
      const saved = localStorage.getItem('teacher_day_letters_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading letters', e);
    }
    return [];
  });

  // Modal open states & active filters
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isTeacherIntroOpen, setIsTeacherIntroOpen] = useState(false);
  const [isTeacherReplyOpen, setIsTeacherReplyOpen] = useState(false);
  const [isTeacherMailboxOpen, setIsTeacherMailboxOpen] = useState(false);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string | null>(null);

  // Cloud Firestore subscriptions for multi-device sync supporting 10,000+ students & letters
  useEffect(() => {
    seedInitialNotesIfEmpty(INITIAL_STUDENT_NOTES);
    cleanupInvalidTeachers();

    const unsubscribeNotes = subscribeToRecentNotes((cloudNotes) => {
      if (cloudNotes && cloudNotes.length > 0) {
        setNotes((prev) => {
          const map = new Map<string, StudentNote>();
          prev.forEach((n) => map.set(n.id, n));
          cloudNotes.forEach((n) => map.set(n.id, n));
          const getTime = (val?: number | string) =>
            typeof val === 'number' ? val : val ? new Date(val).getTime() : 0;
          return Array.from(map.values()).sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
        });
      }
    });

    const unsubscribeTeachers = subscribeToAuthorizedTeachers((cloudTeachers) => {
      if (cloudTeachers && cloudTeachers.length > 0) {
        const cleaned = cleanTeacherList(cloudTeachers);
        setAuthorizedTeachers((prev) => {
          const map = new Map<string, AuthorizedTeacher>();
          cleanTeacherList(prev).forEach((t) => map.set(t.id, t));
          cleaned.forEach((t) => map.set(t.id, t));
          return Array.from(map.values());
        });
      }
    });

    const unsubscribeLetters = subscribeToLetters((cloudLetters) => {
      if (cloudLetters) {
        setLetters(cloudLetters);
      }
    });

    return () => {
      unsubscribeNotes();
      unsubscribeTeachers();
      unsubscribeLetters();
    };
  }, []);

  // Real-time synchronization subscription
  useEffect(() => {
    const unsubscribe = realtimeHub.subscribe((event) => {
      if (event.type === 'NOTE_ADDED') {
        setNotes((prev) => {
          if (prev.some((n) => n.id === event.note.id)) return prev;
          return [event.note, ...prev];
        });
      } else if (event.type === 'NOTE_LIKED') {
        setNotes((prev) =>
          prev.map((n) => (n.id === event.noteId ? { ...n, likes: event.likes } : n))
        );
      } else if (event.type === 'NOTE_DELETED') {
        setNotes((prev) => prev.filter((n) => n.id !== event.noteId));
      } else if (event.type === 'TEACHER_REPLY') {
        setNotes((prev) => {
          if (prev.some((n) => n.id === event.note.id)) return prev;
          return [event.note, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Save notes to localStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem('teachers_day_gratitude_notes_v2', JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes', e);
    }
  }, [notes]);

  // Save photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('teachers_day_photos_v3', JSON.stringify(photoCards));
    } catch (e) {
      console.error('Error saving photos', e);
    }
  }, [photoCards]);

  // Save authorized teachers to localStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem('authorized_teachers_v1', JSON.stringify(authorizedTeachers));
    } catch (e) {
      console.error('Error saving authorized teachers', e);
    }
  }, [authorizedTeachers]);

  // Save letters to localStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem('teacher_day_letters_v1', JSON.stringify(letters));
    } catch (e) {
      console.error('Error saving letters', e);
    }
  }, [letters]);

  // Save session to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('teacher_day_user_session_v2', JSON.stringify(user));
      } else {
        localStorage.removeItem('teacher_day_user_session_v2');
      }
    } catch (e) {
      console.error('Error saving user session', e);
    }
  }, [user]);

  const handleSendLetter = (newLetter: StudentLetter) => {
    setLetters((prev) => [newLetter, ...prev]);
    sendLetterToCloud(newLetter);
  };

  const handleMarkLetterAsRead = (letterId: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === letterId ? { ...l, isRead: true } : l))
    );
    markLetterAsReadInCloud(letterId);
  };

  const handleToggleBookmarkLetter = (letterId: string, currentBookmark: boolean) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === letterId ? { ...l, isBookmarked: !currentBookmark } : l))
    );
    toggleLetterBookmarkInCloud(letterId, !currentBookmark);
  };

  const teacherUnreadLettersCount = useMemo(() => {
    if (user?.role !== 'teacher') return 0;
    return letters.filter(
      (l) =>
        !l.isRead &&
        (!l.recipientTeacherName ||
          l.recipientTeacherName.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(l.recipientTeacherName.toLowerCase()))
    ).length;
  }, [user, letters]);

  const handleTeacherLogin = (session: UserSession) => {
    setUser(session);
    setActiveSubjectFilter('My Subject');
    setIsTeacherIntroOpen(true);
  };

  const handleAdminLogin = (session: UserSession) => {
    setUser(session);
    setIsAdminDashboardOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSubjectFilter(null);
    setIsTeacherIntroOpen(false);
    setIsAdminDashboardOpen(false);
  };

  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddNote = (newNote: StudentNote, savePermanently: boolean) => {
    setNotes((prev) => [newNote, ...prev]);
    realtimeHub.broadcast({ type: 'NOTE_ADDED', note: newNote });
    addNoteToCloud(newNote);
  };

  const handleLikeNote = (noteId: string) => {
    setNotes((prev) => {
      let updatedLikes = 1;
      const next = prev.map((n) => {
        if (n.id === noteId) {
          updatedLikes = (n.likes || 0) + 1;
          return { ...n, likes: updatedLikes };
        }
        return n;
      });
      realtimeHub.broadcast({ type: 'NOTE_LIKED', noteId, likes: updatedLikes });
      return next;
    });
    likeNoteInCloud(noteId);
  };

  const handleDeleteInappropriateNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    realtimeHub.broadcast({ type: 'NOTE_DELETED', noteId });
    deleteNoteFromCloud(noteId);
  };

  const handleAddPhoto = (newPhoto: PhotoCard) => {
    setPhotoCards((prev) => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotoCards((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePostTeacherReply = (teacherNote: StudentNote) => {
    setNotes((prev) => [teacherNote, ...prev]);
    realtimeHub.broadcast({ type: 'TEACHER_REPLY', note: teacherNote });
    addNoteToCloud(teacherNote);
  };

  const handleGrantTeacher = (teacher: AuthorizedTeacher) => {
    setAuthorizedTeachers((prev) => {
      const existing = prev.find((t) => t.id === teacher.id);
      if (existing) {
        return prev.map((t) => (t.id === teacher.id ? teacher : t));
      }
      return [...prev, teacher];
    });
    saveTeacherToCloud(teacher);
  };

  const handleRevokeTeacher = (id: string) => {
    setAuthorizedTeachers((prev) => prev.filter((t) => t.id !== id));
    deleteTeacherFromCloud(id);
  };

  const handleTeacherRequestAccess = (req: Omit<AuthorizedTeacher, 'id' | 'status'>) => {
    const newReq: AuthorizedTeacher = {
      id: `teacher-req-${Date.now()}`,
      name: req.name,
      subject: req.subject,
      accessCode: req.accessCode,
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
    };
    setAuthorizedTeachers((prev) => [...prev, newReq]);
    saveTeacherToCloud(newReq);
  };

  // Real-time teacher's owned subject statistics
  const teacherSubject = user?.role === 'teacher' ? user.subject : null;

  const mySubjectNotes = useMemo(() => {
    if (!teacherSubject) return [];
    return notes.filter((n) => {
      const matchSubj = n.subject.toLowerCase() === teacherSubject.toLowerCase();
      const matchName = user?.name && n.message.toLowerCase().includes(user.name.toLowerCase());
      return matchSubj || matchName;
    });
  }, [notes, teacherSubject, user?.name]);

  const mySubjectHearts = useMemo(() => {
    return mySubjectNotes.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  }, [mySubjectNotes]);

  return (
    <div className="min-h-screen bg-[#FDF2CA] text-[#2D2823] relative overflow-x-hidden selection:bg-[#E8D5C4] selection:text-[#2D2823]">
      {/* Background Floating Stickers & Doodles */}
      <BackgroundDoodles />

      {/* Top Banner when Teacher or Admin is logged in */}
      {user && (
        <TeacherGreetingBanner
          user={user}
          subjectNotesCount={mySubjectNotes.length}
          subjectHeartsCount={mySubjectHearts}
          unreadLettersCount={teacherUnreadLettersCount}
          onOpenIntro={() => setIsTeacherIntroOpen(true)}
          onOpenMailbox={() => setIsTeacherMailboxOpen(true)}
          onWriteReply={() => setIsTeacherReplyOpen(true)}
          onFilterMySubject={() => {
            setActiveSubjectFilter('My Subject');
            handleScrollTo('wall-section');
          }}
          onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Top Navbar: Shows ONLY Teacher Login for public users; Admin is hidden */}
      <Navbar
        onScrollTo={handleScrollTo}
        user={user}
        onOpenTeacherLogin={() => setIsTeacherLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenIntro={() => setIsTeacherIntroOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 pt-2 pb-8">
        {/* Section 1: Hero */}
        <HeroSection onWriteClick={() => handleScrollTo('write-section')} />

        {/* Section 2: Dear Teachers Note */}
        <ClassLetterSection />

        {/* Section 3: The Classroom Gratitude Wall & Photo Pinboard */}
        <GratitudeWallSection
          notes={notes}
          photoCards={photoCards}
          user={user}
          activeSubjectFilter={activeSubjectFilter}
          onFilterChange={(subj) => setActiveSubjectFilter(subj)}
          onAddPhoto={handleAddPhoto}
          onRemovePhoto={handleRemovePhoto}
          onLikeNote={handleLikeNote}
          onRemoveNote={handleDeleteInappropriateNote}
          onOpenTeacherReply={() => setIsTeacherReplyOpen(true)}
        />

        {/* Section 4: Add Your Appreciation Note / Send Formal Letter Form */}
        <WriteNoteSection
          onAddNote={handleAddNote}
          onSendLetter={handleSendLetter}
          authorizedTeachers={authorizedTeachers}
        />
      </main>

      {/* Footer with subtle hidden paperclip admin entry point */}
      <Footer onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

      {/* Teacher Mailbox Modal for Reading Long-Form Student Letters */}
      {user && user.role === 'teacher' && (
        <TeacherMailboxModal
          isOpen={isTeacherMailboxOpen}
          onClose={() => setIsTeacherMailboxOpen(false)}
          teacherName={user.name}
          teacherSubject={user.subject}
          letters={letters}
          onMarkAsRead={handleMarkLetterAsRead}
          onToggleBookmark={handleToggleBookmarkLetter}
          onReplyToStudent={(_studentName) => {
            setIsTeacherReplyOpen(true);
          }}
        />
      )}

      {/* Dedicated Teacher Login Modal */}
      <TeacherLoginModal
        isOpen={isTeacherLoginOpen}
        onClose={() => setIsTeacherLoginOpen(false)}
        authorizedTeachers={authorizedTeachers}
        onLogin={handleTeacherLogin}
        onRequestAccess={handleTeacherRequestAccess}
      />

      {/* Separate Hidden Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />

      {/* Admin Dashboard: Delete inappropriate notes & grant teacher login access */}
      {user && user.role === 'admin' && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          notes={notes}
          authorizedTeachers={authorizedTeachers}
          onDeleteInappropriateNote={handleDeleteInappropriateNote}
          onGrantTeacher={handleGrantTeacher}
          onRevokeTeacher={handleRevokeTeacher}
        />
      )}

      {/* Special Celebratory Teacher's Day Intro Modal with real-time subject updates */}
      {user && user.role === 'teacher' && (
        <TeacherIntroModal
          isOpen={isTeacherIntroOpen}
          onClose={() => setIsTeacherIntroOpen(false)}
          user={user}
          notes={notes}
          onWriteReply={() => setIsTeacherReplyOpen(true)}
          onViewSubjectNotes={(subj) => {
            setActiveSubjectFilter('My Subject');
            handleScrollTo('wall-section');
          }}
        />
      )}

      {/* Teacher Reply Composer Modal */}
      {user && user.role === 'teacher' && (
        <TeacherReplyModal
          isOpen={isTeacherReplyOpen}
          onClose={() => setIsTeacherReplyOpen(false)}
          user={user}
          onPostReply={handlePostTeacherReply}
        />
      )}
    </div>
  );
}
