import React from 'react';

export const ClassLetterSection: React.FC = () => {
  return (
    <section id="letter-section" className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20 z-10">
      {/* Outer Rounded White Card */}
      <div className="relative board-card border border-[#E8DFD1] p-8 sm:p-12 md:p-14 overflow-hidden">
        {/* Top Eyebrow */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-[0.22em] font-bold text-[#CE5A46] mb-3">
          <span>✦</span>
          <span>NOTE FROM THE CLASS</span>
        </div>

        {/* Heading */}
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#231F1D] tracking-tight mb-6">
          Dear Teachers,
        </h2>

        {/* Paragraphs with dark left line */}
        <div className="border-l-2 border-[#2B2621] pl-5 sm:pl-6 space-y-4 my-6 font-body-serif text-[#3A332C] text-sm sm:text-base leading-relaxed">
          <p>
            Thank you for making your classroom a place where curiosity is welcome, questions matter, and each small step can become a big discovery.
          </p>
          <p>
            We notice the extra minutes after the bell, the kind reminders in the margins, the stories that make lessons memorable, and the way you help each learner feel seen.
          </p>
          <p>
            You teach more than subjects. You teach confidence, kindness, courage, and the joy of keeping on when the path is still blank.
          </p>
        </div>

        {/* Deep Green Quote Banner */}
        <div className="my-8 bg-[#1F453B] rounded-2xl p-6 sm:p-8 text-center text-white shadow-xs">
          <p className="font-heading italic font-medium text-lg sm:text-2xl text-white leading-snug mb-3">
            “A great teacher leaves a little bit of hope, courage, and wisdom in every student.”
          </p>
          <p className="text-xs sm:text-sm font-sans text-[#A4D5C5] font-normal">
            Thank you for believing in every student and for inspiring us to grow.
          </p>
        </div>

        {/* Sign-off */}
        <div className="text-right pt-2">
          <p className="font-heading font-bold text-base sm:text-lg text-[#26211D]">
            With gratitude, your students
          </p>
        </div>

        {/* Little heart on bottom left */}
        <span className="absolute bottom-6 left-8 text-[#CE5A46] text-sm select-none opacity-80">
          ♥
        </span>
      </div>
    </section>
  );
};
