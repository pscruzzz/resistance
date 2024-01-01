'use client'
import React, { useState, useEffect } from 'react';
import Container from '@/components/base/Container';
import { randomBytes } from 'crypto'

export default function Home() {
  const [players, setPlayers] = useState(Array(5).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(3);
  const [showRole, setShowRole] = useState(false);

  const rand = (a: any, b: any) => a + (b - a + 1) * crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 | 0;

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  const assignRoles = () => {
    let roles = ['Resistance', 'Resistance', 'Resistance', 'Impostor', 'Impostor'];
    setPlayers(shuffleArray([...roles])); // Use the shuffle function
    setGameStarted(true);
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

  return (
    <Container>
      <div className='flex flex-col items-center justify-center w-full relative gap-y-8 md:gap-x-12'>
        <h1 className='text-gray-600 text-3xl font-bold'>
          You will be:
        </h1>
        {showRole && (
          <>
            <h2 className='text-gray-600 text-2xl font-bold'>
              {players[currentPlayer]}
            </h2>
            <p>Time remaining: {timer}</p>
          </>
        )}
        {!gameStarted || timer === 0 ? (
          <button onClick={gameStarted ? handleButtonClick : assignRoles}>
            {gameStarted ? (currentPlayer < 4 ? 'Next Player' : 'Restart Game') : 'Start Game'}
          </button>
        ) : null}
      </div>
    </Container>
  )
}
