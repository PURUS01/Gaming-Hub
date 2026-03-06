'use client';

import { useState, useEffect } from 'react';
import { getFavorites, getGames } from '@/lib/storage';
import { Game } from '@/types';
import GameGrid from '@/components/GameGrid';

export default function FavoritesPage() {
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const favoriteIds = getFavorites();
    const allGames = getGames();
    const games = favoriteIds
      .map(id => allGames.find(game => game.id === id))
      .filter((game): game is Game => game !== undefined);
    setFavoriteGames(games);
  }, [refreshKey]);

  const handleFavoriteToggle = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">My Favorites</h1>
        
        {favoriteGames.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <svg className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-gray-400 text-lg mb-4">No favorite games yet</p>
            <p className="text-gray-500">Start adding games to your favorites to see them here!</p>
          </div>
        ) : (
          <GameGrid games={favoriteGames} onFavoriteToggle={handleFavoriteToggle} />
        )}
      </div>
    </div>
  );
}
