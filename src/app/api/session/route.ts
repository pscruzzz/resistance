import { verifySession } from './_services/verifySession';
import { createSession } from './_services/createSession';
import { addPlayerToSession } from './_services/addPlayerToSession';

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

  console.log("verifySession")
  const session = await verifySession(requestBody)

  //Session does not exist
  if(session === undefined){
    console.log("createSession")
    return await createSession(requestBody)
  }

  console.log("addPlayerToSession")
  return await addPlayerToSession(requestBody, session)
}
