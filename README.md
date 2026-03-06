# Gaming Hub - Multiplayer Gaming Platform

A modern multiplayer gaming platform built with Next.js 14, React, TypeScript, Tailwind CSS, Firebase Authentication, and Cloud Firestore. Play real-time multiplayer games with friends!

## Features

- 🎮 **5 Multiplayer Games**: Online Tic Tac Toe (fully implemented), Online Quiz Battle, Online Rock Paper Scissors, Typing Race, and Reaction Battle
- 🔐 **Firebase Authentication**: Secure email/password authentication for all players
- 🏠 **Room System**: Create or join game rooms with room codes
- ⚡ **Real-time Gameplay**: Firestore-powered real-time game state synchronization
- 🎯 **Game Management**: Browse, search, and filter multiplayer games
- ⭐ **Favorites System**: Mark games as favorites for quick access
- 📊 **Recently Played**: Track your gaming history
- 🔐 **Admin Panel**: Manage multiplayer games (password protected)
- 🌙 **Dark Theme**: Beautiful dark gaming-themed UI
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **State Management**: React Hooks + localStorage (for UI state)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project with Authentication and Firestore enabled

### Installation

1. Navigate to the project directory:
```bash
cd gaming-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase (see Firebase Setup section below)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Note your project ID

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Enable **Email/Password** authentication
3. Click on "Email/Password" and toggle "Enable"

### 3. Set Up Firestore

1. In Firebase Console, go to **Firestore Database** → **Create Database**
2. Start in **test mode** for development (or set up security rules - see below)
3. Choose a location for your database

### 4. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the Firebase configuration

### 5. Set Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your Firebase configuration.

### 6. Firestore Security Rules (IMPORTANT!)

**You must update your Firestore security rules or you'll get "Missing or insufficient permissions" errors.**

#### Option 1: Test Mode (Development Only - NOT for production)

For quick testing, you can temporarily use test mode:
1. Go to Firestore Database in Firebase Console
2. Click on "Rules" tab
3. Use this (⚠️ **ONLY FOR DEVELOPMENT**):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

#### Option 2: Proper Security Rules (Recommended)

For proper security, use these rules (also saved in `firestore.rules` file):

1. Go to Firebase Console → Firestore Database → Rules tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rooms collection
    match /rooms/{roomId} {
      // Helper function to check if user is in players array
      function isPlayer() {
        return request.auth != null && (
          request.auth.uid == resource.data.players[0].uid ||
          (resource.data.players.size() > 1 && request.auth.uid == resource.data.players[1].uid) ||
          (resource.data.players.size() > 2 && request.auth.uid == resource.data.players[2].uid) ||
          (resource.data.players.size() > 3 && request.auth.uid == resource.data.players[3].uid)
        );
      }
      
      // Helper function to check if user is the host
      function isHost() {
        return request.auth != null && 
               resource.data.hostId == request.auth.uid;
      }
      
      // Allow read if user is authenticated
      allow read: if request.auth != null;
      
      // Allow create if user is authenticated and is setting themselves as host
      allow create: if request.auth != null 
        && request.resource.data.hostId == request.auth.uid
        && request.resource.data.players.size() > 0
        && request.resource.data.players[0].uid == request.auth.uid;
      
      // Helper function to check if user is in new players array
      function isNewPlayer() {
        return request.auth != null && (
          request.auth.uid == request.resource.data.players[0].uid ||
          (request.resource.data.players.size() > 1 && request.auth.uid == request.resource.data.players[1].uid) ||
          (request.resource.data.players.size() > 2 && request.auth.uid == request.resource.data.players[2].uid) ||
          (request.resource.data.players.size() > 3 && request.auth.uid == request.resource.data.players[3].uid)
        );
      }
      
      // Helper function to check if user is joining (not in old array, but in new array)
      function isJoining() {
        return request.auth != null &&
               !isPlayer() &&  // Not already a player
               isNewPlayer() &&  // But will be in new players array
               request.resource.data.players.size() == resource.data.players.size() + 1 &&  // One more player
               request.resource.data.players.size() <= resource.data.maxPlayers;  // Room not full
      }
      
      // Allow update if:
      // 1. User is already a player or host (for game moves, status updates)
      // 2. User is joining the room (adding themselves to players)
      allow update: if request.auth != null 
        && (isHost() || isPlayer() || isJoining());
      
      // Allow delete if user is the host
      allow delete: if request.auth != null && isHost();
    }

    // Users collection (for admin user management)
    match /users/{userId} {
      // Allow read if user is authenticated
      allow read: if request.auth != null;
      
      // Allow create if user is authenticated (when creating new users)
      allow create: if request.auth != null
        && request.resource.data.uid == request.resource.id;
      
      // Allow delete if user is authenticated (admin can delete)
      allow delete: if request.auth != null;
    }
  }
}
```

3. Click "Publish" to save the rules

## Project Structure

