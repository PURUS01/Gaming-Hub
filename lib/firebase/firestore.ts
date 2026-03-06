import { db } from './config';
import { GameRoom } from '@/types';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs,
  enableNetwork,
  disableNetwork,
  waitForPendingWrites,
} from 'firebase/firestore';

export { db };

// Helper function to ensure Firestore is online
export const ensureFirestoreOnline = async (): Promise<void> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  try {
    // Enable network - this will connect Firestore to the server
    await enableNetwork(db);
    console.log('Firestore network enabled');
  } catch (error: any) {
    // If network is already enabled, this might throw - that's okay
    if (error.message?.includes('already enabled') || error.code === 'failed-precondition') {
      console.log('Firestore network already enabled');
    } else {
      console.warn('Could not enable Firestore network:', error);
      // Don't throw - we'll try the operation anyway
    }
  }
};

export const createRoom = async (roomId: string, gameId: string, hostId: string, hostName: string, hostEmail: string, maxPlayers: number, gameState: any = {}) => {
  // Comprehensive validation
  if (!db) {
    console.error('Firestore database is not initialized');
    console.error('Check if Firebase environment variables are set correctly');
    throw new Error('Firestore is not initialized. Please check your Firebase configuration and refresh the page.');
  }
  
  // Ensure Firestore is online before attempting to create room
  await ensureFirestoreOnline();
  
  if (!hostId || !gameId || !hostName) {
    console.error('Missing required parameters:', { hostId: !!hostId, gameId: !!gameId, hostName: !!hostName });
    throw new Error('Missing required information to create room.');
  }
  
  if (!hostId || maxPlayers < 1) {
    throw new Error('Invalid room configuration.');
  }
  
  // Generate a unique room code
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Ensure players array structure matches Firestore rules exactly
  const playersArray = [{
    uid: hostId,
    name: hostName,
    email: hostEmail || '',
    joinedAt: new Date().toISOString(),
  }];
  
  const roomData = {
    id: roomId,
    gameId,
    hostId,
    hostName,
    roomCode,
    status: 'waiting',
    maxPlayers,
    players: playersArray,
    gameState: gameState || {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  console.log('Creating room with data:', {
    roomId,
    gameId,
    hostId,
    hostName,
    roomCode,
    maxPlayers,
    playersCount: playersArray.length,
    firstPlayerUid: playersArray[0]?.uid,
  });
  
  try {
    const roomRef = doc(db, 'rooms', roomId);
    
    // Try with retries and longer timeout
    let lastError: any = null;
    const maxRetries = 2;
    const timeoutMs = 15000; // Increased to 15 seconds
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        console.log(`Retrying room creation (attempt ${attempt + 1}/${maxRetries + 1})...`);
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            console.error(`Room creation timed out after ${timeoutMs}ms (attempt ${attempt + 1})`);
            reject(new Error(`Room creation timed out after ${timeoutMs}ms. This might be due to Firestore security rules, network issues, or Firestore being unavailable.`));
          }, timeoutMs);
        });
        
        // Race between setDoc and timeout
        await Promise.race([
          setDoc(roomRef, roomData),
          timeoutPromise
        ]);
        
        // Wait for pending writes to complete
        try {
          await waitForPendingWrites(db);
          console.log('All pending writes completed');
        } catch (waitError) {
          console.warn('Could not wait for pending writes:', waitError);
        }
        
        console.log('Room created successfully:', roomId);
        break; // Success, exit retry loop
      } catch (attemptError: any) {
        lastError = attemptError;
        console.error(`Attempt ${attempt + 1} failed:`, attemptError);
        
        // If it's a permission error, don't retry
        if (attemptError.code === 'permission-denied' || 
            attemptError.code === 'unauthenticated' ||
            attemptError.message?.includes('Permission denied')) {
          throw attemptError;
        }
        
        // If it's an offline error, try to enable network again
        if (attemptError.message?.includes('offline') || 
            attemptError.code === 'unavailable') {
          console.log('Detected offline mode, attempting to enable network...');
          try {
            await enableNetwork(db);
            console.log('Network re-enabled, will retry...');
          } catch (networkError) {
            console.warn('Could not re-enable network:', networkError);
          }
        }
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          throw attemptError;
        }
      }
    }
    
    // Return room data without serverTimestamp (which is a placeholder)
    return {
      id: roomId,
      gameId,
      hostId,
      hostName,
      roomCode,
      status: 'waiting' as const,
      maxPlayers,
      players: playersArray,
      gameState: gameState || {},
    } as GameRoom;
  } catch (error: any) {
    console.error('Error creating room - Full error:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    
    // Provide more specific error messages
    if (error.message?.includes('timed out')) {
      console.error('Timeout error - Possible causes:');
      console.error('1. Firestore security rules blocking the operation');
      console.error('2. Network connectivity issues');
      console.error('3. Firestore service unavailable');
      console.error('4. Authentication token expired');
      
      throw new Error(
        `Room creation timed out after multiple attempts. ` +
        `Possible causes: Firestore security rules, network issues, or authentication problems. ` +
        `Please check: 1) Your Firestore security rules allow room creation, 2) You are logged in, 3) Your internet connection is stable.`
      );
    }
    if (error.code === 'permission-denied') {
      console.error('Permission denied - Check Firestore security rules');
      console.error('Current user:', { uid: hostId, email: hostEmail });
      throw new Error(
        'Permission denied by Firestore security rules. ' +
        'Please verify: 1) You are authenticated, 2) Your Firestore rules allow creating rooms where you are the host, ' +
        '3) The rules match the structure in firestore.rules file.'
      );
    }
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.error('Firestore offline error - attempting to enable network...');
      try {
        await enableNetwork(db);
        throw new Error('Firestore was offline. Network has been enabled. Please try creating the room again.');
      } catch (networkError) {
        throw new Error('Firestore is offline or unavailable. Please check your internet connection, refresh the page, and try again.');
      }
    }
    if (error.code === 'failed-precondition') {
      throw new Error('Firestore operation failed due to a precondition error. Please try again.');
    }
    if (error.code === 'unauthenticated') {
      throw new Error('You must be logged in to create a room. Please sign in and try again.');
    }
    if (error.code === 'deadline-exceeded') {
      throw new Error('Firestore operation exceeded the deadline. This might indicate network issues or Firestore being slow. Please try again.');
    }
    
    throw new Error(error.message || 'Failed to create room. Please try again.');
  }
};

