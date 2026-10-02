import React from 'react';

export const BackgroundDoodles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden no-print" aria-hidden="true">
      {/* Top Left Sparkle & Heart */}
      <span className="absolute top-10 left-12 text-[#E26149] text-xl opacity-80">✦</span>
      <span className="absolute top-8 left-1/4 text-[#DF5C58] text-sm opacity-70">♥</span>

      {/* Hero Badge Circle (Top Right of Hero) */}
      <div className="absolute top-12 right-12 md:right-32 w-9 h-9 rounded-full bg-[#F5DE88] border border-[#DEBE59] flex items-center justify-center text-[#745B13] text-sm shadow-xs opacity-90">
        ★
      </div>

      {/* Near Hero Bottom Doodles */}
      <span className="absolute top-[28rem] left-10 md:left-24 text-lg opacity-75 text-[#73634B]">✏️</span>
      <span className="absolute top-[31rem] right-12 md:right-28 text-lg opacity-75 text-[#5B8869]">✿</span>

      {/* Letter Section Sides */}
      <span className="absolute top-[48rem] left-8 md:left-16 text-[#E26149] text-base opacity-75">♥</span>
      <span className="absolute top-[45rem] right-10 md:right-20 text-[#E7C14A] text-lg opacity-80">★</span>
      <span className="absolute top-[52rem] right-6 md:right-14 text-[#E26149] text-lg opacity-75">✦</span>

      {/* Gratitude Wall Section Sides */}
      <span className="absolute top-[75rem] left-6 md:left-14 text-2xl opacity-75 text-[#E6A838]">💛</span>
      <span className="absolute top-[80rem] right-8 md:right-20 text-[#E26149] text-sm opacity-70">♥</span>
      <span className="absolute top-[78rem] right-24 text-[#E26149] text-base opacity-75">✦</span>

      {/* Middle Lower */}
      <span className="absolute top-[120rem] left-8 md:left-20 text-xl opacity-80">💡</span>
      <span className="absolute top-[126rem] right-12 md:right-24 text-[#E7C14A] text-xl opacity-80">★</span>
    </div>
  );
};
