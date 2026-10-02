import React, { useState } from 'react';
import { UserSession } from '../types';
import { X, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: UserSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Please enter both email and password.');
      return;
    }

    // Official Admin Credentials check
    const isValidAdminEmail =
      cleanUser === 'taynanjetraj@gmail.com' ||
      cleanUser === 'admin' ||
      cleanUser === 'principal';

    const isValidPassword =
      cleanPass === '09195154526@Jetraj' ||
      cleanPass === 'admin2026';

    if (isValidAdminEmail && isValidPassword) {
      onLogin({
        role: 'admin',
        name: cleanUser.includes('@') ? 'Jetraj (Admin)' : 'Principal Vance',
        title: 'School Administrator',
      });
      setUsername('');
      setPassword('');
      onClose();
      return;
    }

    // Support custom username if matching the secure password
    if (cleanPass === '09195154526@Jetraj') {
      onLogin({
        role: 'admin',
        name: username.trim(),
        title: 'School Administrator',
      });
      setUsername('');
      setPassword('');
      onClose();
      return;
    }

    setError('Invalid administrative credentials.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-sm bg-[#1E1915] border border-[#3E342B] text-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#352B22] border border-[#524335] flex items-center justify-center text-[#F7DE85] mb-2.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-xl font-bold text-white">
            Portal Access
          </h3>
          <p className="font-sans text-[11px] text-stone-400 mt-1">
            Authorized staff verification
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Email
            </label>
            <input
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-3.5 py-2.5 text-xs bg-[#29221C] border border-[#483B2F] rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#F7DE85]/30 focus:border-[#F7DE85]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 text-xs bg-[#29221C] border border-[#483B2F] rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-[#F7DE85]/30 focus:border-[#F7DE85]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-[#1E1915] bg-[#F7DE85] hover:bg-[#F2D46C] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verify & Sign In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
