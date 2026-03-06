import { Game, GameStats } from '@/types';
import { seedGames } from './seedData';

const GAMES_KEY = 'gaming-hub-games';
const FAVORITES_KEY = 'gaming-hub-favorites';
const RECENTLY_PLAYED_KEY = 'gaming-hub-recently-played';
const GAME_STATS_KEY = 'gaming-hub-game-stats';
const ADMIN_PASSWORD_KEY = 'gaming-hub-admin-password';

// Initialize games with seed data if none exist
export function initializeGames(): Game[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(GAMES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Filter to only multiplayer games and merge with seed
      const seedIds = new Set(seedGames.map(g => g.id));
      const existingIds = new Set(parsed.map((g: any) => g.id));
      
      // Keep only multiplayer games from existing data
      const multiplayerGames = parsed.filter((g: any) => 
        g.multiplayer === true && g.authRequired === true
      );
      
      // Add missing seed games
      seedGames.forEach(seedGame => {
        if (!existingIds.has(seedGame.id)) {
          multiplayerGames.push(seedGame);
        }
      });
      
      localStorage.setItem(GAMES_KEY, JSON.stringify(multiplayerGames));
      return multiplayerGames;
    } catch (e) {
      // If parsing fails, use seed data
      localStorage.setItem(GAMES_KEY, JSON.stringify(seedGames));
      return seedGames;
    }
  }
  
  localStorage.setItem(GAMES_KEY, JSON.stringify(seedGames));
  return seedGames;
}

// Get all games
export function getGames(): Game[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(GAMES_KEY);
  if (!stored) {
    return initializeGames();
  }
  return JSON.parse(stored);
}

// Save games
export function saveGames(games: Game[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

// Get game by ID
export function getGameById(id: string): Game | null {
  const games = getGames();
  return games.find(game => game.id === id) || null;
}

// Update game
export function updateGame(updatedGame: Game): void {
  const games = getGames();
  const index = games.findIndex(game => game.id === updatedGame.id);
  if (index !== -1) {
    games[index] = updatedGame;
    saveGames(games);
  }
}

// Add new game
export function addGame(game: Game): void {
  const games = getGames();
  games.push(game);
  saveGames(games);
}

// Delete game
export function deleteGame(id: string): boolean {
  // Prevent deletion of built-in games
  if (isBuiltInGame(id)) {
    return false;
  }
  
  const games = getGames();
  const filtered = games.filter(game => game.id !== id);
  saveGames(filtered);
  
  // Also remove from favorites and recently played
  removeFavorite(id);
  removeRecentlyPlayed(id);
  
  // Remove game stats
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(GAME_STATS_KEY);
    if (stored) {
      const allStats: Record<string, GameStats> = JSON.parse(stored);
      delete allStats[id];
      localStorage.setItem(GAME_STATS_KEY, JSON.stringify(allStats));
    }
  }
  
  return true;
}

// Favorites
export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addFavorite(gameId: string): void {
  if (typeof window === 'undefined') return;
  const favorites = getFavorites();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(gameId: string): void {
  if (typeof window === 'undefined') return;
  const favorites = getFavorites();
  const filtered = favorites.filter(id => id !== gameId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export function isFavorite(gameId: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(gameId);
}

// Recently played
export function getRecentlyPlayed(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addRecentlyPlayed(gameId: string): void {
  if (typeof window === 'undefined') return;
  const recent = getRecentlyPlayed();
  const filtered = recent.filter(id => id !== gameId);
  filtered.unshift(gameId);
  const limited = filtered.slice(0, 10); // Keep only last 10
  localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(limited));
}

export function removeRecentlyPlayed(gameId: string): void {
  if (typeof window === 'undefined') return;
  const recent = getRecentlyPlayed();
  const filtered = recent.filter(id => id !== gameId);
  localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(filtered));
}

// Record game play
export function recordGamePlay(gameId: string): void {
  const game = getGameById(gameId);
  if (game) {
    game.playCount += 1;
    game.lastPlayed = new Date().toISOString();
    updateGame(game);
    addRecentlyPlayed(gameId);
  }
}

// Game stats (high scores, etc.)
export function getGameStats(gameId: string): GameStats {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(GAME_STATS_KEY);
  if (!stored) return {};
  const allStats: Record<string, GameStats> = JSON.parse(stored);
  return allStats[gameId] || {};
}

export function saveGameStats(gameId: string, stats: GameStats): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(GAME_STATS_KEY);
  const allStats: Record<string, GameStats> = stored ? JSON.parse(stored) : {};
  allStats[gameId] = { ...allStats[gameId], ...stats };
  localStorage.setItem(GAME_STATS_KEY, JSON.stringify(allStats));
}

export function updateBestScore(gameId: string, score: number, scoreType: 'lowest' | 'highest' = 'highest'): boolean {
  const stats = getGameStats(gameId);
  const currentBest = stats.bestScore;
  
  if (currentBest === undefined) {
    saveGameStats(gameId, { bestScore: score, bestScoreType: scoreType });
    return true;
  }
  
  const isNewBest = scoreType === 'lowest' 
    ? score < currentBest 
    : score > currentBest;
  
  if (isNewBest) {
    saveGameStats(gameId, { bestScore: score, bestScoreType: scoreType });
    return true;
  }
  
  return false;
}

export function isBuiltInGame(gameId: string): boolean {
  // All multiplayer games are considered built-in for protection
  const game = getGameById(gameId);
  return game?.status === 'live' || game?.status === 'beta';
}

// Admin password (hardcoded for MVP)
export const ADMIN_PASSWORD = 'admin123';

export function checkAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
