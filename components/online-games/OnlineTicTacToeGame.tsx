'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getRoom, updateRoom, subscribeToRoom } from '@/lib/firebase/firestore';
import { checkWinner, isBoardFull, type Board, type Player } from '@/lib/games/ticTacToe';
import { GameRoom } from '@/types';
import CelebrationAnimation from '@/components/CelebrationAnimation';

interface OnlineTicTacToeGameProps {
  gameId: string;
  roomId: string;
}

type GameResult = { winner: Player; line: number[] } | null;

export default function OnlineTicTacToeGame({ gameId, roomId }: OnlineTicTacToeGameProps) {
  const { user } = useAuth();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<Player>('X');
  const [playerSymbol, setPlayerSymbol] = useState<Player>(null);
  const [winner, setWinner] = useState<GameResult>(null);
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousWinner, setPreviousWinner] = useState<GameResult>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const loadRoom = async () => {
      try {
        const roomData = await getRoom(roomId);
        if (roomData) {
          const roomTyped = roomData as GameRoom;
          setRoom(roomTyped);
          
          // Initialize game state from room
          if (roomTyped.gameState?.board) {
            setBoard(roomTyped.gameState.board);
          }
          if (roomTyped.gameState?.currentTurn) {
            setCurrentTurn(roomTyped.gameState.currentTurn);
          }
          
          // Determine player symbol based on join order
          const playerIndex = roomTyped.players.findIndex(p => p.uid === user.uid);
          if (playerIndex === 0) {
            setPlayerSymbol('X');
          } else if (playerIndex === 1) {
            setPlayerSymbol('O');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load room');
      }
    };

    loadRoom();

    // Subscribe to room updates
    const unsubscribe = subscribeToRoom(roomId, handleRoomUpdate);

    return () => {
      unsubscribe();
    };
  }, [roomId, user]);

  const handleRoomUpdate = useCallback((roomData: any) => {
    if (!roomData) {
      setError('Room was deleted');
      return;
    }
    
    const roomTyped = roomData as GameRoom;
    setRoom(roomTyped);
    
    // Update game state
    if (roomTyped.gameState?.board) {
      setBoard(roomTyped.gameState.board);
    }
    if (roomTyped.gameState?.currentTurn) {
      setCurrentTurn(roomTyped.gameState.currentTurn);
    }
    
    // Clear winner if game is reset (status changed to playing and no winner in room)
    if (roomTyped.status === 'playing' && !roomTyped.winner) {
      setWinner(null);
    }
    
    // Check for winner
    if (roomTyped.gameState?.board) {
      const result = checkWinner(roomTyped.gameState.board);
      if (result) {
        setPreviousWinner(winner);
        setWinner(result);
        // Show celebration if winner just appeared
        if (!previousWinner && result) {
          setShowCelebration(true);
        }
      } else if (isBoardFull(roomTyped.gameState.board)) {
        const drawResult = { winner: null, line: [] };
        setPreviousWinner(winner);
        setWinner(drawResult);
        // Show celebration for draw
        if (!previousWinner) {
          setShowCelebration(true);
        }
      }
    } else if (!roomTyped.gameState?.board && roomTyped.status === 'playing') {
      // Board is empty and game is playing - game was reset
      setWinner(null);
      setPreviousWinner(null);
      setShowCelebration(false);
    }
  }, []);

  const handleCellClick = async (index: number) => {
    if (!room || !user || room.status !== 'playing') return;
    if (board[index] || currentTurn !== playerSymbol) return;
    if (winner) return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    
    const result = checkWinner(newBoard);
    const isDraw = !result && isBoardFull(newBoard);
    const nextTurn = currentTurn === 'X' ? 'O' : 'X';
    
    try {
      const newGameState = {
        board: newBoard,
        currentTurn: nextTurn,
      };
      
      await updateRoom(roomId, {
        gameState: newGameState,
        status: result || isDraw ? 'finished' : 'playing',
        winner: result?.winner || null,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to make move');
    }
  };

  const handleNewGame = async () => {
    if (!room || isResetting) return;
    
    setIsResetting(true);
    try {
      const newGameState = {
        board: Array(9).fill(null),
        currentTurn: 'X',
      };
      
      await updateRoom(roomId, {
        gameState: newGameState,
        status: 'playing',
        winner: null,
        updatedAt: new Date().toISOString(),
      });
      setWinner(null);
    } catch (err: any) {
      setError(err.message || 'Failed to start new game');
    } finally {
      setIsResetting(false);
    }
  };

  if (!room || !playerSymbol) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-purple mx-auto mb-4"></div>
        <p className="text-gray-400">Loading game...</p>
      </div>
    );
  }

  if (room.status === 'waiting') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Waiting for players to join...</p>
      </div>
    );
  }

  // Show game board for both 'playing' and 'finished' statuses

  const isMyTurn = currentTurn === playerSymbol && !winner;
  const opponent = room.players.find(p => p.uid !== user?.uid);
  const opponentName = opponent?.name || opponent?.email?.split('@')[0] || 'Opponent';

  // Get winner player info
  const getWinnerName = () => {
    if (!winner?.winner) return null;
    const winnerSymbol = winner.winner;
    // Player 0 is X, Player 1 is O
    const winnerIndex = winnerSymbol === 'X' ? 0 : 1;
    if (room.players[winnerIndex]) {
      return room.players[winnerIndex].name || room.players[winnerIndex].email?.split('@')[0] || winnerSymbol;
    }
    return winnerSymbol;
  };

  const winnerName = getWinnerName();
  const isUserWinner = winner?.winner === playerSymbol;
  const isDraw = !!(winner && !winner.winner);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Celebration Animation */}
      <CelebrationAnimation 
        show={showCelebration} 
        isWinner={isUserWinner}
        isDraw={isDraw}
        onComplete={() => setShowCelebration(false)}
      />
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        {winner ? (
          <div>
            <p className="text-2xl font-bold text-white">
              {winner.winner ? `${winnerName} Wins!` : "It&apos;s a Draw!"}
            </p>
            {winner.winner && (
              <p className="text-sm text-gray-400 mt-1">
                ({winner.winner} won the game)
              </p>
            )}
          </div>
        ) : (
          <p className="text-xl text-gray-300">
            {isMyTurn ? "Your turn" : `${opponentName}'s turn`}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-2">
          You are: <span className="text-white font-bold">{playerSymbol}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto">
        {board.map((cell, index) => {
          const isWinning = winner?.line.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner || !isMyTurn}
              className={`aspect-square text-4xl font-bold rounded-lg transition-all ${
                isWinning
                  ? 'bg-green-500 text-white'
                  : cell
                  ? 'bg-gray-800 text-white'
                  : isMyTurn && !winner
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {cell || ''}
            </button>
          );
        })}
      </div>

      {(room.status === 'finished' || winner) && (
        <div className="text-center mt-6">
          <button
            onClick={handleNewGame}
            disabled={isResetting || room.status === 'playing'}
            className="px-6 py-3 bg-gaming-purple hover:bg-gaming-purple/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? 'Starting...' : 'Play Again'}
          </button>
          <p className="text-gray-400 text-sm mt-2">
            {isResetting 
              ? 'Resetting game for both players...' 
              : 'Click to start a new game (both players will see it)'}
          </p>
        </div>
      )}
    </div>
  );
}
