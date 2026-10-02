import React, { useState } from 'react';
import { StudentNote, AuthorizedTeacher } from '../types';
import { X, ShieldCheck, Trash2, CheckCircle2, UserPlus, Search, AlertTriangle, UserCheck, Key, BookOpen } from 'lucide-react';
import { playChime } from '../utils/audio';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: StudentNote[];
  authorizedTeachers: AuthorizedTeacher[];
  onDeleteInappropriateNote: (id: string) => void;
  onGrantTeacher: (teacher: AuthorizedTeacher) => void;
  onRevokeTeacher: (id: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  notes,
  authorizedTeachers,
  onDeleteInappropriateNote,
  onGrantTeacher,
  onRevokeTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'teachers'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('');
  const [newTeacherCode, setNewTeacherCode] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleDeleteNote = (id: string, author: string) => {
    if (window.confirm(`Are you sure you want to delete this note by "${author}" as inappropriate? It will be removed from the public gratitude wall.`)) {
      onDeleteInappropriateNote(id);
      showNotification(`Note by ${author} was deleted as inappropriate.`);
    }
  };

  const handleApprovePendingTeacher = (teacher: AuthorizedTeacher) => {
    onGrantTeacher({
      ...teacher,
      status: 'approved',
    });
    playChime();
    showNotification(`Teacher access granted to ${teacher.name} (${teacher.subject})!`);
  };

  const handleCreateGrantTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;

    const newTeacher: AuthorizedTeacher = {
      id: `teacher-auth-${Date.now()}`,
      name: newTeacherName.trim(),
      subject: newTeacherSubject.trim() || 'General Studies',
      accessCode: newTeacherCode.trim() || 'teacher2026',
      status: 'approved',
      requestedAt: new Date().toISOString().split('T')[0],
    };

    onGrantTeacher(newTeacher);
    playChime();
    showNotification(`Teacher access granted to ${newTeacher.name}! They can now log in.`);

    setNewTeacherName('');
    setNewTeacherSubject('');
    setNewTeacherCode('');
  };

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      n.studentName.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q)
    );
  });

  const pendingTeachers = authorizedTeachers.filter((t) => t.status === 'pending');
  const approvedTeachers = authorizedTeachers.filter((t) => t.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-4xl bg-[#FFFDF9] border border-[#DDD0BF] rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F453B] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#F7DE85]" />
            </div>
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#231F1D]">
                School Administrator Dashboard
              </h3>
              <p className="font-body-serif text-xs text-[#75685B]">
                Moderate inappropriate wall notes and grant teacher login privileges.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8A7D70] hover:text-[#231F1C] p-2 rounded-full hover:bg-[#F3EDE2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast notification */}
        {actionSuccessMsg && (
          <div className="mt-3 p-3 bg-[#D7F3E3] border border-[#B2E7C6] text-[#246B46] text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex items-center gap-3 my-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-[#1F453B] text-white shadow-xs'
                : 'bg-[#F2ECE1] text-[#55493D] hover:bg-[#E7DFC5]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Moderate Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'teachers'
                ? 'bg-[#1F453B] text-white shadow-xs'
                : 'bg-[#F2ECE1] text-[#55493D] hover:bg-[#E7DFC5]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Grant Teacher Access ({approvedTeachers.length})</span>
            {pendingTeachers.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#CE5A46] text-white text-[10px] flex items-center justify-center font-bold">
                {pendingTeachers.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Notes Moderation */}
        {activeTab === 'notes' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C7D6F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes to inspect content or author..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F0] border border-[#DDD0BF] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/20"
              />
            </div>

            <div className="space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#75685B] font-body-serif italic">
                  No notes match your search.
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-white border border-[#EADBCC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D5C2AB] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#362E27] text-[10px] font-bold uppercase font-mono">
                          {note.subject}
                        </span>
                        <span className="text-xs font-bold text-[#2A231D]">
                          {note.studentName} {note.grade ? `(${note.grade})` : ''}
                        </span>
                        {note.isTeacherReply && (
                          <span className="px-1.5 py-0.2 rounded bg-[#1F453B]/10 text-[#1F453B] text-[10px] font-bold">
                            Teacher Note
                          </span>
                        )}
                      </div>
                      <p className="font-body-serif text-xs text-[#4F4439] line-clamp-2">
                        {note.message}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteNote(note.id, note.studentName)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Inappropriate</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Grant Teacher Access & Management */}
        {activeTab === 'teachers' && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Section: Pending Access Requests */}
            {pendingTeachers.length > 0 && (
              <div className="bg-[#FFF8E7] border border-[#F2DEAA] rounded-2xl p-4">
                <div className="text-xs font-bold text-[#8A6A14] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#E6A838]" />
                  <span>Pending Teacher Access Requests ({pendingTeachers.length})</span>
                </div>

                <div className="space-y-2">
                  {pendingTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="p-3 bg-white rounded-xl border border-[#EADBCC] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#2C231D]">{teacher.name}</div>
                        <div className="text-[#75685B] text-[11px]">{teacher.subject} · Code: {teacher.accessCode}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprovePendingTeacher(teacher)}
                          className="px-3 py-1.5 rounded-lg bg-[#1F453B] hover:bg-[#16332C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F7DE85]" />
                          <span>Grant Access</span>
                        </button>
                        <button
                          onClick={() => onRevokeTeacher(teacher.id)}
                          className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grant / Add New Teacher Form */}
            <div className="bg-[#FAF7F0] border border-[#E2D5C3] rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F453B] mb-3">
                <UserPlus className="w-4 h-4" />
                <span>Grant Access to a New Teacher</span>
              </div>

              <form onSubmit={handleCreateGrantTeacher} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#3B322A] mb-1">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    placeholder="e.g. Dr. Adams"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD0BF] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3B322A] mb-1">
                    Department / Subject
                  </label>
                  <input
                    type="text"
                    value={newTeacherSubject}
                    onChange={(e) => setNewTeacherSubject(e.target.value)}
                    placeholder="e.g. World History"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD0BF] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3B322A] mb-1">
                    Assign Access Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTeacherCode}
                      onChange={(e) => setNewTeacherCode(e.target.value)}
                      placeholder="e.g. adams2026"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DDD0BF] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#1F453B]/20 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1F453B] hover:bg-[#16332C] text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
                    >
                      Grant
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* List of Granted Teachers */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3F34] mb-3">
                Currently Authorized Teachers ({approvedTeachers.length})
              </h4>

              <div className="space-y-2">
                {approvedTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-3.5 bg-white rounded-xl border border-[#EADBCC] flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EAF5F0] border border-[#BCE4D3] text-[#1F453B] flex items-center justify-center font-bold">
                        {teacher.name.charAt(teacher.name.indexOf(' ') + 1) || teacher.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#2C231D] text-sm">{teacher.name}</div>
                        <div className="text-[#75685B] text-xs">
                          {teacher.subject} · <span className="font-mono text-[#8C7D6F]">Code: ••••••••</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#D7F3E3] text-[#246B46] text-[10px] font-bold">
                        Granted
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Revoke teacher login privileges for ${teacher.name}?`)) {
                            onRevokeTeacher(teacher.id);
                            showNotification(`Revoked access for ${teacher.name}`);
                          }
                        }}
                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-semibold"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
