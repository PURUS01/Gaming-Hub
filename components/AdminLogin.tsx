'use client';

import { useState } from 'react';
import { checkAdminPassword, ADMIN_PASSWORD } from '@/lib/storage';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(password)) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8 sm:py-12">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sm:p-8 max-w-md w-full mx-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gaming-purple"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-gaming-purple hover:bg-gaming-purple/90 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-500 text-center break-words">
          Default password: {ADMIN_PASSWORD}
        </p>
      </div>
    </div>
  );
}
