'use client';

import { Game } from '@/types';
import GameCard from './GameCard';

interface FeaturedGamesProps {
  games: Game[];
  onFavoriteToggle?: () => void;
}

export default function FeaturedGames({ games, onFavoriteToggle }: FeaturedGamesProps) {
  const featuredGames = games.filter(game => game.featured);

  if (featuredGames.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">Featured Games</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featuredGames.map((game) => (
          <GameCard key={game.id} game={game} onFavoriteToggle={onFavoriteToggle} />
        ))}
      </div>
    </section>
  );
}
