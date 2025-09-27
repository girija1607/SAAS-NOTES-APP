// app/api/notes/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/notes - List all notes for the current tenant
export async function GET(request) {
  try {
    // 1. Get user data from the middleware
    const userPayload = JSON.parse(request.headers.get('X-User-Payload'));
    const { tenantId } = userPayload;

    // 2. Fetch all notes belonging ONLY to the user's tenant
    // This `where` clause is the key to multi-tenancy and data isolation.
    const notes = await prisma.note.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: 'desc', // Show newest notes first
      },
    });

    // 3. Return the notes
    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request) {
  try {
    // 1. Get user and tenant data from the middleware
    const userPayload = JSON.parse(request.headers.get('X-User-Payload'));
    const { userId, tenantId } = userPayload;

    // 2. Get the note title and content from the request body
    const { title, content } = await request.json();
    if (!title) {
      return NextResponse.json({ message: 'Title is required.' }, { status: 400 });
    }

    // --- Subscription Gating Logic ---
    // 3. Get the tenant's plan and current note count in one query
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    const noteCount = tenant._count.notes;

    // 4. Enforce the Free plan limit
    if (tenant.plan === 'FREE' && noteCount >= 3) {
      return NextResponse.json(
        { message: 'Free plan limit of 3 notes reached. Please upgrade to Pro.' },
        { status: 403 } // 403 Forbidden
      );
    }
    // --- End of Subscription Logic ---

    // 5. Create the new note, ensuring it's linked to the user and tenant
    const newNote = await prisma.note.create({
      data: {
        title: title,
        content: content,
        userId: userId,
        tenantId: tenantId,
      },
    });

    // 6. Return the newly created note
    return NextResponse.json(newNote, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}