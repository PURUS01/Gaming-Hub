export type Player = 'X' | 'O' | null;
export type Board = Player[];

export function createEmptyBoard(): Board {
  return Array(9).fill(null);
}

export function checkWinner(board: Board): { winner: Player; line: number[] } | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== null);
}

export function getBestMove(board: Board, player: Player): number {
  // Check for winning move
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = player;
      const result = checkWinner(testBoard);
      if (result?.winner === player) {
        return i;
      }
    }
  }

  // Check for blocking opponent
  const opponent = player === 'X' ? 'O' : 'X';
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = opponent;
      const result = checkWinner(testBoard);
      if (result?.winner === opponent) {
        return i;
      }
    }
  }

  // Prefer center
  if (board[4] === null) {
    return 4;
  }

  // Prefer corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Any available move
  const available = board.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
  return available[Math.floor(Math.random() * available.length)];
}
