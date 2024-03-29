import { verifySession } from './_services/verifySession';
import { ISessionConfig, createSession } from './_services/createSession';
import { addPlayerToSession } from './_services/addPlayerToSession';

export async function POST(request: Request) {
  const requestBody: { sessionId: string, user: string, sessionConfig: ISessionConfig } = await request.json();

  if (requestBody.sessionId === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  if (requestBody.user === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  if (requestBody.sessionConfig === undefined) {
    requestBody.sessionConfig = {
      maxImpostors: 2,
      maxResistances: 3
    }
  }

  const session = await verifySession(requestBody)

  //Session does not exist
  if(session === undefined){
    return await createSession(requestBody)
  }

  return await addPlayerToSession(requestBody, session)
}