'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionPage() {
  const [sessionToken, setSessionToken] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSessionToken(event.target.value);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const enterSession = async () => {
    try {
      setLoading(true)
      // Assuming the API call is for entering an existing session, not creating a new one
      const response = await fetch(`/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: username,
          sessionId: sessionToken,
          sessionConfig: {
            maxImpostors: 2,
            maxResistances: 3
          }
        })
      });

      if (response.ok) {
        // If the API call is successful, redirect to the session page
        router.push(`/${sessionToken}/${username}`);
      } else {
        setLoading(false)
        // Handle errors with a notification or a message to the user
        console.error('Failed to enter session. Please try again.');
      }
    } catch (error) {
      setLoading(false)
      console.error('There was an error entering the session:', error);
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
      <input
        type="text"
        value={sessionToken}
        onChange={handleTokenChange}
        placeholder="Enter session token"
        style={{ padding: '10px', margin: '10px' }}
      />
      <br />
      <button disabled={loading} onClick={enterSession} style={{ padding: '10px', margin: '5px' }}>
        {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full" role="status">
                {/* <span className="visually-hidden">Loading...</span> */}
              </div>
            </div>
          ) : (
            'Enter Session'
          )}
      </button>
    </div>
  );
}
