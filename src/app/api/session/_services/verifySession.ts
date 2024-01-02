import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall,unmarshall } from '@aws-sdk/util-dynamodb';
import { ISession } from './createSession';

interface IVerifySession{
  sessionId: string
  playersAmount: number
  user: string
}

export async function verifySession({sessionId, user}: IVerifySession){
  
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  const getItemCommand = new GetItemCommand({
    TableName: "resistance",
    Key: marshall({ id: sessionId })
  });

  try {
    const { Item } = await client.send(getItemCommand);

    if (Item) {
      const existingSession = unmarshall(Item) as ISession;
      if (existingSession.roles[user]) {
        return new Response('User already registered', { status: 200 });
      }
    }
  } catch (e) {
    console.error("Error getting item into DynamoDB", e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
