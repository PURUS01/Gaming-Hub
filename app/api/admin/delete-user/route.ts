import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/server';
import { doc, deleteDoc } from 'firebase/firestore';

// Delete user from Firestore
// Note: To delete from Firebase Auth, you need Firebase Admin SDK
export async function DELETE(request: NextRequest) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Firestore not initialized' },
        { status: 500 }
      );
    }

    // Delete from Firestore
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    
    // Note: To delete from Firebase Auth, use Admin SDK:
    // const admin = require('firebase-admin');
    // await admin.auth().deleteUser(uid);
    
    return NextResponse.json({ 
      success: true,
      message: 'User removed from database. Note: User still exists in Firebase Auth. Use Admin SDK to fully delete.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
