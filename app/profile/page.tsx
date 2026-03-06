'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import AuthGate from '@/components/auth/AuthGate';
import Link from 'next/link';
import { logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-gaming-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Email</p>
                <p className="text-white font-semibold">{user?.email}</p>
              </div>
              {user?.displayName && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Display Name</p>
                  <p className="text-white font-semibold">{user.displayName}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm mb-1">User ID</p>
                <p className="text-white font-mono text-sm">{user?.uid}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/games"
                className="px-4 py-2 bg-gaming-purple hover:bg-gaming-purple/90 text-white rounded-lg transition-colors"
              >
                Browse Games
              </Link>
              <Link
                href="/favorites"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                My Favorites
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Account Actions</h2>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
