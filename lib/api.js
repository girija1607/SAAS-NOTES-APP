// lib/api.js
'use client';

// This is a wrapper around the native fetch API.
// It automatically adds the Authorization header to requests.
export const api = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  // If the response has no content (like for a DELETE request), return success
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
};