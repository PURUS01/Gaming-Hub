'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGameById } from '@/lib/storage';
import { Game } from '@/types';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthGate from '@/components/auth/AuthGate';
import { createRoom, findRoomByCode, joinRoom } from '@/lib/firebase/firestore';
import { useToast } from '@/components/ToastProvider';

export default function GameLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      const foundGame = getGameById(params.id);
      if (foundGame) {
        setGame(foundGame);
      }
    }
  }, [params.id]);

  const handleCreateRoom = async (withComputer: boolean = false) => {
    // Comprehensive validation before attempting to create room
    if (!user) {
      const errorMsg = 'You must be logged in to create a room.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }
    
    if (!game) {
      const errorMsg = 'Game information is missing.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }
    
    if (!user.uid) {
      const errorMsg = 'User authentication is incomplete. Please sign out and sign in again.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const hostName = user.displayName || user.email?.split('@')[0] || 'Player';
      
      console.log('Creating room...', { 
        roomId, 
        gameId: game.id, 
        hostId: user.uid,
        hostName,
        maxPlayers: game.maxPlayers,
        userEmail: user.email,
        withComputer,
      });
      
      // Create room with or without computer player
      const createdRoom = await createRoom(
        roomId,
        game.id,
        user.uid,
        hostName,
        user.email || '',
        game.maxPlayers,
        {},
        withComputer // Pass computer flag
      );
      
      console.log('Room created successfully:', createdRoom);
      
      if (withComputer) {
        // Don't show success message for Play button - navigate immediately
        router.push(`/games/${game.id}/room/${roomId}`);
      } else {
        showSuccess(`Room created successfully! Room code: ${createdRoom.roomCode}`, 4000);
        // Small delay to show toast before navigation
        setTimeout(() => {
          router.push(`/games/${game.id}/room/${roomId}`);
        }, 500);
      }
    } catch (err: any) {
      console.error('Error in handleCreateRoom:', err);
      const errorMessage = err.message || 'Failed to create room. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !game || !joinCode.trim()) return;
    
    setError('');
    setLoading(true);
    
    try {
      const room = await findRoomByCode(joinCode.toUpperCase());
      
      if (!room) {
        setError('Room not found');
        setLoading(false);
        return;
      }
      
      if (room.gameId !== game.id) {
        setError('Room code is for a different game');
        setLoading(false);
        return;
      }
      
      if (room.players.length >= room.maxPlayers) {
        setError('Room is full');
        setLoading(false);
        return;
      }
      
      if (room.players.some(p => p.uid === user.uid)) {
        setError('You are already in this room');
        setLoading(false);
        return;
      }
      
      const playerName = user.displayName || user.email?.split('@')[0] || 'Player';
      await joinRoom(room.id, user.uid, playerName, user.email || '');
      
      showSuccess(`Successfully joined room! Room code: ${room.roomCode}`, 4000);
      
      // Small delay to show toast before navigation
      setTimeout(() => {
        router.push(`/games/${game.id}/room/${room.id}`);
      }, 500);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to join room';
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Game not found</h1>
          <Link href="/games" className="text-gaming-purple hover:underline">
            Return to games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-gaming-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/games" className="text-gaming-purple hover:underline mb-6 inline-block">
            ← Back to games
          </Link>

          <div className="relative h-40 sm:h-48 md:h-64 rounded-lg overflow-hidden mb-6 sm:mb-8">
            <img
              src={game.banner}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{game.title}</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-300">{game.shortDescription}</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Players</p>
                <p className="text-white font-semibold">{game.minPlayers}-{game.maxPlayers} players</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Difficulty</p>
                <p className="text-white font-semibold">{game.difficulty}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Category</p>
                <p className="text-white font-semibold">{game.category}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <p className="text-white font-semibold capitalize">{game.status}</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm">{game.fullDescription}</p>
          </div>

          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => handleCreateRoom(true)}
              disabled={loading}
              className="w-full bg-gaming-blue hover:bg-gaming-blue/90 text-white font-bold py-3 sm:py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting...</span>
                </>
              ) : (
                <span>Play</span>
              )}
            </button>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Create Room</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4">
                Create a new room and share the code with friends to play together.
              </p>
              <button
                onClick={() => handleCreateRoom(false)}
                disabled={loading}
                className="w-full bg-gaming-purple hover:bg-gaming-purple/90 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Join Room</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4">
                Enter a room code to join an existing game.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple text-sm sm:text-base"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinCode.trim() || loading}
                  className="px-4 sm:px-6 py-2 bg-gaming-blue hover:bg-gaming-blue/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {game.status === 'coming-soon' && (
            <div className="mt-6 bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-lg text-sm">
              This game is coming soon. Check back later!
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
