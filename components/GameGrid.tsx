'use client';

import { Game } from '@/types';
import GameCard from './GameCard';

interface GameGridProps {
  games: Game[];
  onFavoriteToggle?: () => void;
}

export default function GameGrid({ games, onFavoriteToggle }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No games found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} onFavoriteToggle={onFavoriteToggle} />
      ))}
    </div>
  );
}
