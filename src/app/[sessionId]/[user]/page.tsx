// pages/session/[sessionId].tsx
'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios for fetching data
import Container from '@/components/base/Container';
import PlayerList from '@/components/session/PlayerList'; // You'll create this component
import LeaderAction from '@/components/session/LeaderAction'; // You'll create this component
import VoteForMissionStart from '@/components/session/VoteForMissionStart';
import VoteForMission from '@/components/session/VoteForMission';
import MissionsTable from '@/components/session/MissionsTable';

// Define the types for your state based on the JSON structure
interface SessionState {
  currentMission: number;
  roles: { [key: string]: string };
  missionsConfig: { [key: string]: number };
  currentLeader: string[];
  isFinished: boolean;
  sessionConfig: {
    maxResistances: number;
    maxImpostors: number;
  };
  id: string;
  missions: {
    [key: string]: {
      missionVotes: string[];
      players: string[];
      startMissionVotes: string[];
      status: string;
    };
  };
}

export default function SessionId({ params: { sessionId, user } }: { params: { sessionId: string, user: string } }) {
  const [sessionData, setSessionData] = useState<SessionState | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`/api/session/${sessionId}`);
        setSessionData(response.data);
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    };

    fetchSessionData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`/api/session/${sessionId}`);
        if (JSON.stringify(sessionData) !== JSON.stringify(response.data)) {
          setSessionData(response.data);
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    }, 5000); // Polling every 1 second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [sessionId, sessionData]); 

  if (!sessionData) {
    return <Container><div className='w-full flex item-center justify-center'>Loading...</div></Container>; // or some loading spinner
  }

  return (
    <Container>
      <div className='w-full flex items-center justify-center'>
        <div className='w-full md:w-2/3'>
          {/* Header showing session ID and current mission */}
          <div className="pb-4">
            <div className='flex flex-row items-center justify-between pb-4'>
              <h1 className="text-xl font-bold">Session: {sessionData.id}</h1>
              <h1 className="text-xl font-bold">Player: {user}</h1>
            </div>
          </div>

          <div className='flex flex-col w-full items-center justify-around gap-y-8'>
            {/* Player List */}
            <PlayerList sessionData={sessionData} user={user} />

          
            <MissionsTable missions={sessionData.missions} currentMission={sessionData.currentMission}/>

            {/* Leader Action Area */}
            {sessionData.currentLeader[0] === user && 
            sessionData.missions[sessionData.currentMission.toString()].status === "not-started" && (
              <LeaderAction sessionData={sessionData} />
            )}

            {/* Other players see a waiting message */}
            {sessionData.currentLeader[0] !== user && sessionData.missions[sessionData.currentMission.toString()].status === "not-started" && (
              <div className="text-center p-8">
                <h2>Action:</h2>
                <h4>Wait For Leader</h4>
              </div>
            )}

            {sessionData.missions[sessionData.currentMission.toString()].status === "voting-for-start" && (
              <VoteForMissionStart sessionId={sessionData.id} missionId={sessionData.currentMission} missionParticipants={sessionData.missions[sessionData.currentMission.toString()].players }/>
            )}

            {sessionData.missions[sessionData.currentMission.toString()].status === "voting-for-mission" && (
              <VoteForMission user={user} sessionId={sessionData.id} missionId={sessionData.currentMission} missionParticipants={sessionData.missions[sessionData.currentMission.toString()].players }/>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
