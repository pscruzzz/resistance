import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

interface ICreateSession{
  sessionId: string
  sessionConfig: ISessionConfig
  user: string
}

export interface ISession {
  id: string;
  currentMission: number;
  currentLeader: string;
  isFinished: boolean;
  roles: { [key: string]: string };
  missionsConfig: { [key: string]: number };
  sessionConfig: ISessionConfig;
  missions: { [key: number]: IMission };
}

export interface IMission {
  votes: string[],
  status: 'Failed' | "Succeeded" | "Voting"
  players: string[],
}

export interface ISessionConfig {
  maxResistances: number;
  maxImpostors: number;
}

export async function createSession({sessionConfig, sessionId, user}: ICreateSession): Promise<Response>{

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  const newSession: ISession = {
    id: sessionId,
    sessionConfig,
    currentLeader: user,
    currentMission: 1,
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
      1: {
        players: [],
        votes: [],
        status: "Voting"
      },
      2: {
        players: [],
        votes: [],
        status: "Voting"
      },
      3: {
        players: [],
        votes: [],
        status: "Voting"
      },
      4: {
        players: [],
        votes: [],
        status: "Voting"
      },
      5: {
        players: [],
        votes: [],
        status: "Voting"
      },
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