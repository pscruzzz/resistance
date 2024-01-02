import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

interface ICreateSession{
  sessionId: string
  playersAmount: number
  user: string
}

export interface ISession {
  id: string;
  playersAmount: number;
  currentMission: string;
  currentLeader: string;
  isFinished: boolean;
  roles: { [key: string]: string };
  missionsConfig: { [key: string]: number };
  missions: { [key: number]: string[] };
}

export async function createSession({playersAmount, sessionId, user}: ICreateSession){

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  const newSession: ISession = {
    id: sessionId,
    playersAmount: playersAmount,
    currentLeader: user,
    currentMission: "first",
    isFinished: false,
    roles: { [user]: "resistance" },
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