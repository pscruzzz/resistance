import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ISession, ISessionConfig } from './createSession';

interface IVerifySession{
  sessionId: string
}

export async function verifySession({sessionId}: IVerifySession): Promise<ISession | undefined>{
  
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
      return existingSession
    } else{
      return undefined;
    }
  } catch (e) {
    console.error("Error getting item into DynamoDB", e);
    return undefined;
  }
}
