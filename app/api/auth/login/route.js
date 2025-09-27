// app/api/auth/login/route.js

// (imports should already be here)
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find the user AND include their tenant's information
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }, // <-- CHANGED: Include tenant details
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Add email and tenantName to the JWT payload
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email, // <-- CHANGED: Added email
      tenantName: user.tenant.name, // <-- CHANGED: Added tenant name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return NextResponse.json({ token }, { status: 200 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}