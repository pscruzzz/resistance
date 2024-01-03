import { verifySession } from '../_services/verifySession';

export async function GET(request: Request,{ params: {sessionId} }: { params: { sessionId: string } }) {
  const session = await verifySession({sessionId})
  return Response.json(session)
}