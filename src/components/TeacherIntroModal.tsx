import React, { useEffect, useState, useMemo } from 'react';
import { UserSession, StudentNote } from '../types';
import { X, Sparkles, BookOpen, MessageSquareHeart, Heart, Radio, Quote, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime } from '../utils/audio';

interface TeacherIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession;
  notes: StudentNote[];
  onWriteReply?: () => void;
  onViewSubjectNotes?: (subject: string) => void;
}

export const TeacherIntroModal: React.FC<TeacherIntroModalProps> = ({
  isOpen,
  onClose,
  user,
  notes,
  onWriteReply,
  onViewSubjectNotes,
}) => {
  const [pulseActive, setPulseActive] = useState(false);

  // Filter notes belonging to this teacher's owned subject or specifically mentioning teacher's name
  const teacherSubject = user.subject || 'General Appreciation';
  
  const subjectNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchSubject = n.subject.toLowerCase() === teacherSubject.toLowerCase();
      const matchName = user.name && n.message.toLowerCase().includes(user.name.toLowerCase());
      return matchSubject || matchName;
    });
  }, [notes, teacherSubject, user.name]);

  const subjectHearts = useMemo(() => {
    return subjectNotes.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  }, [subjectNotes]);

  const totalSchoolNotes = notes.length;
  const totalSchoolHearts = useMemo(() => {
    return notes.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  }, [notes]);

  // Trigger celebration on modal open
  useEffect(() => {
    if (isOpen) {
      playChime();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#FCECEB', '#D8ECFD', '#D7F3E3', '#FDF2B5', '#ECE8FD', '#CE5A46', '#E7C14A'],
      });
    }
  }, [isOpen]);

  // Flash real-time pulse when subjectNotes change while modal is open
  useEffect(() => {
    if (isOpen) {
      setPulseActive(true);
      const timer = setTimeout(() => setPulseActive(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [subjectNotes.length, subjectHearts, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-xl bg-[#FFFDF9] border-2 border-[#EEDBCA] rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Decorative corner stickers */}
        <span className="absolute top-4 left-5 text-2xl select-none">🌸</span>
        <span className="absolute top-4 right-14 text-2xl select-none">✨</span>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#887B6E] hover:text-[#231F1C] p-1.5 rounded-full hover:bg-[#F3EDE2] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 shrink-0">
          {/* Real-time Live Beacon Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F453B]/10 border border-[#1F453B]/20 text-[#1F453B] text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Real-time tribute to you</span>
          </div>

          {/* Heading */}
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#231F1D] tracking-tight leading-tight">
            Happy Teacher's Day, {user.name}! 💐
          </h2>

          <p className="font-heading italic text-sm sm:text-base text-[#665A4F] mt-1">
            Subject Lead: <span className="font-bold text-[#CE5A46]">{teacherSubject}</span>
          </p>
        </div>

        <div className="overflow-y-auto pr-1 my-3 space-y-3.5 flex-1">
          {/* Narrative Welcome Card */}
          <div className="bg-[#FDF6E9] border border-[#ECD9BE] rounded-2xl p-4 text-[#3A332C] font-body-serif text-xs sm:text-sm leading-relaxed shadow-inner">
            <p className="mb-1.5">
              Today is dedicated to honoring your guidance. Your students in <strong>{teacherSubject}</strong> have pinned heartfelt memories, inside classroom jokes, and words of gratitude to thank you for everything you inspire in them.
            </p>
            <p className="text-[11px] text-[#786653]">
              Live updates: As new student notes are submitted or liked, your personal dashboard updates instantaneously in real-time.
            </p>
          </div>

          {/* Real-Time Teacher's Subject Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-2xl border transition-all text-center ${
                pulseActive
                  ? 'bg-[#FCECEB] border-[#CE5A46] scale-102 shadow-sm'
                  : 'bg-white border-[#E9DFD0]'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#CE5A46] mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{teacherSubject} Notes</span>
              </div>
              <div className="text-3xl font-bold font-mono text-[#CE5A46]">
                {subjectNotes.length}
              </div>
              <div className="text-[11px] font-sans text-[#736555] font-semibold mt-0.5">
                Real-time notes for you
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all text-center ${
                pulseActive
                  ? 'bg-[#FFF8E7] border-[#E7A62E] scale-102 shadow-sm'
                  : 'bg-white border-[#E9DFD0]'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#9C6D14] mb-1">
                <Heart className="w-3.5 h-3.5 fill-[#E7A62E] text-[#E7A62E]" />
                <span>Student Hearts</span>
              </div>
              <div className="text-3xl font-bold font-mono text-[#E7A62E]">
                {subjectHearts}
              </div>
              <div className="text-[11px] font-sans text-[#736555] font-semibold mt-0.5">
                Appreciation received
              </div>
            </div>
          </div>

          {/* Real-Time Live Feed of Notes in Teacher's Subject */}
          <div className="bg-[#FAF7F0] border border-[#EADBCC] rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A3F33] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Live Student Stream ({teacherSubject})</span>
              </span>
              <span className="text-[10px] text-[#8C7D6F] font-mono">
                {subjectNotes.length} dedicated
              </span>
            </div>

            {subjectNotes.length === 0 ? (
              <div className="text-center py-4 text-xs text-[#8C7D6F] font-body-serif italic">
                No notes submitted for this subject yet. Your students will be writing shortly!
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {subjectNotes.slice(0, 4).map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-xl bg-white border border-[#E9DFD0] shadow-2xs text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#CE5A46] mb-1">
                      <span>{note.studentName} {note.grade ? `(${note.grade})` : ''}</span>
                      <span className="flex items-center gap-1 text-[#E7A62E] font-mono font-semibold">
                        <Heart className="w-3 h-3 fill-[#E7A62E]" />
                        {note.likes || 1}
                      </span>
                    </div>
                    <p className="font-body-serif text-[#44382D] line-clamp-2 italic text-[11.5px]">
                      {note.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schoolwide Summary footnote */}
          <div className="text-center text-[11px] text-[#7A6C5D]">
            Across all classes, students have created <strong>{totalSchoolNotes} notes</strong> with <strong>{totalSchoolHearts} hearts</strong> to celebrate our teachers!
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 border-t border-[#EEDBCA] shrink-0">
          <button
            onClick={() => {
              onClose();
              if (onViewSubjectNotes) {
                onViewSubjectNotes(teacherSubject);
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#CE5A46] hover:bg-[#B74A37] rounded-xl shadow-xs transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open {teacherSubject} Wall</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>

          {onWriteReply && (
            <button
              onClick={() => {
                onClose();
                onWriteReply();
              }}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#4A3E33] bg-[#EFE8DD] hover:bg-[#E4DCCE] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-[#CE5A46]" />
              <span>Leave a Teacher Reply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
