import { addMissionVotes } from '@/app/api/session/_services/addMissionVotes';

export async function POST(request: Request,{ params: {sessionId, missionId} }: { params: { sessionId: string, missionId: string } }) {

  const requestBody: { vote: string } = await request.json();

  if (sessionId === undefined) {
    return new Response('Bad Request', { status: 400 });
  }
  if (missionId === undefined) {
    return new Response('Bad Request', { status: 400 });
  }
  if (requestBody.vote === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  return await addMissionVotes({ sessionId, missionId, vote: requestBody.vote })
}