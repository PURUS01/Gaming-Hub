'use client';

import { useState, useEffect, useMemo } from 'react';
import { getGames, initializeGames } from '@/lib/storage';
import { Game } from '@/types';
import HeroSection from '@/components/HeroSection';
import SearchAndFilterBar from '@/components/SearchAndFilterBar';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import FavoritesSection from '@/components/FavoritesSection';
import GameGrid from '@/components/GameGrid';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    initializeGames();
    setGames(getGames());
  }, [refreshKey]);

  const filteredGames = useMemo(() => {
    let filtered = games;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.category.toLowerCase().includes(query) ||
        game.tags.some(tag => tag.toLowerCase().includes(query)) ||
        game.shortDescription.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }

    return filtered;
  }, [games, searchQuery, selectedCategory]);

  const featuredGames = useMemo(() => {
    return filteredGames.filter(game => game.featured);
  }, [filteredGames]);

  const categories = useMemo(() => {
    const cats = new Set(games.map(game => game.category));
    return Array.from(cats).sort();
  }, [games]);

  const handleFavoriteToggle = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
        
        <div className="mb-6">
          <SearchAndFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
        </div>

        {!user && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 text-center">
            <p className="text-blue-400 text-xs sm:text-sm mb-3 sm:mb-2">
              🔒 Sign in to play multiplayer games. All games require authentication to join rooms.
            </p>
            <div className="flex gap-2 sm:gap-3 justify-center">
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 bg-gaming-purple hover:bg-gaming-purple/90 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        )}

        {featuredGames.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Multiplayer Games</h2>
              <Link href="/games" className="text-gaming-purple hover:underline text-sm self-start sm:self-auto">
                View All →
              </Link>
            </div>
            <GameGrid games={featuredGames} onFavoriteToggle={handleFavoriteToggle} />
          </section>
        )}

        <section className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">All Multiplayer Games</h2>
            <Link href="/games" className="text-gaming-purple hover:underline text-sm self-start sm:self-auto">
              View All →
            </Link>
          </div>
          {filteredGames.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-gray-400">No games found matching your search.</p>
            </div>
          ) : (
            <GameGrid games={filteredGames} onFavoriteToggle={handleFavoriteToggle} />
          )}
        </section>

        <section className="mb-8 sm:mb-12">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">How It Works</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-purple rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Sign Up</h3>
                <p className="text-gray-400 text-sm">Create an account to access multiplayer games</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-blue rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Create or Join</h3>
                <p className="text-gray-400 text-sm">Create a room or join with a room code</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Play</h3>
                <p className="text-gray-400 text-sm">Enjoy real-time multiplayer gameplay</p>
              </div>
            </div>
          </div>
        </section>

        <RecentlyPlayed />
        <FavoritesSection />
      </div>
    </div>
  );
}
