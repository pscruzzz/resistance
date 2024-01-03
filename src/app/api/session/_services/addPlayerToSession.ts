import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ISession, ISessionConfig } from './createSession';

interface IVerifySession {
  sessionId: string;
  user: string;
}

function defineRole(roles: { [key: string]: string }, sessionConfig: ISessionConfig): string {
  const impostorCount = Object.values(roles).filter(role => role === "impostor").length;
  const resistanceCount = Object.values(roles).filter(role => role === "resistance").length;

  // Maximum number of impostors and resistance
  const maxImpostors = sessionConfig.maxImpostors;
  const maxResistances = sessionConfig.maxResistances;

  // Use current timestamp to generate a pseudo-random number
  const timestamp = new Date().getTime();
  let pseudoRandom = timestamp % 100; // Get the last two digits for variability

  // Normalize the pseudoRandom number to either 0 or 1
  pseudoRandom = pseudoRandom % 2; 

  let chosenRole = pseudoRandom === 0 ? "impostor" : "resistance";

  // Validate and possibly switch the role according to the game rules
  if (chosenRole === "impostor" && impostorCount >= maxImpostors) {
    chosenRole = "resistance";
  } else if (chosenRole === "resistance" && resistanceCount >= maxResistances) {
    chosenRole = "impostor";
  }

  return chosenRole;
}


export async function addPlayerToSession({ sessionId, user }: IVerifySession, session: ISession): Promise<Response> {
  if (session.roles[user]) {
    return new Response('User already registered', { status: 200 });
  }

  const playersAmount = session.sessionConfig.maxImpostors + session.sessionConfig.maxResistances

  if(Object.keys(session.roles).length >= playersAmount){
    return new Response('No new players allowed', { status: 400 });
  }

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  const role = defineRole(session.roles, session.sessionConfig);

  try {
    if (session) {
      const updateCommand = new UpdateItemCommand({
        TableName: "resistance",
        Key: marshall({ id: sessionId }),
        UpdateExpression: "SET #roles.#user = :role, #currentLeader = list_append(if_not_exists(#currentLeader, :emptyList), :newUser)",
        ExpressionAttributeNames: {
          "#roles": "roles",
          "#user": user,
          "#currentLeader": "currentLeader" // Placeholder for currentLeader attribute
        },
        ExpressionAttributeValues: {
          ":role": { S: role } as AttributeValue,
          ":newUser": { L: [{ S: user }] }, // Append the new user to the currentLeader list
          ":emptyList": { L: [] } // Create an empty list if currentLeader does not exist
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
