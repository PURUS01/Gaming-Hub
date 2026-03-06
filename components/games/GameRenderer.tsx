'use client';

import { Game } from '@/types';

interface GameRendererProps {
  game: Game;
}

// This component is no longer used for multiplayer games
// Multiplayer games are rendered in the room page
// Keeping this for backward compatibility if needed
export default function GameRenderer({ game }: GameRendererProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
      <h3 className="text-xl font-bold text-white mb-4">Multiplayer Game</h3>
      <p className="text-gray-400 mb-4">
        This game requires multiplayer room setup. Please use the lobby to create or join a room.
      </p>
    </div>
  );
}
