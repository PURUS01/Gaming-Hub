import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signupWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
