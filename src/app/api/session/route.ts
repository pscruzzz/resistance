import { cookies } from 'next/headers'
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
//import { serialize } from 'cookie';
 
export async function POST(request: Request) {
  
  const response: {sessionId: string, user: string} = await request.json()

  if(response.sessionId == undefined){
    return new Response('Bad Request', {
      status: 404
    })
  }

  if(response.user == undefined){
    return new Response('Bad Request', {
      status: 404
    })
  }
  
  return Response.json({ res })

  if(process.env.JWT_SECRET_RENDER_AUTH === undefined || 
    process.env.RENDER_PASSWORD === undefined){
    return new Response('Internal Server Error', {
      status: 500
    })
  }

  const cookieStore = cookies()
  const collabAuthCookie = cookieStore.get('collabAuthCookie')?.value

  if(collabAuthCookie !== undefined){
    try {
      jwt.verify(collabAuthCookie, process.env.JWT_SECRET_RENDER_AUTH);

      return new Response('Hello, Next.js!', {
        status: 200
      })
    } catch (error) {
      //Do Nothing
    }
  }

  const requestBody: {token: string} = await request.json()
  const bodyToken = requestBody.token;

  if(bodyToken == undefined){
    return new Response('Forbidden', {
      status: 403
    })
  }

  if(bodyToken !== process.env.RENDER_PASSWORD){
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const jwtToken = jwt.sign({ bodyToken }, process.env.JWT_SECRET_RENDER_AUTH, { expiresIn: '1h' }); 

  const cookieOptions = [
    `collabAuthCookie=${jwtToken}`,
    'HttpOnly',         // Makes the cookie inaccessible to client-side scripts
    'Secure',           // Ensures the cookie is sent over HTTPS
    'Path=/',           // Specifies the path for the cookie
    'SameSite=Lax',     // Lax SameSite setting for CSRF protection
    `Max-Age=${60 * 60}` // Cookie expiry set to match JWT expiry (1 hour in this case)
  ].join('; ');

  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { 'Set-Cookie': cookieOptions },
  })
}