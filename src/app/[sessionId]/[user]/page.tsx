// pages/session/[sessionId].tsx
'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios for fetching data
import Container from '@/components/base/Container';
import PlayerList from '@/components/session/PlayerList'; // You'll create this component
import LeaderAction from '@/components/session/LeaderAction'; // You'll create this component

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
        const response = await axios.get(`http://localhost:3000/api/session/${sessionId}`);
        setSessionData(response.data);
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  if (!sessionData) {
    return <div>Loading...</div>; // or some loading spinner
  }

  return (
    <Container>
      {/* Header showing session ID and current mission */}
      <div className="p-4">
        <h1 className="text-xl font-bold">Session: {sessionData.id}</h1>
        <p>Current Mission: {sessionData.currentMission}</p>
        <p>Status: {sessionData.missions[sessionData.currentMission.toString()].status}</p>
      </div>

      {/* Player List */}
      <PlayerList sessionData={sessionData} user={user} />

      {/* Leader Action Area */}
      {sessionData.currentLeader[0] === user && (
        <LeaderAction sessionData={sessionData}  submitMissionSelection={()=>{}}/>
      )}

      {/* Other players see a waiting message */}
      {sessionData.currentLeader[0] !== user && (
        <div className="text-center p-4">
          <p>Action: Wait For Leader</p>
        </div>
      )}
    </Container>
  )
}
