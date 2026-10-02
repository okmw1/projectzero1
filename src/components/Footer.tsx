import React, { useEffect } from 'react';

interface FooterProps {
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  // Discreet keyboard shortcut: Alt + A or Ctrl + Shift + A to open admin login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        onOpenAdminLogin?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdminLogin]);

  return (
    <footer className="w-full py-12 px-4 text-center z-10 relative">
      <p className="font-heading font-bold text-base sm:text-lg text-[#26211D] max-w-xl mx-auto mb-4">
        With so much gratitude from every learner whose day you make brighter.
      </p>

      {/* Decorative separator: ★ ✦ 📎 ✦ ★ */}
      {/* The paperclip is an invisible secret entry trigger for the admin */}
      <div className="flex items-center justify-center gap-3 text-xs select-none mb-6">
        <span className="text-[#E7C14A]">★</span>
        <span className="text-[#E26149]">✦</span>
        <button
          onClick={onOpenAdminLogin}
          type="button"
          aria-label="Secret admin entry"
          tabIndex={-1}
          className="text-[#847565] hover:opacity-80 transition-opacity cursor-default focus:outline-none"
        >
          📎
        </button>
        <span className="text-[#E26149]">✦</span>
        <span className="text-[#E7C14A]">★</span>
      </div>
    </footer>
  );
};
