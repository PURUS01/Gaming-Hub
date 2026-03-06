'use client';

import { Game } from '@/types';
import { getRecentlyPlayed, getGames } from '@/lib/storage';
import { useState, useEffect } from 'react';
import GameCard from './GameCard';

export default function RecentlyPlayed() {
  const [recentGames, setRecentGames] = useState<Game[]>([]);

  useEffect(() => {
    const recentIds = getRecentlyPlayed();
    const allGames = getGames();
    const games = recentIds
      .map(id => allGames.find(game => game.id === id))
      .filter((game): game is Game => game !== undefined)
      .slice(0, 8);
    setRecentGames(games);
  }, []);

  if (recentGames.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6">Recently Played</h2>
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
          <p className="text-gray-400">No recently played games yet. Start playing to see them here!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 sm:mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Recently Played</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