export const getRoom = async (roomId: string) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) {
    return { id: roomSnap.id, ...roomSnap.data() };
  }
  return null;
};

export const updateRoom = async (roomId: string, data: any) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToRoom = (roomId: string, callback: (data: any) => void) => {
  if (!db) {
    return () => {};
  }
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
};

export const findRoomByCode = async (roomCode: string) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const roomsRef = collection(db, 'rooms');
  const q = query(roomsRef, where('roomCode', '==', roomCode.toUpperCase()));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as GameRoom;
  }
  return null;
};

export const joinRoom = async (roomId: string, playerId: string, playerName: string, playerEmail: string) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data() as GameRoom;
  
  if (roomData.players.length >= roomData.maxPlayers) {
    throw new Error('Room is full');
  }
  
  if (roomData.players.some(p => p.uid === playerId)) {
    throw new Error('You are already in this room');
  }
  
  const newPlayers = [
    ...roomData.players,
    {
      uid: playerId,
      name: playerName,
      email: playerEmail,
      joinedAt: new Date().toISOString(),
    }
  ];
  
  const newStatus = newPlayers.length >= roomData.maxPlayers ? 'playing' : 'waiting';
  
  await updateDoc(roomRef, {
    players: newPlayers,
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  
  return { ...roomData, id: roomId, players: newPlayers, status: newStatus };
};

export const leaveRoom = async (roomId: string, playerId: string, closeForEveryone: boolean = false) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    return;
  }
  
  const roomData = roomSnap.data() as GameRoom;
  
  if (closeForEveryone) {
    // Close room for all players - set status to finished and clear players
    await updateDoc(roomRef, {
      players: [],
      status: 'finished',
      updatedAt: serverTimestamp(),
    });
  } else {
    // Original behavior - remove only the leaving player
    const newPlayers = roomData.players.filter(p => p.uid !== playerId);
    
    if (newPlayers.length === 0) {
      // Delete room if empty
      await updateDoc(roomRef, {
        status: 'finished',
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update room with remaining players
      await updateDoc(roomRef, {
        players: newPlayers,
        status: newPlayers.length < roomData.maxPlayers ? 'waiting' : roomData.status,
        updatedAt: serverTimestamp(),
      });
    }
  }
};
