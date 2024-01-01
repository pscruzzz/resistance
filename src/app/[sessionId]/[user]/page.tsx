'use client'

import React, { useState, useEffect } from 'react';
import Container from '@/components/base/Container';

export default function SessionId({ params: { sessionId, user } }: { params: { sessionId: string, user: string } }) {
  const [players, setPlayers] = useState(Array(5).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(3);
  const [showRole, setShowRole] = useState(false);

  const assignRolesBasedOnTime = () => {
    const time = new Date().getTime();
    let roles = ['Resistance', 'Resistance', 'Resistance', 'Impostor', 'Impostor'];

    // Shuffle using time-based seed
    for (let i = roles.length - 1; i > 0; i--) {
      const timeBasedIndex = (time % (i + 1)) + (time % 1000);
      const j = timeBasedIndex % roles.length; // Ensure j is within the array's bounds
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    setPlayers(roles);
    setGameStarted(true);
  };

  const handleButtonClick = () => {
    if (timer === 0 || !gameStarted) {
      if (currentPlayer < 4) {
        setCurrentPlayer(currentPlayer + 1);
      } else {
        // Reset for a new game
        setCurrentPlayer(0);
        setPlayers(Array(5).fill(null));
        setGameStarted(false);
      }
    }
  };

  const startTimer = () => {
    setShowRole(true);
    setTimer(3);
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
          setShowRole(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (gameStarted && currentPlayer < 5) {
      startTimer();
    }
  }, [currentPlayer, gameStarted]);

  return (
    <Container>
      <div className='flex flex-col items-center justify-center w-full relative gap-y-8 md:gap-x-12'>
        <h1 className='text-gray-600 text-3xl font-bold'>
          {sessionId}
        </h1>
        <h1 className='text-gray-600 text-3xl font-bold'>
          {user} will be:
        </h1>
        {showRole && players[currentPlayer] && (
          <>
            <h2 className='text-gray-600 text-2xl font-bold'>
              {players[currentPlayer]}
            </h2>
            <p>Time remaining: {timer}</p>
          </>
        )}
        {!gameStarted || timer === 0 ? (
          <button onClick={gameStarted ? handleButtonClick : assignRolesBasedOnTime}>
            {gameStarted ? (currentPlayer < 4 ? 'Next Player' : 'Restart Game') : 'Start Game'}
          </button>
        ) : null}
      </div>
    </Container>
  )
}
