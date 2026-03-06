'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function CreateUserForm() {
  const { user: adminUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!adminUser || !adminUser.email) {
      setError('You must be logged in to create users');
      setLoading(false);
      return;
    }

    try {
      // Create user via API route - this won't affect the current login session
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create user');
      } else {
        setSuccess(data.message || `User created successfully! Email: ${formData.email}`);
        setFormData({ email: '', password: '' });
      }
    } catch (err: any) {
      console.error('User creation error:', err);
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!adminUser) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
        <p className="text-gray-400 text-sm sm:text-base text-center">Please log in to create users.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Create New User</h3>
      
      <div className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gaming-purple"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gaming-purple"
            placeholder="Minimum 6 characters"
          />
          <p className="text-gray-500 text-xs mt-1">Password must be at least 6 characters</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm break-words">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm break-words">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gaming-purple hover:bg-gaming-purple/90 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </div>

      <p className="text-gray-500 text-xs mt-4 sm:mt-5 leading-relaxed">
        Note: Creating a user will not affect your current login session. You will remain logged in as admin.
      </p>
    </form>
  );
}
