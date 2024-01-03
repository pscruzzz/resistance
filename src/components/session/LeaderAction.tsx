// components/LeaderAction.tsx

import React, { useState } from 'react';

// Props type definition
interface LeaderActionProps {
  sessionData: {
    currentMission: number;
    missionsConfig: { [key: string]: number };
    currentLeader: string[];
  };
  submitMissionSelection: (selectedPlayers: string[]) => void; // This function will be used to submit the selection
}

const LeaderAction: React.FC<LeaderActionProps> = ({ sessionData, submitMissionSelection }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const missionNumber = sessionData.currentMission.toString();
  const playersNeeded = sessionData.missionsConfig[missionNumber];

  const togglePlayerSelection = (playerName: string) => {
    setSelectedPlayers((prevSelected) =>
      prevSelected.includes(playerName)
        ? prevSelected.filter((name) => name !== playerName)
        : [...prevSelected, playerName].slice(0, playersNeeded) // Ensure we don't select more than needed
    );
  };

  const handleSubmit = () => {
    if (selectedPlayers.length === playersNeeded) {
      submitMissionSelection(selectedPlayers);
    } else {
      alert(`Please select exactly ${playersNeeded} players for the mission.`);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-lg font-semibold mb-2">Select Players for Mission</h2>
      <ul className="w-full mb-4">
        {sessionData.currentLeader.map((playerName) => (
          <li
            key={playerName}
            className={`flex justify-between items-center p-2 ${
              selectedPlayers.includes(playerName) ? 'bg-green-200' : 'bg-gray-200'
            }`}
            onClick={() => togglePlayerSelection(playerName)}
          >
            {playerName}
          </li>
        ))}
      </ul>
      <button
        className={`px-4 py-2 rounded text-white font-bold ${
          selectedPlayers.length === playersNeeded ? 'bg-blue-500' : 'bg-blue-300 cursor-not-allowed'
        }`}
        onClick={handleSubmit}
        disabled={selectedPlayers.length !== playersNeeded}
      >
        Submit
      </button>
    </div>
  );
};

export default LeaderAction;
