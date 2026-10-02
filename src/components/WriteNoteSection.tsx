import React, { useState } from 'react';
import { StudentNote, NoteColor, StudentLetter, AuthorizedTeacher } from '../types';
import { NOTE_COLOR_MAP } from '../data/initialNotes';
import { LETTER_TEMPLATES } from '../data/letterTemplates';
import confetti from 'canvas-confetti';
import { playChime } from '../utils/audio';
import { Mail, StickyNote, Sparkles, Send } from 'lucide-react';

interface WriteNoteSectionProps {
  onAddNote: (newNote: StudentNote, savePermanently: boolean) => void;
  onSendLetter?: (newLetter: StudentLetter) => void;
  authorizedTeachers?: AuthorizedTeacher[];
}

export const WriteNoteSection: React.FC<WriteNoteSectionProps> = ({
  onAddNote,
  onSendLetter,
  authorizedTeachers = [],
}) => {
  const [mode, setMode] = useState<'note' | 'letter'>('note');

  // Sticky Note form state
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('');
  const [subjectOrTeacher, setSubjectOrTeacher] = useState('');
  const [message, setMessage] = useState('');
  const [color, setColor] = useState<NoteColor>('blush');
  const [pinToWall, setPinToWall] = useState(true);

  // Letter form state
  const [recipientTeacher, setRecipientTeacher] = useState(
    authorizedTeachers[0]?.name || 'Ms. Rivera'
  );
  const [customTeacherName, setCustomTeacherName] = useState('');
  const [recipientSubject, setRecipientSubject] = useState(
    authorizedTeachers[0]?.subject || 'General Mathematics'
  );
  const [letterTitle, setLetterTitle] = useState(LETTER_TEMPLATES[0].defaultTitle);
  const [letterBody, setLetterBody] = useState(LETTER_TEMPLATES[0].bodyTemplate);
  const [selectedTemplateId, setSelectedTemplateId] = useState<'mentorship' | 'subject' | 'patience' | 'custom'>('mentorship');
  const [pinLetterPreview, setPinLetterPreview] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState<'note' | 'letter'>('note');

  const colors: NoteColor[] = ['blush', 'sky', 'mint', 'sunshine', 'lilac', 'coral'];

  // Handle teacher dropdown change
  const handleTeacherSelect = (teacherName: string) => {
    setRecipientTeacher(teacherName);
    const matched = authorizedTeachers.find((t) => t.name === teacherName);
    if (matched) {
      setRecipientSubject(matched.subject);
    }
  };

  // Filter approved teachers and remove student handles like @projectastra
  const validTeachers = authorizedTeachers.filter(
    (t) =>
      t &&
      t.status === 'approved' &&
      !t.name.startsWith('@') &&
      t.name.toLowerCase() !== 'projectastra' &&
      (t.subject || '').toLowerCase() !== 'unknown'
  );

  // Apply a starter template
  const applyTemplate = (templateId: 'mentorship' | 'subject' | 'patience') => {
    setSelectedTemplateId(templateId);
    const template = LETTER_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setLetterTitle(template.defaultTitle);

    const actualTeacher = recipientTeacher === 'CUSTOM' ? (customTeacherName || 'Teacher') : recipientTeacher;
    const actualStudent = studentName.trim() || '[Your Name]';
    const actualSubject = recipientSubject || '[Subject]';

    const filled = template.bodyTemplate
      .replace(/\[Teacher's Name\]/g, actualTeacher)
      .replace(/\[Subject\]/g, actualSubject)
      .replace(/\[Your Name\]/g, actualStudent);

    setLetterBody(filled);
  };

  // Blank letter option (no pre-filled template text)
  const applyBlankLetter = () => {
    setSelectedTemplateId('custom');
    const actualTeacher =
      recipientTeacher === 'CUSTOM' ? (customTeacherName || 'Teacher') : recipientTeacher;
    const actualStudent = studentName.trim() || '[Your Name]';
    setLetterTitle('A Personal Note of Gratitude');
    setLetterBody(`Dear ${actualTeacher},\n\n\n\nWith warm gratitude,\n${actualStudent}`);
  };

  // Submit Sticky Note
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !message.trim()) {
      setErrorMessage('Please provide your name and your thank-you message.');
      return;
    }

    setErrorMessage('');

    const formattedMessage = message.trim().startsWith('“')
      ? message.trim()
      : `“${message.trim()}”`;

    const newNote: StudentNote = {
      id: `note-${Date.now()}`,
      studentName: studentName.trim(),
      grade: grade.trim() || 'Student',
      subject: (subjectOrTeacher.trim() || 'GENERAL APPRECIATION').toUpperCase(),
      message: formattedMessage,
      color,
      likes: 1,
      createdAt: Date.now(),
    };

    onAddNote(newNote, pinToWall);

    playChime();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FCECEB', '#D8ECFD', '#D7F3E3', '#FDF2B5', '#ECE8FD', '#CE5A46'],
    });

    setStudentName('');
    setGrade('');
    setSubjectOrTeacher('');
    setMessage('');
    setColor('blush');
    setSubmittedType('note');
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 5000);

    const wallEl = document.getElementById('wall-section');
    if (wallEl) {
      wallEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit Formal Letter
  const handleLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const actualTeacher =
      recipientTeacher === 'CUSTOM' ? customTeacherName.trim() : recipientTeacher.trim();

    if (!studentName.trim() || !actualTeacher || !letterTitle.trim() || !letterBody.trim()) {
      setErrorMessage('Please provide your name, the teacher recipient, title, and letter content.');
      return;
    }

    setErrorMessage('');

    const newLetter: StudentLetter = {
      id: `letter-${Date.now()}`,
      recipientTeacherName: actualTeacher,
      recipientSubject: recipientSubject.trim() || 'General Appreciation',
      studentName: studentName.trim(),
      grade: grade.trim() || 'Student',
      templateType: selectedTemplateId,
      title: letterTitle.trim(),
      body: letterBody.trim(),
      createdAt: Date.now(),
      isRead: false,
      isBookmarked: false,
      pinPreviewToWall: pinLetterPreview,
    };

    if (onSendLetter) {
      onSendLetter(newLetter);
    }

    // If opted in, also pin a short preview note to the public wall
    if (pinLetterPreview) {
      const excerpt =
        letterBody.length > 200
          ? `${letterBody.substring(0, 190).trim()}... [Full letter in teacher's mailbox]`
          : letterBody;

      const previewNote: StudentNote = {
        id: `note-from-letter-${Date.now()}`,
        studentName: studentName.trim(),
        grade: grade.trim() || 'Student',
        subject: `${actualTeacher} (${recipientSubject})`.toUpperCase(),
        message: `“${excerpt}”`,
        color: 'lilac',
        likes: 1,
        createdAt: Date.now(),
      };
      onAddNote(previewNote, true);
    }

    playChime();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#E7C14A', '#CE5A46', '#1F453B', '#FCECEB'],
    });

    setSubmittedType('letter');
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 6000);
  };

  return (
    <section id="write-section" className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20 z-10">
      {/* Outer Card */}
      <div className="relative board-card border border-[#E8DFD1] p-6 sm:p-10 md:p-12">
        {/* Format Selector Pill Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-[#E8DFD1]">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] font-bold text-[#CE5A46] mb-1">
              CHOOSE TRIBUTE FORMAT
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#231F1D] tracking-tight">
              {mode === 'note' ? "Write a Teacher's Day Note" : 'Send a Formal Heartfelt Letter'}
            </h2>
          </div>

          <div className="inline-flex p-1.5 rounded-2xl bg-[#EFE8DC] border border-[#DDD0BF] shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode('note');
                setErrorMessage('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                mode === 'note'
                  ? 'bg-white text-[#2B2520] shadow-xs'
                  : 'text-[#6C5E50] hover:text-[#2B2520]'
              }`}
            >
              <StickyNote className="w-4 h-4 text-[#CE5A46]" />
              <span>Sticky Note (Quick)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('letter');
                setErrorMessage('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                mode === 'letter'
                  ? 'bg-[#1F453B] text-white shadow-xs'
                  : 'text-[#6C5E50] hover:text-[#2B2520]'
              }`}
            >
              <Mail className="w-4 h-4 text-[#F7DE85]" />
              <span>Heartfelt Letter (Long-form)</span>
            </button>
          </div>
        </div>

        {justSubmitted && (
          <div className="mb-6 p-4 rounded-xl bg-[#D7F3E3] border border-[#B2E7C6] text-[#246B46] text-sm font-medium flex items-center gap-2">
            <span>✨</span>
            <span>
              {submittedType === 'letter'
                ? "Your heartfelt letter has been sealed and delivered directly to the teacher's mailbox!"
                : 'Your appreciation note has been pinned to the Gratitude Wall!'}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-[#FCECEB] border border-[#F6CDCA] text-[#CE5A46] text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* MODE 1: STICKY NOTE FORM */}
        {mode === 'note' && (
          <form onSubmit={handleNoteSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                  YOUR NAME / HANDLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manta or @projectastra"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD0BF] text-sm text-[#231F1D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46] transition-all"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                  GRADE / SECTION (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 11 - STEM"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD0BF] text-sm text-[#231F1D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46] transition-all"
                  maxLength={40}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                  SUBJECT OR TEACHER
                </label>
                <input
                  type="text"
                  placeholder="e.g. General Mathematics"
                  value={subjectOrTeacher}
                  onChange={(e) => setSubjectOrTeacher(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD0BF] text-sm text-[#231F1D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46] transition-all"
                  maxLength={60}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider">
                  YOUR MESSAGE
                </label>
                <span className="text-xs text-[#8C7D6F] font-mono">{message.length}/500</span>
              </div>
              <textarea
                rows={4}
                placeholder="Share a memory, a lesson that helped you, or simple thanks for their everyday kindness..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD0BF] text-sm sm:text-base text-[#231F1D] font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46] transition-all"
              />
            </div>

            {/* Note Color Picker */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                CHOOSE NOTE COLOR
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {colors.map((c) => {
                  const theme = NOTE_COLOR_MAP[c];
                  const isSelected = color === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                      className={`h-10 px-4 rounded-xl border-2 flex items-center gap-2 text-xs font-semibold capitalize transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-black/30 scale-105 shadow-sm' : 'hover:scale-102 opacity-85'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.headerText }} />
                      <span style={{ color: theme.headerText }}>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 text-xs text-[#6C5E50] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinToWall}
                  onChange={(e) => setPinToWall(e.target.checked)}
                  className="rounded text-[#CE5A46] focus:ring-[#CE5A46]"
                />
                <span>Pin this note to the classroom Gratitude Wall for everyone to see</span>
              </label>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#CE5A46] hover:bg-[#B34B36] text-white font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Pin note to wall</span>
                <span className="text-base">📌</span>
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: FORMAL HEARTFELT LETTER FORM */}
        {mode === 'letter' && (
          <form onSubmit={handleLetterSubmit} className="space-y-6">
            {/* Template Selection Pills */}
            <div className="bg-[#FAF5EC] p-4 rounded-2xl border border-[#DECDB8]">
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-[#1F453B]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E7C14A]" />
                  <span>CHOOSE A STARTER TEMPLATE (OR WRITE FROM SCRATCH):</span>
                </div>
                {selectedTemplateId === 'custom' && (
                  <span className="text-[11px] font-mono text-[#7A6C5D] bg-white/80 px-2 py-0.5 rounded-full border border-[#D5C2A8]">
                    No Template / Custom Mode
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {LETTER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-white border-[#1F453B] ring-2 ring-[#1F453B]/20 shadow-xs'
                        : 'bg-white/60 border-[#DECDB8] hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#2B2520] flex items-center gap-1.5 mb-1">
                      <span>{tmpl.icon}</span>
                      <span>{tmpl.title}</span>
                    </div>
                    <div className="text-[11px] text-[#736555] line-clamp-2 leading-tight">
                      {tmpl.subtitle}
                    </div>
                  </button>
                ))}

                {/* 4th Option: No Template / Blank Letter */}
                <button
                  type="button"
                  onClick={applyBlankLetter}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplateId === 'custom'
                      ? 'bg-white border-[#1F453B] ring-2 ring-[#1F453B]/20 shadow-xs'
                      : 'bg-white/60 border-[#DECDB8] hover:bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-[#2B2520] flex items-center gap-1.5 mb-1">
                    <span>✍️</span>
                    <span>No Template</span>
                  </div>
                  <div className="text-[11px] text-[#736555] line-clamp-2 leading-tight">
                    Blank stationery to write your own letter from scratch
                  </div>
                </button>
              </div>
            </div>

            {/* Recipient Teacher & Student Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                  TO (TEACHER RECIPIENT)
                </label>
                <select
                  value={recipientTeacher}
                  onChange={(e) => handleTeacherSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD0BF] text-xs font-medium text-[#231F1D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/30"
                >
                  {validTeachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                  <option value="CUSTOM">+ Other Teacher (Type below)</option>
                </select>

                {recipientTeacher === 'CUSTOM' && (
                  <input
                    type="text"
                    placeholder="Enter teacher's name..."
                    value={customTeacherName}
                    onChange={(e) => setCustomTeacherName(e.target.value)}
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-white border border-[#DDD0BF] text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                  YOUR NAME / SIGNATURE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manta or Grade 11 STEM"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD0BF] text-xs text-[#231F1D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/30"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                  GRADE / SECTION
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 12"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD0BF] text-xs text-[#231F1D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/30"
                  maxLength={40}
                />
              </div>
            </div>

            {/* Letter Title */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider mb-2">
                LETTER SUBJECT / TITLE
              </label>
              <input
                type="text"
                value={letterTitle}
                onChange={(e) => {
                  setLetterTitle(e.target.value);
                  setSelectedTemplateId('custom');
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDD0BF] text-sm font-heading font-bold text-[#231F1D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/30"
                maxLength={140}
              />
            </div>

            {/* Parchment Lined Letter Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase font-bold text-[#4F4439] tracking-wider">
                  LETTER BODY (MULTI-PARAGRAPH KEEPSAKE)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId('custom');
                      setLetterBody('');
                    }}
                    className="text-[11px] font-semibold text-[#8C7D6F] hover:text-[#CE5A46] underline transition-colors cursor-pointer"
                  >
                    Clear text
                  </button>
                  <span className="text-xs text-[#8C7D6F] font-mono">{letterBody.length}/3500</span>
                </div>
              </div>

              <div className="relative rounded-2xl border border-[#D5C2A8] bg-[#FFFDF9] shadow-inner p-4 sm:p-6">
                <textarea
                  rows={10}
                  value={letterBody}
                  onChange={(e) => {
                    setLetterBody(e.target.value);
                    setSelectedTemplateId('custom');
                  }}
                  maxLength={3500}
                  placeholder="Write your heartfelt multi-paragraph letter here..."
                  className="w-full bg-transparent text-sm sm:text-base font-serif text-[#2B2520] leading-relaxed resize-y focus:outline-none"
                />
              </div>
            </div>

            {/* Options & Send Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 text-xs text-[#6C5E50] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinLetterPreview}
                  onChange={(e) => setPinLetterPreview(e.target.checked)}
                  className="rounded text-[#1F453B] focus:ring-[#1F453B]"
                />
                <span>Also pin a preview quote of this letter to the public Gratitude Wall</span>
              </label>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1F453B] hover:bg-[#16332B] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#F7DE85]" />
                <span>Seal & Send to Teacher Mailbox</span>
                <span className="text-base">💌</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
