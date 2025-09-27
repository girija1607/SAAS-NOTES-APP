// app/api/notes/[id]/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to get user and note ID
function getUserAndNoteId(request, params) {
  const userPayload = JSON.parse(request.headers.get('X-User-Payload'));
  const { tenantId } = userPayload;
  const { id: noteId } = params;
  return { tenantId, noteId };
}

// GET /api/notes/:id - Retrieve a specific note
export async function GET(request, { params }) {
  try {
    const { tenantId, noteId } = getUserAndNoteId(request, params);

    const note = await prisma.note.findUnique({
      // CRITICAL: We check for BOTH noteId and tenantId to ensure a user
      // from one tenant cannot access a note from another tenant.
      where: { id: noteId, tenantId: tenantId },
    });

    if (!note) {
      return NextResponse.json({ message: 'Note not found.' }, { status: 404 });
    }

    return NextResponse.json(note, { status: 200 });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/notes/:id - Update a specific note
export async function PUT(request, { params }) {
  try {
    const { tenantId, noteId } = getUserAndNoteId(request, params);
    const { title, content } = await request.json();

    const updatedNote = await prisma.note.update({
      // The `where` clause here also ensures tenant isolation
      where: { id: noteId, tenantId: tenantId },
      data: { title, content },
    });

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    // Prisma's `update` throws an error if the record is not found
    console.error('Error updating note:', error);
    return NextResponse.json({ message: 'Note not found or failed to update.' }, { status: 404 });
  }
}

// DELETE /api/notes/:id - Delete a specific note
export async function DELETE(request, { params }) {
  try {
    const { tenantId, noteId } = getUserAndNoteId(request, params);

    await prisma.note.delete({
      // The `where` clause here is the final security check
      where: { id: noteId, tenantId: tenantId },
    });

    // A 204 No Content response is standard for a successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Prisma's `delete` throws an error if the record is not found
    console.error('Error deleting note:', error);
    return NextResponse.json({ message: 'Note not found or failed to delete.' }, { status: 404 });
  }
}