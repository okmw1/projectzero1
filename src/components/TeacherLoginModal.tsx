import React, { useState } from 'react';
import { AuthorizedTeacher, UserSession } from '../types';
import { X, LogIn, GraduationCap, AlertCircle, Send, CheckCircle2 } from 'lucide-react';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorizedTeachers: AuthorizedTeacher[];
  onLogin: (session: UserSession) => void;
  onRequestAccess: (teacher: Omit<AuthorizedTeacher, 'id' | 'status'>) => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  authorizedTeachers,
  onLogin,
  onRequestAccess,
}) => {
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [reqSubject, setReqSubject] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim().toLowerCase();
    const cleanCode = accessCode.trim().toLowerCase();

    if (!cleanName || !cleanCode) {
      setError('Please enter both your name and access code.');
      return;
    }

    // Find teacher in admin-authorized list
    const found = authorizedTeachers.find(
      (t) =>
        t.name.toLowerCase().includes(cleanName) ||
        cleanName.includes(t.name.toLowerCase())
    );

    if (!found) {
      setError('No teacher account found with this name. Please submit an access request to the Admin below.');
      return;
    }

    if (found.status === 'pending') {
      setError('Your teacher account request is pending Admin approval. Please check back once the Principal or Admin grants access.');
      return;
    }

    // Verify access code (or if admin assigned accessCode)
    if (found.accessCode && found.accessCode.toLowerCase() !== cleanCode) {
      setError(`Incorrect access code for ${found.name}.`);
      return;
    }

    // Successfully authenticated!
    onLogin({
      role: 'teacher',
      name: found.name,
      subject: found.subject,
      title: 'Teacher',
    });
    onClose();
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reqSubject.trim()) {
      setError('Please provide your name and teaching subject.');
      return;
    }

    onRequestAccess({
      name: name.trim(),
      subject: reqSubject.trim(),
      accessCode: accessCode.trim() || 'teacher2026',
    });

    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setIsRequesting(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-md bg-[#FFFDF9] border border-[#EADBCC] rounded-3xl shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8A7D70] hover:text-[#231F1C] p-1.5 rounded-full hover:bg-[#F3EDE2] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FCECEB] border border-[#F6CDCA] flex items-center justify-center text-[#CE5A46] mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-[#241F1A]">
            Teacher Sign In
          </h3>
          <p className="font-body-serif text-xs text-[#706456] mt-1">
            Access is granted by the school administrator. Sign in to view your tribute and leave notes for your class.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FCECEB] border border-[#F6CDCA] text-[#CE5A46] text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {requestSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-[#D7F3E3] border border-[#B2E7C6] text-[#246B46] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Access request sent to Admin! They can approve your login from their dashboard.</span>
          </div>
        )}

        {!isRequesting ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3B322A] mb-1.5">
                Teacher Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ms. Rivera or Mr. Harrison"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DCD0BE] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3B322A] mb-1.5">
                Teacher Access Code
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter access code granted by admin"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DCD0BE] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-[#CE5A46] hover:bg-[#B74A37] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In as Teacher</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#EEDBCA] text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsRequesting(true);
                }}
                className="text-xs text-[#7A6B5B] hover:text-[#CE5A46] font-semibold underline underline-offset-4 cursor-pointer"
              >
                New teacher? Request access from Admin →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3B322A] mb-1.5">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ms. Sarah Vance"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DCD0BE] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3B322A] mb-1.5">
                Subject / Department
              </label>
              <input
                type="text"
                value={reqSubject}
                onChange={(e) => setReqSubject(e.target.value)}
                placeholder="e.g. English Literature or Mathematics"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DCD0BE] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3B322A] mb-1.5">
                Requested Access Code
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="e.g. sarah2026"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DCD0BE] rounded-xl text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#CE5A46]/30 focus:border-[#CE5A46]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsRequesting(false)}
                className="px-4 py-2 text-xs font-semibold text-[#665A4F] hover:bg-[#F2ECE0] rounded-xl transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#CE5A46] hover:bg-[#B74A37] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
