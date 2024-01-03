'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'

export default function SessionPage() {
  const [username, setUsername] = useState('');
  const router = useRouter(); // Use Next.js's useRouter hook for redirection
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const createSession = async () => {
    setLoading(true)
    const newToken = Math.random().toString(36).substr(2, 9); // Simple random token generator

    try {
      const response = await fetch('http://localhost:3000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: username,
          sessionId: newToken,
          sessionConfig: {
            maxImpostors: 2,
            maxResistances: 3
          }
        })
      });

      if (response.ok) {
        // If the API call is successful, redirect to the session page
        router.push(`/${newToken}/${username}`);
      } else {
        // Handle errors with a notification or a message to the user
        console.error('Failed to create session. Please try again.');
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error('There was an error creating the session:', error);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Enter username"
        style={{ padding: '10px', margin: '10px' }}
      />
      <br />
      <button onClick={createSession} style={{ padding: '10px', margin: '5px' }}>
      {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full" role="status">
                {/* <span className="visually-hidden">Loading...</span> */}
              </div>
            </div>
          ) : (
            'Create Session'
          )}
      </button>
    </div>
  );
}
