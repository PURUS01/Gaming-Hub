'use client';

import { Game } from '@/types';
import { getFavorites, getGames } from '@/lib/storage';
import { useState, useEffect } from 'react';
import GameCard from './GameCard';

export default function FavoritesSection() {
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);

  useEffect(() => {
    const favoriteIds = getFavorites();
    const allGames = getGames();
    const games = favoriteIds
      .map(id => allGames.find(game => game.id === id))
      .filter((game): game is Game => game !== undefined);
    setFavoriteGames(games);
  }, []);

  const refreshFavorites = () => {
    const favoriteIds = getFavorites();
    const allGames = getGames();
    const games = favoriteIds
      .map(id => allGames.find(game => game.id === id))
      .filter((game): game is Game => game !== undefined);
    setFavoriteGames(games);
  };

  if (favoriteGames.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6">Favorites</h2>
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
          <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-gray-400">No favorite games yet. Add some to see them here!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">Favorites</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteGames.map((game) => (
          <GameCard key={game.id} game={game} onFavoriteToggle={refreshFavorites} />
        ))}
      </div>
    </section>
  );
}
