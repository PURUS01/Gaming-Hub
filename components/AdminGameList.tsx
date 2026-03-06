'use client';

import { Game } from '@/types';
import { useState, useEffect } from 'react';
import { getGames, deleteGame, isBuiltInGame } from '@/lib/storage';

interface AdminGameListProps {
  onEdit: (game: Game) => void;
  onDelete: () => void;
}

export default function AdminGameList({ onEdit, onDelete }: AdminGameListProps) {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    setGames(getGames());
  }, []);

  const refreshGames = () => {
    setGames(getGames());
  };

  const handleDelete = (id: string) => {
    if (isBuiltInGame(id)) {
      alert('Cannot delete built-in games. These are core games that cannot be removed.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this game?')) {
      const success = deleteGame(id);
      if (success) {
        refreshGames();
        onDelete();
      } else {
        alert('Failed to delete game. It may be a built-in game.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">All Games ({games.length})</h2>
      <div className="space-y-2">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-gaming-purple transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              <img
                src={game.thumbnail}
                alt={game.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 className="text-white font-medium">{game.title}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    game.status === 'live' 
                      ? 'bg-green-500/20 text-green-400' 
                      : game.status === 'beta'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {game.status === 'live' ? 'Live' : game.status === 'beta' ? 'Beta' : 'Coming Soon'}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                    {game.minPlayers}-{game.maxPlayers} Players
                  </span>
                </div>
                <p className="text-sm text-gray-400">{game.category} • {game.difficulty}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(game)}
                className="px-4 py-2 bg-gaming-blue hover:bg-gaming-blue/90 text-white rounded-lg text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(game.id)}
                disabled={game.status === 'live'}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  game.status === 'live'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={game.status === 'live' ? 'Live games cannot be deleted' : 'Delete game'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
