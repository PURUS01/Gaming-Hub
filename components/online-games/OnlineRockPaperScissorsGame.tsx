'use client';

import { useAuth } from '@/components/auth/AuthProvider';

interface OnlineRockPaperScissorsGameProps {
  gameId: string;
  roomId: string;
}

export default function OnlineRockPaperScissorsGame({ gameId, roomId }: OnlineRockPaperScissorsGameProps) {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Instructions</h3>
        <p className="text-gray-300 text-sm">
          Challenge another authenticated player in a quick online match of Rock Paper Scissors. Best of 3 wins!
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Online Rock Paper Scissors</h3>
        <p className="text-gray-400 mb-6">
          This multiplayer game is coming soon. You'll be able to create or join rooms and play Rock Paper Scissors in real-time.
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
