import React, { useState, useRef } from 'react';
import { StudentNote, PhotoCard, NoteColor, UserSession } from '../types';
import { NOTE_COLOR_MAP } from '../data/initialNotes';
import { Plus, Sparkles, Heart, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, X, Trash2, MessageSquareHeart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime, playHeartSound } from '../utils/audio';

interface GratitudeWallSectionProps {
  notes: StudentNote[];
  photoCards: PhotoCard[];
  user: UserSession | null;
  activeSubjectFilter?: string | null;
  onFilterChange?: (subject: string) => void;
  onAddPhoto: (photo: PhotoCard) => void;
  onRemovePhoto: (id: string) => void;
  onLikeNote: (id: string) => void;
  onRemoveNote?: (id: string) => void;
  onOpenTeacherReply?: () => void;
}

const SUBJECT_FILTERS = [
  'All notes',
  'General Mathematics',
  'General Science',
  'Effective Communication',
  'Creative Composition',
  'Introduction of Philosophy',
  'Filipino',
  'Others',
];

export const GratitudeWallSection: React.FC<GratitudeWallSectionProps> = ({
  notes,
  photoCards,
  user,
  activeSubjectFilter,
  onFilterChange,
  onAddPhoto,
  onRemovePhoto,
  onLikeNote,
  onRemoveNote,
  onOpenTeacherReply,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('All notes');
  const [starredNoteId, setStarredNoteId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoCard[]>(photoCards);
  const [visibleCount, setVisibleCount] = useState(24);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sync filter when activeSubjectFilter prop changes
  React.useEffect(() => {
    if (activeSubjectFilter) {
      setSelectedFilter(activeSubjectFilter);
      setVisibleCount(24);
    }
  }, [activeSubjectFilter]);

  // Reset pagination when filter changes
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setVisibleCount(24);
  };

  // Keep photos in sync with parent props
  React.useEffect(() => {
    setPhotos(photoCards);
  }, [photoCards]);

  const teacherSubject = user?.role === 'teacher' ? user.subject : null;

  const isTeacherSubjectNote = (note: StudentNote) => {
    if (!teacherSubject) return false;
    return (
      note.subject.toLowerCase() === teacherSubject.toLowerCase() ||
      (user?.name && note.message.toLowerCase().includes(user.name.toLowerCase()))
    );
  };

  const mySubjectNotes = notes.filter(isTeacherSubjectNote);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (selectedFilter === 'All notes') return true;
    if (selectedFilter === 'My Subject' && teacherSubject) {
      return isTeacherSubjectNote(n);
    }
    if (selectedFilter === 'Others') {
      return !SUBJECT_FILTERS.slice(1, 7).some(
        (subj) => subj.toLowerCase() === n.subject.toLowerCase()
      );
    }
    return n.subject.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handlePickStarNote = () => {
    playChime();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FCECEB', '#D8ECFD', '#D7F3E3', '#FDF2B5', '#ECE8FD', '#CE5A46'],
    });

    if (notes.length > 0) {
      const randomIndex = Math.floor(Math.random() * notes.length);
      const chosen = notes[randomIndex];
      setStarredNoteId(chosen.id);

      // Smooth scroll to the starred note
      const el = document.getElementById(`note-${chosen.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleAdjustScale = (id: string, delta: number) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newScale = Math.max(0.7, Math.min(1.4, (p.scale || 1) + delta));
          return { ...p, scale: newScale };
        }
        return p;
      })
    );
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    onRemovePhoto(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: PhotoCard = {
            id: `photo-${Date.now()}-${Math.random()}`,
            src: event.target.result as string,
            alt: file.name,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            scale: 1,
            rotation: (Math.random() - 0.5) * 4,
          };
          setPhotos((prev) => [...prev, newPhoto]);
          onAddPhoto(newPhoto);
        }
      };
      reader.readAsDataURL(file);
    });

    playChime();
  };

  return (
    <section id="wall-section" className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24 z-10">
      {/* Top Header of the Wall */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-[#CE5A46] mb-1.5">
            THE CLASSROOM GRATITUDE WALL
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#231F1D] tracking-tight">
            Little <span className="text-[#CE5A46]">❤️</span> notes. Big Teacher's Day love.
          </h2>
          <p className="font-body-serif text-sm sm:text-base text-[#61564C] mt-1">
            Photos, memories, and student appreciation — all pinned together in one happy place.
          </p>
        </div>

        {/* Top Right Badges: Count & Pick a star note & Teacher Reply */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5DACB] text-xs font-semibold text-[#4A4036] shadow-2xs">
            {notes.length} notes of appreciation
          </div>

          <button
            onClick={handlePickStarNote}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F7DE85] hover:bg-[#F2D46C] text-xs font-bold text-[#634E10] border border-[#E2C358] shadow-2xs transition-all hover:scale-102 cursor-pointer"
          >
            <span>🌟</span>
            <span>Pick a star note</span>
          </button>

          {user?.role === 'teacher' && onOpenTeacherReply && (
            <button
              onClick={onOpenTeacherReply}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1F453B] hover:bg-[#16332C] text-xs font-bold text-white shadow-2xs transition-all hover:scale-102 cursor-pointer"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-[#F7DE85]" />
              <span>Leave Teacher Reply</span>
            </button>
          )}
        </div>
      </div>

      {/* The Big Corkboard / Photo Frame Box (Brown outer border #BD8B67) */}
      <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#BD8B67] p-3 sm:p-5 shadow-lg border-4 border-[#A67551] mb-10 overflow-hidden">
        {/* Inner Light Beige Cork Mat */}
        <div className="rounded-[22px] sm:rounded-[28px] bg-[#F7EBDC] p-4 sm:p-7 border border-[#D8C0A6]">
          {/* Photos Grid Container */}
          {photos.length === 0 ? (
            <div className="py-8 text-center text-[#8C7B6A]">
              <p className="font-body-serif italic text-sm">No photos on the board right now. Click below to add a memory!</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
              {photos.map((photo) => (
                <div key={photo.id} className="flex flex-col items-center relative group">
                  {/* Polaroid Frame */}
                  <div
                    style={{
                      transform: `scale(${photo.scale || 1}) rotate(${photo.rotation || 0}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                    className="relative bg-white p-2.5 sm:p-3 pb-4 rounded-xl shadow-md border border-[#EADBCC] w-[180px] sm:w-[220px]"
                  >
                    {/* Hover delete button in top-right corner of polaroid */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      title="Remove this photo from wall"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md border border-[#D5C2AB] text-[#CE5A46] hover:bg-red-50 hover:text-red-700 flex items-center justify-center text-xs font-bold transition-all cursor-pointer z-10"
                    >
                      ×
                    </button>

                    <div className="w-full h-28 sm:h-36 overflow-hidden rounded-lg bg-[#ECE3D5]">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {photo.caption && (
                      <div className="text-[11px] font-sans text-center text-[#736555] mt-1.5 truncate">
                        {photo.caption}
                      </div>
                    )}
                  </div>

                  {/* Sub-photo Pill Controls: [ - | x | + ] */}
                  <div className="mt-2.5 inline-flex items-center rounded-md bg-white/95 border border-[#D5C2AB] text-[10px] font-mono font-semibold shadow-2xs divide-x divide-[#D5C2AB]">
                    <button
                      onClick={() => handleAdjustScale(photo.id, -0.1)}
                      title="Zoom Out"
                      className="px-2 py-0.5 hover:bg-[#F2E7D8] text-[#554536] cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      title="Remove this photo"
                      className="px-2 py-0.5 hover:bg-red-50 hover:text-[#CE5A46] text-[#735A45] font-bold cursor-pointer"
                    >
                      x
                    </button>
                    <button
                      onClick={() => handleAdjustScale(photo.id, 0.1)}
                      title="Zoom In"
                      className="px-2 py-0.5 hover:bg-[#F2E7D8] text-[#554536] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* "+ Add photo card" Button */}
          <div className="text-center mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-[#FAF4EB] text-xs font-bold text-[#4B3F33] border border-[#DAC6B0] shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <span>+ Add photo card</span>
            </button>
          </div>

          {/* Add a classroom memory dashed dropzone */}
          <div className="relative border-2 border-dashed border-[#D2B89C] rounded-2xl p-6 text-center bg-[#FDF7EE]/80 max-w-xl mx-auto mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <h4 className="font-heading font-bold text-base text-[#382E24] mb-1">
              Add a classroom memory
            </h4>
            <p className="font-body-serif text-xs text-[#6B5C4D] mb-4">
              Choose a few photos or drag them here to brighten the Teacher's Day wall.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#CE5A46] hover:bg-[#B74A37] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Choose photos
            </button>

            <p className="text-[11px] font-sans text-[#8C7B6A] mt-2.5">
              {photos.length > 4
                ? `${photos.length} photos pinned to the memory board!`
                : 'No photos waiting to be added.'}
            </p>
          </div>

          {/* Dark Green Header Strip across the board */}
          <div className="bg-[#1F453B] rounded-xl py-3 px-4 sm:px-6 text-center text-white">
            <div className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-[#CBECE1]">
              THE TEACHER'S DAY GRATITUDE WALL
            </div>
            <div className="font-body-serif text-xs sm:text-sm text-[#A4D5C5] mt-0.5">
              Pin a memory, share a kind word, and celebrate the teachers who make every day brighter.
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {teacherSubject && (
          <button
            onClick={() => handleFilterChange('My Subject')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'My Subject'
                ? 'bg-[#1F453B] text-white border-[#1F453B] shadow-sm ring-2 ring-[#1F453B]/20'
                : 'bg-[#EBF7F2] text-[#1F453B] border-[#A8DEC9] hover:bg-[#DDF2E8]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>⭐ My Subject: {teacherSubject} ({mySubjectNotes.length})</span>
          </button>
        )}

        {SUBJECT_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#CE5A46] text-white border-[#CE5A46] shadow-xs'
                  : 'bg-white/90 text-[#362E27] border-[#DECDB8] hover:bg-white hover:border-[#CE5A46]/60'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* The Pastel Note Cards Grid (Batched 24-at-a-time for 10k+ scalability) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {filteredNotes.slice(0, visibleCount).map((note) => {
          const colorTheme = NOTE_COLOR_MAP[note.color] || NOTE_COLOR_MAP.blush;
          const isStarred = starredNoteId === note.id;
          const isOwnedSubject = user?.role === 'teacher' && isTeacherSubjectNote(note);

          return (
            <div
              key={note.id}
              id={`note-${note.id}`}
              style={{
                backgroundColor: colorTheme.bg,
                borderColor: isOwnedSubject ? '#1F453B' : colorTheme.border,
              }}
              className={`relative note-card border-2 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 ${
                isStarred
                  ? 'ring-4 ring-[#F7DE85] scale-102 shadow-xl'
                  : isOwnedSubject
                  ? 'ring-2 ring-[#1F453B]/30 shadow-md hover:-translate-y-1'
                  : 'hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              {/* Pushpin Hole circle at top center */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-black/25 bg-white/70 shadow-inner" />

              {/* Admin delete button */}
              {user?.role === 'admin' && onRemoveNote && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete note by ${note.studentName}?`)) {
                      onRemoveNote(note.id);
                    }
                  }}
                  title="Admin: Delete this note"
                  className="absolute top-3 right-3 text-[#B34B36] hover:text-red-700 p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div>
                {/* Owned Subject Highlight badge for logged-in teacher */}
                {isOwnedSubject && (
                  <div className="mb-2 -mt-1 px-2.5 py-0.5 rounded-full bg-[#1F453B]/10 border border-[#1F453B]/20 text-[#1F453B] text-[10px] font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>✨</span>
                      <span>Dedicated to your subject: {teacherSubject}</span>
                    </span>
                    <span className="text-emerald-700 font-mono">Real-time</span>
                  </div>
                )}

                {/* Special Teacher's Reply Badge */}
                {note.isTeacherReply && (
                  <div className="mb-2 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1F453B] text-white text-[10px] font-bold tracking-wide uppercase">
                      <span>💐</span>
                      <span>Teacher's Message</span>
                    </span>
                  </div>
                )}

                {/* Subject Header */}
                <div
                  style={{ color: colorTheme.headerText }}
                  className="text-[11px] font-bold uppercase tracking-wider font-sans mb-3 text-center"
                >
                  {note.subject}
                </div>

                {/* Message */}
                <p
                  style={{ color: colorTheme.bodyText }}
                  className={`font-body-serif text-sm sm:text-[14.5px] leading-relaxed my-2 ${
                    note.isTeacherReply ? 'italic font-medium' : ''
                  }`}
                >
                  {note.message}
                </p>
              </div>

              {/* Author & Likes */}
              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                <div
                  style={{ color: colorTheme.authorText }}
                  className="text-xs font-semibold font-sans truncate flex items-center gap-1.5"
                >
                  <span>— {note.studentName}</span>
                  {note.grade && (
                    <span className="opacity-80">, {note.grade}</span>
                  )}
                  {note.isTeacherReply && (
                    <span className="text-[10px] bg-[#1F453B]/10 text-[#1F453B] px-1.5 py-0.2 rounded font-mono">
                      Verified Teacher
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    playHeartSound();
                    onLikeNote(note.id);
                  }}
                  style={{ color: colorTheme.headerText }}
                  className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                  title="Love this note"
                >
                  <Heart className="w-3 h-3 fill-current" />
                  <span>{note.likes || 0}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite Scroll Trigger & Batch Indicator */}
      <div ref={loadMoreRef} className="py-6 flex flex-col items-center justify-center gap-3">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#CE5A46] bg-white/80 px-4 py-2 rounded-full border border-[#ECD9BE] shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CE5A46] animate-ping" />
            <span>Loading more appreciation tributes... 🌸</span>
          </div>
        )}

        {!isLoadingMore && visibleCount < filteredNotes.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className="px-5 py-2 text-xs font-bold text-[#4B3F34] bg-white hover:bg-[#F7EFE3] border border-[#DDD0BF] rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Load 24 more tributes</span>
            <span className="text-[#8C7D6F] font-mono text-[11px]">
              ({filteredNotes.length - visibleCount} remaining)
            </span>
          </button>
        )}

        {visibleCount >= filteredNotes.length && filteredNotes.length > 0 && (
          <div className="text-center py-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/70 border border-[#DECDB8] text-xs font-medium text-[#736555] shadow-2xs">
              <span>🎓</span>
              <span>Showing all {filteredNotes.length} appreciation tributes</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Tagline with 💡 and ★ */}
      <div className="text-center py-4 relative">
        <span className="absolute left-6 sm:left-1/4 top-1/2 -translate-y-1/2 text-lg opacity-80">
          💡
        </span>
        <h3 className="font-heading font-bold text-lg sm:text-xl text-[#2B2520] inline-block px-8">
          Happy Teachers' Day — thank you for helping every student grow.
        </h3>
        <span className="absolute right-6 sm:right-1/4 top-1/2 -translate-y-1/2 text-[#E7C14A] text-lg opacity-90">
          ★
        </span>
      </div>
    </section>
  );
};
