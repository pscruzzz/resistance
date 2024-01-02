import { verifySession } from './_services/verifySession';
import { createSession } from './_services/createSession';


export async function POST(request: Request) {
  const requestBody: { sessionId: string, user: string, playersAmount: number } = await request.json();

  if (requestBody.sessionId === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  if (requestBody.user === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  if (requestBody.playersAmount === undefined) {
    requestBody.playersAmount = 5
  }

  await verifySession(requestBody)
  await createSession(requestBody)
}
