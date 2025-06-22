'use client';

import { useParams } from 'next/navigation';
import React from 'react'; // Explicitly import React for clarity

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id; // Keep using userId to ensure params are accessed

  if (!userId) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red' }}>
        Error: User ID is not available.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Minimal Profile Page</h1>
      <p>User ID: {userId}</p>
      <p>If you see this, the basic component structure is working.</p>
    </div>
  );
}
