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
    <div className="flex flex-col items-center w-full md:w-1/2">
      <h2 className="text-lg font-semibold pb-2">Players</h2>
      <div className='flex flex-col w-full gap-y-2 rounded-sm p-4 outline outline-3 outline-offset-2 outline-gray-300'>
        {Object.keys(roles).map((playerName) => (
          <div key={playerName} className='flex flex row w-full items-center justify-center'>
            <div className="flex w-1/3 items-center justify-center">
              {currentLeader[0] === playerName ?
                <div className="flex w-1/2 item-center justify-center rounded-full bg-yellow-400 text-xs font-bold">
                  <div className="flex py-2 px-2">
                    Leader
                  </div>
                </div>
                :
                <div className="flex w-fit item-center justify-center rounded-full bg-yellow-400 p-2 text-xs font-bold">

                </div>
              }
            </div>
            <div className="flex w-1/3 item-center justify-center">{playerName}</div>
            <div className="flex w-1/3 item-center justify-center">
              {isImpostor(user, roles) || user === playerName ? (
                <span className={`rounded px-2 py-1 text-xs font-semibold text-gray-800 ${roles[playerName]==="impostor" ? "bg-red-200" : "bg-emerald-200"}`}>
                  {roles[playerName]}
                </span>
              ) : (
                <span className="rounded px-2 py-1 text-xs font-semibold text-white bg-gray-500">
                  ?
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
