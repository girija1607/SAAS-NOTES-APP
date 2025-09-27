// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  // --- State for notes and UI ---
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: State for the create note form ---
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [formError, setFormError] = useState(null);


  // Protect the route
  useEffect(() => {
    if (user === null && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch notes when the component mounts
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      api('/notes')
        .then(data => setNotes(data))
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated]);

  // --- NEW: Function to handle creating a note ---
  const handleCreateNote = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!newNoteTitle) {
      setFormError('Title is required.');
      return;
    }

    try {
      const newNote = await api('/notes', {
        method: 'POST',
        body: JSON.stringify({ title: newNoteTitle, content: newNoteContent }),
      });
      // Add the new note to the top of the list for an instant UI update
      setNotes([newNote, ...notes]);
      // Clear the form fields
      setNewNoteTitle('');
      setNewNoteContent('');
    } catch (err) {
      // This will catch the 403 Forbidden error when the note limit is reached
      setFormError(err.message);
    }
  };

  // --- NEW: Function to handle deleting a note ---
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api(`/notes/${noteId}`, { method: 'DELETE' });
        // Remove the note from the list for an instant UI update
        setNotes(notes.filter(note => note.id !== noteId));
      } catch (err) {
        setError('Failed to delete note. Please try again.');
      }
    }
  };


  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-100"></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            {user?.tenantName || 'Dashboard'}
          </h1>
          <div className="flex items-center">
            <span className="text-gray-600 mr-4">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-6">
        
        {/* --- NEW: Create Note Form --- */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Create a New Note</h2>
          <form onSubmit={handleCreateNote}>
            <div className="mb-4">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black"
              />
            </div>
            <div className="mb-4">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Note Content (optional)"
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black"
              ></textarea>
            </div>
            <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
              Create Note
            </button>
            {/* --- NEW: Upgrade Message --- */}
            {formError && (
              <p className="text-red-500 mt-4">
                {formError}
                {formError.includes('limit') && 
                  <span className="ml-2 font-bold underline cursor-pointer">Upgrade to Pro!</span>
                }
              </p>
            )}
          </form>
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Your Notes</h2>
        
        {isLoading && <p>Loading notes...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {!isLoading && !error && (
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map(note => (
                <div key={note.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{note.title}</h3>
                      <p className="text-gray-600 mt-2">{note.content}</p>
                    </div>
                    {/* --- NEW: Delete Button --- */}
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">You have no notes yet. Start by creating one!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}