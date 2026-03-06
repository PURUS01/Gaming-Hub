'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGameById } from '@/lib/storage';
import { Game, GameRoom } from '@/types';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthGate from '@/components/auth/AuthGate';
import { getRoom, subscribeToRoom, leaveRoom } from '@/lib/firebase/firestore';
import { useToast } from '@/components/ToastProvider';
import OnlineTicTacToeGame from '@/components/online-games/OnlineTicTacToeGame';
import OnlineQuizBattleGame from '@/components/online-games/OnlineQuizBattleGame';
import OnlineRockPaperScissorsGame from '@/components/online-games/OnlineRockPaperScissorsGame';
import TypingRaceGame from '@/components/online-games/TypingRaceGame';
import ReactionBattleGame from '@/components/online-games/ReactionBattleGame';
import CelebrationAnimation from '@/components/CelebrationAnimation';

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      const foundGame = getGameById(params.id);
      if (foundGame) {
        setGame(foundGame);
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (!params.roomId || typeof params.roomId !== 'string' || !user) return;

    const roomId = params.roomId;
    setLoading(true);

    const loadRoom = async () => {
      try {
        const roomData = await getRoom(roomId);
        if (!roomData) {
          setError('Room not found');
          setLoading(false);
          return;
        }

        const roomTyped = roomData as GameRoom;
        
        // Check if user is in the room
        if (!roomTyped.players.some(p => p.uid === user.uid)) {
          setError('You are not a member of this room');
          setLoading(false);
          return;
        }

        setRoom(roomTyped);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load room');
        setLoading(false);
      }
    };

    loadRoom();

    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      if (roomData) {
        const roomTyped = roomData as GameRoom;
        const previousStatus = room?.status;
        setRoom((prevRoom) => {
          // Show celebration when game finishes (only once when status changes to finished)
          if (prevRoom && prevRoom.status === 'playing' && roomTyped.status === 'finished') {
            setShowCelebration(true);
          }
          return roomTyped;
        });
        
        // If room is closed (no players), redirect to lobby
        if (roomTyped.players.length === 0 && roomTyped.status === 'finished') {
          const gameId = typeof params.id === 'string' ? params.id : '';
          if (gameId) router.push(`/games/${gameId}`);
        }
      } else {
        setError('Room was deleted');
        const gameId = typeof params.id === 'string' ? params.id : '';
        if (gameId) router.push(`/games/${gameId}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [params.roomId, params.id, user, router]);

  const handleLeaveRoom = async () => {
    if (!params.roomId || typeof params.roomId !== 'string' || !user) return;
    
    // Show confirmation dialog
    setShowLeaveConfirm(true);
  };

  const confirmLeaveRoom = async () => {
    if (!params.roomId || typeof params.roomId !== 'string' || !user) return;
    
    setShowLeaveConfirm(false);
    setLoading(true);
    
    try {
      // Close room for everyone when any player leaves
      await leaveRoom(params.roomId, user.uid, true);
      showInfo('You have left the room. The room has been closed for all players.', 3000);
      
      // Small delay to show toast before navigation
      setTimeout(() => {
        const gameId = typeof params.id === 'string' ? params.id : '';
        if (gameId) router.push(`/games/${gameId}`);
      }, 500);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to leave room';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const cancelLeaveRoom = () => {
    setShowLeaveConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !game || !room) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'Room not found'}
          </h1>
          <Link href={`/games/${params.id}`} className="text-gaming-purple hover:underline">
            Return to lobby
          </Link>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.uid === user?.uid);
  const isHost = room.hostId === user?.uid;

  // Get winner player info
  const getWinnerInfo = () => {
    if (!room.winner) return null;
    const winnerIndex = room.winner === 'X' ? 0 : 1;
    const winnerPlayer = room.players[winnerIndex];
    if (winnerPlayer) {
      return {
        name: winnerPlayer.name || winnerPlayer.email?.split('@')[0] || room.winner,
        symbol: room.winner,
      };
    }
    return { name: room.winner, symbol: room.winner };
  };

  const winnerInfo = getWinnerInfo();
  // Check if current user is the winner
  const isUserWinner = winnerInfo && room.winner && (
    (room.winner === 'X' && room.players[0]?.uid === user?.uid) ||
    (room.winner === 'O' && room.players[1]?.uid === user?.uid)
  );
  const isDraw = room.status === 'finished' && !room.winner;

  const handleCopyRoomCode = async () => {
    if (!room.roomCode) return;
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      showSuccess(`Room code "${room.roomCode}" copied to clipboard!`, 2000);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = room.roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showSuccess(`Room code "${room.roomCode}" copied to clipboard!`, 2000);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AuthGate>
      {/* Celebration Animation */}
      <CelebrationAnimation 
        show={showCelebration} 
        isWinner={!!isUserWinner}
        isDraw={isDraw}
        onComplete={() => setShowCelebration(false)}
      />
      
      <div className="min-h-screen bg-gaming-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href={`/games/${params.id}`} className="text-gaming-purple hover:underline">
              ← Back to lobby
            </Link>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Leave Room
            </button>
          </div>

          {/* Leave Room Confirmation Dialog */}
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-white mb-4">Leave Room?</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to leave? This will close the room for all players and end the game.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={confirmLeaveRoom}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Yes, Leave
                  </button>
                  <button
                    onClick={cancelLeaveRoom}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{game.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-gray-400 text-xs sm:text-sm">Room Code:</p>
                  <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                    <span className="text-white font-bold text-sm sm:text-base">{room.roomCode}</span>
                    <button
                      onClick={handleCopyRoomCode}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors group"
                      title="Copy room code"
                    >
                      {copied ? (
                        <span className="text-green-400 text-sm">✓</span>
                      ) : (
                        <svg 
                          className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-gray-400 text-xs sm:text-sm">Status</p>
                <p className={`text-white font-semibold capitalize text-sm sm:text-base ${
                  room.status === 'playing' ? 'text-green-400' :
                  room.status === 'waiting' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {room.status}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-400 text-sm mb-2">Players ({room.players.length}/{room.maxPlayers})</p>
              <div className="flex flex-wrap gap-2">
                {room.players.map((player) => (
                  <div
                    key={player.uid}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      player.uid === user?.uid
                        ? 'bg-gaming-purple text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {player.name} {player.uid === room.hostId && '(Host)'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {room.status === 'waiting' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-6 text-center mb-6">
              <p className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">Waiting for players...</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <p className="text-gray-400 text-xs sm:text-sm">
                  Share room code
                </p>
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                  <span className="text-white font-bold text-sm sm:text-base">{room.roomCode}</span>
                  <button
                    onClick={handleCopyRoomCode}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors group"
                    title="Copy room code"
                  >
                    {copied ? (
                      <span className="text-green-400 text-sm">✓</span>
                    ) : (
                      <svg 
                        className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">with friends to join</p>
              </div>
            </div>
          )}

          {(room.status === 'playing' || room.status === 'finished') && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              {room.status === 'finished' && (
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Game Finished</h2>
                  {winnerInfo ? (
                    <p className="text-gray-300">
                      Winner: <span className="text-white font-bold">{winnerInfo.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({winnerInfo.symbol})</span>
                    </p>
                  ) : (
                    <p className="text-gray-300">It&apos;s a Draw!</p>
                  )}
                </div>
              )}
              
              {game.id === 'online-tic-tac-toe' && (
                <OnlineTicTacToeGame gameId={game.id} roomId={room.id} />
              )}
              {game.id === 'online-quiz-battle' && (
                <OnlineQuizBattleGame gameId={game.id} roomId={room.id} />
              )}
              {game.id === 'online-rock-paper-scissors' && (
                <OnlineRockPaperScissorsGame gameId={game.id} roomId={room.id} />
              )}
              {game.id === 'typing-race' && (
                <TypingRaceGame gameId={game.id} roomId={room.id} />
              )}
              {game.id === 'reaction-battle' && (
                <ReactionBattleGame gameId={game.id} roomId={room.id} />
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
