// middleware.js

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  // 1. Check if a token is present
  if (!token) {
    return NextResponse.json(
      { message: 'Authentication token required.' },
      { status: 401 }
    );
  }

  // 2. Verify the token
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // 3. Add the decoded user payload to the request headers
    // This makes user data (like userId, tenantId) available to our API routes
    const headers = new Headers(request.headers);
    headers.set('X-User-Payload', JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: headers,
      },
    });

  } catch (error) {
    console.error('Invalid token:', error);
    return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/api/notes/:path*', '/api/tenants/:path*'],
};