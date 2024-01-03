'use client'

import React, { useState } from 'react';

export default function SessionPage() {
  const [sessionToken, setSessionToken] = useState('');
  const [username, setUsername] = useState('');

  const handleTokenChange = (event: any) => {
    setSessionToken(event.target.value);
  };

  const handleUsernameChange = (event: any) => {
    setUsername(event.target.value);
  };

  const enterSession = () => {
    // Logic to handle entering a session with the given token and username
    console.log('Entering session with token:', sessionToken, 'and username:', username);
  };

  const createSession = () => {
    const newToken = Math.random().toString(36).substr(2, 9); // Simple random token generator
    setSessionToken(newToken);
    console.log('New session token:', newToken);
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
      <button onClick={enterSession} style={{ padding: '10px', margin: '5px' }}>
        Enter Session
      </button>
    </div>
  );
}
