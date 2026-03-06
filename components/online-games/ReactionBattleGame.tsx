'use client';

import { useAuth } from '@/components/auth/AuthProvider';

interface ReactionBattleGameProps {
  gameId: string;
  roomId: string;
}

export default function ReactionBattleGame({ gameId, roomId }: ReactionBattleGameProps) {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Instructions</h3>
        <p className="text-gray-300 text-sm">
          Compete to react faster than another player. When the signal appears, click as fast as you can. Fastest reaction wins!
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Reaction Battle</h3>
        <p className="text-gray-400 mb-6">
          This multiplayer reaction battle game is coming soon. You&apos;ll be able to create or join rooms and compete in real-time reaction tests.
        </p>
        {user && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              ✓ You&apos;re authenticated and ready to play when this game launches!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
