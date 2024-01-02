import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall,unmarshall } from '@aws-sdk/util-dynamodb';

interface ISession {
  id: string;
  currentMission: string;
  currentLeader: string;
  isFinished: boolean;
  roles: { [key: string]: string };
  missionsConfig: { [key: string]: number };
  missions: { [key: number]: string[] };
}

export async function POST(request: Request) {
  const response: { sessionId: string, user: string } = await request.json();

  if (response.sessionId === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  if (response.user === undefined) {
    return new Response('Bad Request', { status: 400 });
  }

  const getItemCommand = new GetItemCommand({
    TableName: "resistance",
    Key: marshall({ id: response.sessionId })
  });

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  try {
    const { Item } = await client.send(getItemCommand);

    if (Item) {
      const existingSession = unmarshall(Item) as ISession;
      if (existingSession.roles[response.user]) {
        return new Response('User already registered', { status: 200 });
      }
    }
  } catch (e) {
    console.error("Error getting item into DynamoDB", e);
    return new Response('Internal Server Error', { status: 500 });
  }

  const newSession: ISession = {
    id: response.sessionId,
    currentLeader: response.user,
    currentMission: "first",
    isFinished: false,
    roles: { [response.user]: "resistance" },
    missionsConfig: {
      1: 2,
      2: 3,
      3: 2,
      4: 3,
      5: 3
    },
    missions: {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    },
  };

  const putCommand = new PutItemCommand({
    TableName: "resistance",
    Item: marshall(newSession)
  });

  try {
    await client.send(putCommand);
    return new Response('Session created successfully', { status: 200 });
  } catch (error) {
    console.error("Error inserting item into DynamoDB", error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
