export const MEMORY_CARDS = [
  '🎮', '🎯', '🎲', '🎨', '🎸', '🎺',
  '🎪', '🎭', '🎬', '🎤', '🎧', '🎵',
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createMemoryBoard(): string[] {
  const pairs = MEMORY_CARDS.slice(0, 6);
  const board = [...pairs, ...pairs];
  return shuffleArray(board);
}
