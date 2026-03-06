export type Game = {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  banner: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  featured: boolean;
  multiplayer: true;
  authRequired: true;
  minPlayers: number;
  maxPlayers: number;
  status: "live" | "beta" | "coming-soon";
  playCount: number;
  lastPlayed?: string;
};

export type GameRoom = {
  id: string;
  gameId: string;
  hostId: string;
  hostName: string;
  roomCode: string;
  status: "waiting" | "playing" | "finished";
  maxPlayers: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  players: {
    uid: string;
    name: string;
    email: string;
    joinedAt: string;
    role?: string;
  }[];
  gameState: any;
  winner?: string | null;
  currentTurn?: string;
};

export type GameStats = {
  bestScore?: number;
  bestScoreType?: 'lowest' | 'highest'; // lowest for reaction time, highest for others
  [key: string]: any; // Allow game-specific stats
};
