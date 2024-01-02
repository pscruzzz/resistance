import { verifySession } from '../_services/verifySession';
import { ISessionConfig, createSession } from '../_services/createSession';
import { addPlayerToSession } from '../_services/addPlayerToSession';

export async function GET(request: Request,{ params: {sessionId} }: { params: { sessionId: string } }) {
  const session = await verifySession({sessionId})
  return Response.json(session)
}