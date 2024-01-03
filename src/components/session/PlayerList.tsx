// components/PlayerList.tsx

import React from 'react';

// Props type definition
interface PlayerListProps {
  sessionData: {
    roles: { [key: string]: string };
    currentLeader: string[];
  };
  user: string;
}

// Utility function to determine if the user is an impostor
const isImpostor = (user: string, roles: { [key: string]: string }) => roles[user] === 'impostor';

const PlayerList: React.FC<PlayerListProps> = ({ sessionData, user }) => {
  const { roles, currentLeader } = sessionData;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold">Players</h2>
      <ul className="w-full">
        {Object.keys(roles).map((playerName) => (
          <li
            key={playerName}
            className={`flex justify-between items-center p-2 ${
              currentLeader.includes(playerName) ? 'bg-blue-200' : ''
            }`}
          >
            <span>{playerName}</span>
            {/* Display role if current user is an impostor or if the player is the current user */}
            {isImpostor(user, roles) || user === playerName ? (
              <span className="rounded px-2 py-1 text-xs font-semibold text-white bg-green-500">
                {roles[playerName]}
              </span>
            ) : (
              <span className="rounded px-2 py-1 text-xs font-semibold text-white bg-gray-500">
                ?
              </span>
            )}
            {/* Display 'L' if player is the current leader */}
            {currentLeader[0] === playerName && (
              <span className="ml-2 rounded-full bg-yellow-400 px-2 text-xs font-bold">
                L
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
