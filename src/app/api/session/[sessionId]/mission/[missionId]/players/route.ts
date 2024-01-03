import { addPlayersToMission } from '@/app/api/session/_services/addPlayersToMission';
import { verifySession } from './../../../../_services/verifySession';

export async function POST(request: Request,{ params: {sessionId, missionId} }: { params: { sessionId: string, missionId: string } }) {

  const requestBody: { players: string[] } = await request.json();

  if (sessionId === undefined) {
    return new Response('Bad Request', { status: 400 });
  }
  if (missionId === undefined) {
    return new Response('Bad Request', { status: 400 });
  }
  if (requestBody.players === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  return await addPlayersToMission({ sessionId, players: requestBody.players, missionId})
}