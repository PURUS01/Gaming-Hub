import { NextRequest, NextResponse } from 'next/server';

// Create user via Firebase REST API
// This approach creates the user without affecting the client-side auth state
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get Firebase API key from environment
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Firebase API key not configured' },
        { status: 500 }
      );
    }

    // Use Firebase REST API to create user
    // This creates the user server-side, so it won't affect the client-side auth state
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true, // Required by API, but won't affect client auth
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Failed to create user';
      if (data.error?.message === 'EMAIL_EXISTS') {
        errorMessage = 'This email is already registered';
      } else if (data.error?.message === 'INVALID_EMAIL') {
        errorMessage = 'Invalid email address';
      } else if (data.error?.message === 'WEAK_PASSWORD') {
        errorMessage = 'Password is too weak (minimum 6 characters)';
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User created successfully! Email: ${email}`,
      uid: data.localId,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
