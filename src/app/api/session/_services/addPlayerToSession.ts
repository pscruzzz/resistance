import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ISession } from './createSession';

interface IVerifySession {
  sessionId: string;
  user: string;
}

export async function addPlayerToSession({ sessionId, user }: IVerifySession, session: ISession): Promise<Response> {
  if (session.roles[user]) {
    return new Response('User already registered', { status: 200 });
  }

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  try {
    if (session) {
      const updateCommand = new UpdateItemCommand({
        TableName: "resistance",
        Key: marshall({ id: sessionId }),
        UpdateExpression: "SET #roles.#user = :role",
        ExpressionAttributeNames: {
          "#roles": "roles",
          "#user": user
        },
        ExpressionAttributeValues: {
          ":role": { S: "resistance" } as AttributeValue
        }
      });

      await client.send(updateCommand);
      return new Response('User added to session', { status: 200 });
    } else {
      return new Response('Error getting item into DynamoDB', { status: 500 });
    }
  } catch (e) {
    console.error("Error updating item into DynamoDB", e);
    return new Response('Error updating item into DynamoDB', { status: 500 });
  }
}
