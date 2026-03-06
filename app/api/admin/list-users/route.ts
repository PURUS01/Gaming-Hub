import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/server';
import { collection, getDocs } from 'firebase/firestore';

// List users from Firestore (users collection)
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({
        error: 'Firestore not initialized',
        users: [],
      }, { status: 500 });
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list users', users: [] },
      { status: 500 }
    );
  }
}
