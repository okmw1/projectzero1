import React from 'react';
import { UserSession } from '../types';
import { Sparkles, MessageSquareHeart, LogOut, ShieldCheck, LayoutDashboard, Radio } from 'lucide-react';

interface TeacherGreetingBannerProps {
  user: UserSession;
  subjectNotesCount?: number;
  subjectHeartsCount?: number;
  unreadLettersCount?: number;
  onOpenIntro: () => void;
  onOpenMailbox?: () => void;
  onWriteReply: () => void;
  onFilterMySubject?: () => void;
  onOpenAdminDashboard?: () => void;
  onLogout: () => void;
}

export const TeacherGreetingBanner: React.FC<TeacherGreetingBannerProps> = ({
  user,
  subjectNotesCount = 0,
  subjectHeartsCount = 0,
  unreadLettersCount = 0,
  onOpenIntro,
  onOpenMailbox,
  onWriteReply,
  onFilterMySubject,
  onOpenAdminDashboard,
  onLogout,
}) => {
  if (user.role === 'teacher') {
    return (
      <div className="w-full bg-[#1F453B] text-white py-2.5 px-4 sm:px-8 border-b border-[#2C5F51] shadow-xs relative z-30 no-print">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-center md:text-left justify-center md:justify-start">
            <span className="text-base select-none">💐</span>
            <span className="font-semibold text-[#E2F7F0]">
              Happy Teacher's Day, {user.name}!
            </span>

            {/* Real-time owned subject pill */}
            <button
              onClick={onFilterMySubject}
              title="Click to view all notes in your subject"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-[#F7DE85] font-bold text-[11px] cursor-pointer transition-all hover:scale-102"
            >
              <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
              <span>
                {user.subject}: {subjectNotesCount} notes · {subjectHeartsCount} hearts
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMailbox && (
              <button
                onClick={onOpenMailbox}
                className="px-2.5 py-1 rounded-lg bg-[#E7C14A] hover:bg-[#DFB739] text-[#2B2520] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-102"
              >
                <span>💌</span>
                <span>Mailbox</span>
                {unreadLettersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#CE5A46] text-white text-[10px] font-bold">
                    {unreadLettersCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenIntro}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#F7DE85]" />
              <span>Tribute Intro</span>
            </button>

            <button
              onClick={onWriteReply}
              className="px-2.5 py-1 rounded-lg bg-[#CE5A46] hover:bg-[#B74A37] text-white font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <MessageSquareHeart className="w-3 h-3" />
              <span>Reply to Class</span>
            </button>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="w-full bg-[#241F1A] text-white py-2.5 px-4 sm:px-8 border-b border-[#3D332B] shadow-xs relative z-30 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F7DE85]" />
            <span className="font-semibold text-white">Administrator Portal:</span>
            <span className="text-white/75 hidden sm:inline">
              Manage inappropriate notes & grant teacher login access.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="px-3 py-1 rounded-lg bg-[#1F453B] hover:bg-[#16332C] text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#F7DE85]" />
                <span>Open Dashboard</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
