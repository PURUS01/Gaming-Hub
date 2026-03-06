'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import CreateUserForm from '@/components/admin/CreateUserForm';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if already authenticated (simple session check)
    const auth = sessionStorage.getItem('admin-authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('admin-authenticated', 'true');
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gaming-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <AdminLogin onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin-authenticated');
              setIsAuthenticated(false);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        {/* Main Content - Mobile Responsive */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">User Management</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
              Create and manage user accounts with email and password for Firebase Authentication.
            </p>
          </div>

          {user ? (
            <CreateUserForm />
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
              <p className="text-gray-400 text-center text-sm sm:text-base">
                Please log in with Firebase Authentication to manage users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
