// components/VoteForMissionStart.tsx

import React, { useState } from 'react';

// Props type definition
interface VoteForMissionStartProps {
  sessionId: string;
  missionId: number;
  missionParticipants: string[];
  user: string;
}

const VoteForMission: React.FC<VoteForMissionStartProps> = ({ sessionId, missionId, missionParticipants, user }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voteSubmitted, setVoteSubmitted] = useState<boolean>(false); // New state to track if the vote has been submitted

  const handleVote = async (vote: 'succeed' | 'fail') => {
    setIsLoading(true); // Start loading

    try {
      const response = await fetch(`/api/session/${sessionId}/mission/${missionId}/missionVotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle the response data or success side effect here
      console.log('Vote submitted successfully:', vote);
      setVoteSubmitted(true); // Set vote as submitted
    } catch (error) {
      console.error('Failed to submit vote:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  if (!missionParticipants.includes(user)) {
    return (
      <div className="flex flex-col items-center p-4">
        <h2 className="text-lg font-semibold mb-2">Vote For Mission</h2>
        <h2 className="text-base font-semibold text-gray-500">{missionParticipants.join(', ')} are on a mission</h2>
      </div>)
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-lg font-semibold mb-2">Vote For Mission</h2>
      <h2 className="text-base font-semibold text-gray-500">{missionParticipants.join(', ')} are voting</h2>
      {!voteSubmitted ? ( // Only display buttons if the vote hasn't been submitted
        <div className="flex flex-row w-full space-x-2 mt-4">
          <button
            className={`w-1/2 px-4 py-2 rounded text-gray-800 font-bold ${!isLoading ? 'bg-green-300 hover:bg-green-500' : 'bg-green-300 cursor-not-allowed'}`}
            onClick={() => handleVote('succeed')}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Succeed"}
          </button>
          <button
            className={`w-1/2 px-4 py-2 rounded text-gray-800 font-bold ${!isLoading ? 'bg-red-300 hover:bg-red-500' : 'bg-red-300 cursor-not-allowed'}`}
            onClick={() => handleVote('fail')}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Fail"}
          </button>
        </div>
      ) : (
        <h3 className="mt-4">Waiting for others to vote</h3> // Display this message after the vote is submitted
      )}
    </div>
  );
};

export default VoteForMission;
