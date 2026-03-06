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
} from 'firebase/firestore';

export { db };

export const createRoom = async (roomId: string, gameId: string, hostId: string, hostName: string, hostEmail: string, maxPlayers: number, gameState: any = {}) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const roomData: Partial<GameRoom> = {
    id: roomId,
    gameId,
    hostId,
    hostName,
    roomCode,
    status: 'waiting',
    maxPlayers,
    players: [{
      uid: hostId,
      name: hostName,
      email: hostEmail,
      joinedAt: new Date().toISOString(),
    }],
    gameState,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const roomRef = doc(db, 'rooms', roomId);
  await setDoc(roomRef, roomData);
  return { id: roomId, ...roomData };
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
  
  return { id: roomId, ...roomData, players: newPlayers, status: newStatus };
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
