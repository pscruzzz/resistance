import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ISession, ISessionConfig } from './createSession';

interface IAddPlayersToMission {
  sessionId: string;
  players: string[];
  missionId: string;
}

export async function addPlayersToMission({ sessionId, players, missionId }: IAddPlayersToMission): Promise<Response> {

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  try {
      // Constructing the path to the specific mission's players array
      const missionPlayersPath = `missions.#missionId.players`;

      // UpdateExpression to append players to the specific mission's players array
      const updateExpression = `SET ${missionPlayersPath} = list_append(if_not_exists(${missionPlayersPath}, :emptyList), :newPlayers)`;

      // Constructing the command
      const updateCommand = new UpdateItemCommand({
        TableName: "resistance",
        Key: marshall({ id: sessionId }),
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: {
          "#missionId": missionId
        },
        ExpressionAttributeValues: {
          ":newPlayers": { L: players.map(player => ({ S: player })) },
          ":emptyList": { L: [] }
        }
      });

      await client.send(updateCommand);
      return new Response('Players added to mission', { status: 200 });
  } catch (e) {
    console.error("Error adding players into mission", e);
    return new Response('Error adding players into mission', { status: 500 });
  }
}
