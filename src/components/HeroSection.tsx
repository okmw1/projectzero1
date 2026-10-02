import React from 'react';
import { PenSquare } from 'lucide-react';

interface HeroSectionProps {
  onWriteClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onWriteClick }) => {
  return (
    <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 z-10">
      {/* Outer Card with Rounded Cream Frame */}
      <div className="relative board-card border border-[#E8DFD1] p-8 sm:p-14 text-center overflow-hidden">
        {/* Decorative Corner Badges inside card */}
        <span className="absolute top-6 left-6 text-[#E26149] text-xl opacity-90 select-none">
          ✦
        </span>
        <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F6DE88] border border-[#DEBE59] flex items-center justify-center text-[#745B13] text-sm shadow-xs select-none">
          ★
        </div>

        {/* Eyebrow */}
        <div className="text-xs sm:text-sm uppercase tracking-[0.22em] font-bold text-[#CE5A46] mb-3">
          TEACHERS' DAY · A CLASSROOM FULL OF GRATITUDE
        </div>

        {/* Main Heading */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-[#231F1D] tracking-tight leading-[1.15] mb-4 max-w-2xl mx-auto">
          For the teachers who help us shine ✨
        </h1>

        {/* Subtitle */}
        <p className="font-heading italic text-lg sm:text-xl text-[#524941] mb-4">
          A cheerful Teacher's Day keepsake from your students
        </p>

        {/* Paragraph */}
        <p className="font-body-serif text-sm sm:text-base text-[#61564C] max-w-xl mx-auto leading-relaxed mb-8">
          Every lesson, encouraging word, and patient “try again” deserves a place on the board. Add a memory, a photo, or a note of appreciation.
        </p>

        {/* Call to action button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onWriteClick}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#CE5A46] hover:bg-[#B84B38] rounded-xl shadow-sm transition-all duration-200 hover:scale-102 cursor-pointer"
          >
            <span>Write a thank-you note</span>
            <PenSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom tiny pencil doodle */}
        <span className="absolute bottom-5 right-8 text-base opacity-40 select-none">
          ✏️
        </span>
      </div>
    </section>
  );
};
