'use client';

import { useAuth } from '@/components/auth/AuthProvider';

interface OnlineQuizBattleGameProps {
  gameId: string;
  roomId: string;
}

export default function OnlineQuizBattleGame({ gameId, roomId }: OnlineQuizBattleGameProps) {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Instructions</h3>
        <p className="text-gray-300 text-sm">
          Compete with another authenticated player in a live quiz match. Answer questions faster than your opponent to win!
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Online Quiz Battle</h3>
        <p className="text-gray-400 mb-6">
          This multiplayer quiz battle game is coming soon. You'll be able to create or join rooms and compete in real-time quiz matches.
        </p>
        {user && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              ✓ You're authenticated and ready to play when this game launches!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
