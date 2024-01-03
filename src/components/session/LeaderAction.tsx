// components/LeaderAction.tsx

import React, { useState } from 'react';

// Props type definition
interface LeaderActionProps {
  sessionData: {
    id: string;
    currentMission: number;
    missionsConfig: { [key: string]: number };
    currentLeader: string[];
  };
}

const LeaderAction: React.FC<LeaderActionProps> = ({ sessionData }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [isDone, setIsDone] = useState<boolean>(false); // Loading state
  const missionNumber = sessionData.currentMission.toString();
  const playersNeeded = sessionData.missionsConfig[missionNumber];

  const togglePlayerSelection = (playerName: string) => {
    setSelectedPlayers((prevSelected) =>
      prevSelected.includes(playerName)
        ? prevSelected.filter((name) => name !== playerName)
        : [...prevSelected, playerName].slice(0, playersNeeded)
    );
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length === playersNeeded) {
      setIsLoading(true); // Start loading
      try {
        const response = await fetch(`/api/session/${sessionData.id}/mission/${missionNumber}/players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            players: selectedPlayers
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Handle the response data or success side effect here
        console.log('Players submitted successfully:', selectedPlayers);
        setIsDone(true)
      } catch (error) {
        console.error('Failed to submit players:', error);
      } finally {
        setIsLoading(false); // Stop loading regardless of the outcome
      }
    } else {
      alert(`Please select exactly ${playersNeeded} players for the mission.`);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-lg font-semibold">Select Players for Mission</h2>
      <ul className="w-full">
        {sessionData.currentLeader.map((playerName) => (
          <li
            key={playerName}
            className={`flex rounded-sm justify-center items-center p-2 m-4 outline-3 outline-offset-2 
            ${
              selectedPlayers.includes(playerName) ? 'outline outline-emerald-500' : "outline-dashed outline-gray-400"
            }`}
            onClick={() => togglePlayerSelection(playerName)}
          >
            {playerName}
          </li>
        ))}
      </ul>
      {isDone ? <h3 className='text-base text-gray-500'>Players Sent!</h3> : <button
        className={`px-4 py-2 rounded text-white font-bold ${
          selectedPlayers.length === playersNeeded && !isLoading ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
        }`}
        onClick={handleSubmit}
        disabled={selectedPlayers.length !== playersNeeded || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full" role="status">
              {/* <span className="visually-hidden">Loading...</span> */}
            </div>
          </div>
        ) : (
          'Submit'
        )}
      </button>}
    </div>
  );
};

export default LeaderAction;