```
gaming-hub/
├── app/                          # Next.js App Router pages
│   ├── games/                    # Game pages
│   │   ├── [id]/                 # Game lobby page
│   │   │   └── room/
│   │   │       └── [roomId]/     # Game room page
│   ├── login/                     # Login page
│   ├── signup/                    # Signup page
│   ├── profile/                   # User profile page
│   └── admin/                     # Admin panel
├── components/
│   ├── auth/                      # Authentication components
│   │   ├── AuthProvider.tsx       # Auth context provider
│   │   ├── AuthGate.tsx           # Route protection component
│   │   ├── LoginForm.tsx          # Login form
│   │   └── SignupForm.tsx         # Signup form
│   ├── games/                     # Game components
│   │   └── GameRenderer.tsx      # Game renderer (legacy)
│   ├── online-games/              # Multiplayer game components
│   │   ├── OnlineTicTacToeGame.tsx    # Fully implemented
│   │   ├── OnlineQuizBattleGame.tsx   # Scaffolded
│   │   ├── OnlineRockPaperScissorsGame.tsx  # Scaffolded
│   │   ├── TypingRaceGame.tsx    # Scaffolded
│   │   └── ReactionBattleGame.tsx     # Scaffolded
│   ├── GameCard.tsx               # Game card component
│   ├── GameGrid.tsx               # Game grid layout
│   └── Navbar.tsx                 # Navigation bar
├── lib/
│   ├── firebase/
│   │   ├── config.ts              # Firebase configuration
│   │   ├── auth.ts                # Auth utility functions
│   │   └── firestore.ts           # Firestore room management
│   ├── games/                     # Game logic utilities
│   │   └── ticTacToe.ts           # Tic Tac Toe game logic
│   ├── seedData.ts                # Multiplayer game seed data
│   └── storage.ts                 # localStorage utilities
└── types/
    └── index.ts                   # TypeScript type definitions
```

## Multiplayer Games

### Fully Implemented

1. **Online Tic Tac Toe** (`online-tic-tac-toe`)
   - Real-time 2-player gameplay
   - Room creation and joining
   - Turn-based with win/draw detection
   - Status: Live

### Scaffolded (Ready for Implementation)

2. **Online Quiz Battle** (`online-quiz-battle`)
   - 2-player quiz competition
   - Status: Beta

3. **Online Rock Paper Scissors** (`online-rock-paper-scissors`)
   - Quick 2-player matches
   - Status: Beta

4. **Typing Race** (`typing-race`)
   - 2-4 player typing competition
   - Status: Beta

5. **Reaction Battle** (`reaction-battle`)
   - 2-player reaction speed test
   - Status: Beta

## How It Works

### Room System

1. **Create Room**: User creates a room and receives a room code
2. **Join Room**: Another user enters the room code to join
3. **Game State**: Game state is synchronized in real-time via Firestore
4. **Room Status**: Rooms can be "waiting", "playing", or "finished"

### Room Data Structure

```typescript
type GameRoom = {
  id: string;
  gameId: string;
  hostId: string;
  hostName: string;
  roomCode: string;
  status: "waiting" | "playing" | "finished";
  maxPlayers: number;
  players: {
    uid: string;
    name: string;
    email: string;
    joinedAt: string;
  }[];
  gameState: any;  // Game-specific state
  winner?: string | null;
  currentTurn?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### Adding a New Multiplayer Game

1. **Add to Seed Data** (`lib/seedData.ts`):
   ```typescript
   {
     id: 'your-game-id',
     title: 'Your Game Title',
     // ... other fields
     multiplayer: true,
     authRequired: true,
     minPlayers: 2,
     maxPlayers: 4,
     status: 'beta',
   }
   ```

2. **Create Game Component** (`components/online-games/YourGame.tsx`):
   ```typescript
   interface YourGameProps {
     gameId: string;
     roomId: string;
   }
   
   export default function YourGame({ gameId, roomId }: YourGameProps) {
     // Implement game logic
     // Use subscribeToRoom for real-time updates
     // Use updateRoom to update game state
   }
   ```

3. **Add to Room Page** (`app/games/[id]/room/[roomId]/page.tsx`):
   ```typescript
   {game.id === 'your-game-id' && (
     <YourGame gameId={game.id} roomId={room.id} />
   )}
   ```

## Route Protection

All multiplayer game pages are protected using `AuthGate` component:

```typescript
<AuthGate>
  {/* Protected content */}
</AuthGate>
```

Unauthenticated users are automatically redirected to `/login`.

## Admin Panel

Access the admin panel at `/admin` (password: `admin123` by default).

The admin panel allows you to:
- Add new multiplayer games
- Edit game metadata (title, description, category, etc.)
- Set player counts (min/max)
- Set game status (live, beta, coming-soon)
- Delete non-live games

## Environment Variables

Required environment variables (in `.env`):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Building for Production

```bash
npm run build
npm start
```

## Key Files

- **Firebase Config**: `lib/firebase/config.ts`
- **Auth Utilities**: `lib/firebase/auth.ts`
- **Room Management**: `lib/firebase/firestore.ts`
- **Online Tic Tac Toe**: `components/online-games/OnlineTicTacToeGame.tsx`
- **Game Lobby**: `app/games/[id]/page.tsx`
- **Game Room**: `app/games/[id]/room/[roomId]/page.tsx`
- **Auth Provider**: `components/auth/AuthProvider.tsx`

## License

MIT
