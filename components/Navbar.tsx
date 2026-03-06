'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth/AuthProvider';
import { logout } from '@/lib/firebase/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/games', label: 'Games' },
    { href: '/profile', label: 'Profile' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="bg-gaming-darker border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-gaming-purple to-gaming-blue bg-clip-text text-transparent">
              Gaming Hub
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-gaming-purple text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/profile"
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {user.email}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      href="/login"
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 py-2 bg-gaming-purple hover:bg-gaming-purple/90 text-white rounded-md text-sm transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
