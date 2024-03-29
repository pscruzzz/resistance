import React from 'react';

// Props type definition
interface MissionsTableProps {
  currentMission: number;
  missions: {
    [key: string]: {
      missionVotes: string[];
      players: string[];
      status: string;
    };
  };
}

const MissionsTable: React.FC<MissionsTableProps> = ({ missions, currentMission }) => {
  // Function to count votes and create a summary string
  const summarizeVotes = (missionVotes: string[]) => {
    const voteCounts = missionVotes.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(voteCounts)
      .map(([vote, count]) => `${count}x ${vote.charAt(0).toUpperCase() + vote.slice(1)}`)
      .join(', ');
  };

  return (
    <div className="flex flex-col items-center w-full md:w-1/2">
      <h2 className="text-lg font-semibold pb-2">Missions</h2>
      <div className='flex flex-col w-full gap-y-2 rounded-sm p-2 outline outline-3 outline-offset-2 outline-gray-300'>
        <div className='flex flex-row w-full items-center justify-between'>
          <div className="flex w-1/5 font-bold items-center justify-center">Mission</div>
          <div className="flex w-2/5 font-bold items-center justify-center text-center">Players</div>
          <div className="flex w-2/5 font-bold items-center justify-center">Status</div>
        </div>
        {Object.keys(missions).map((missionNumber) => (
          <div key={missionNumber} className='flex flex-row w-full items-center justify-between'>
            <div className={`flex w-1/5 items-center justify-center`}>
              <div className={`${currentMission === Number(missionNumber) ? "text-yellow-600 font-bold" : ""}`}>
                {missionNumber}
              </div>
            </div>
            <div className="flex flex-col w-2/5 items-center justify-center text-center">
              {missions[missionNumber].players.join(', ')}
              {missions[missionNumber].missionVotes.length === missions[missionNumber].players.length && 
              <div className="text-xs	text-gray-500	pt-1">{summarizeVotes(missions[missionNumber].missionVotes)}</div>}
              
            </div>
            <div className="flex w-2/5 flex-col items-center justify-center">
              <span className={`rounded px-2 py-1 text-xs font-semibold text-gray-800 text-center ${missions[missionNumber].status === "failed" ? "bg-red-200" : "bg-emerald-200"}`}>
                {missions[missionNumber].status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionsTable;
