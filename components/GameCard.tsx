'use client';

import { Game } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/storage';
import { useAuth } from './auth/AuthProvider';

interface GameCardProps {
  game: Game;
  onFavoriteToggle?: () => void;
}

export default function GameCard({ game, onFavoriteToggle }: GameCardProps) {
  const [favorite, setFavorite] = useState(isFavorite(game.id));
  const { user } = useAuth();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (favorite) {
      removeFavorite(game.id);
    } else {
      addFavorite(game.id);
    }
    setFavorite(!favorite);
    onFavoriteToggle?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (game.authRequired && !user) {
      e.preventDefault();
      window.location.href = '/login';
    }
  };

  const difficultyColors = {
    Easy: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Hard: 'bg-red-500',
  };

  const statusColors = {
    live: 'bg-green-500',
    beta: 'bg-yellow-500',
    'coming-soon': 'bg-gray-500',
  };

  const isLocked = game.authRequired && !user;
  const gamePath = `/games/${game.id}`;

  return (
    <Link href={gamePath} onClick={handleCardClick}>
      <div className={`group relative bg-gray-900 rounded-lg overflow-hidden border transition-all duration-300 ${
        isLocked 
          ? 'border-gray-700 opacity-75' 
          : 'border-gray-800 hover:border-gaming-purple hover:shadow-lg hover:shadow-gaming-purple/20'
      }`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={game.thumbnail}
            alt={game.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isLocked ? '' : 'group-hover:scale-110'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-white font-bold">Login Required</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
              fill={favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          <div className="absolute bottom-2 left-2 flex gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${difficultyColors[game.difficulty]}`}>
              {game.difficulty}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[game.status]}`}>
              {game.status === 'live' ? 'Live' : game.status === 'beta' ? 'Beta' : 'Coming Soon'}
            </span>
            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500">
              {game.minPlayers}-{game.maxPlayers} Players
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gaming-purple transition-colors">
            {game.title}
          </h3>
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
            {game.shortDescription}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              {game.category}
            </span>
            <span className="text-xs text-gray-500">
              {game.playCount} plays
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
