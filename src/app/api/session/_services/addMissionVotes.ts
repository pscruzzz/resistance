import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

interface IAddMissionVote {
  sessionId: string;
  missionId: string;
  vote: string; // 'fail' or 'success' or any other vote string
}

export async function addMissionVotes({ sessionId, missionId, vote }: IAddMissionVote): Promise<Response> {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  try {
    // Constructing the path to the specific mission's startMissionVotes array
    const missionVotesPath = `missions.#missionId.missionVotes`;

    // UpdateExpression to append vote to the specific mission's startMissionVotes array
    const updateExpression = `SET ${missionVotesPath} = list_append(if_not_exists(${missionVotesPath}, :emptyList), :newVote)`;

    // Constructing the command
    const updateCommand = new UpdateItemCommand({
      TableName: "resistance",
      Key: marshall({ id: sessionId }),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        "#missionId": missionId
      },
      ExpressionAttributeValues: {
        ":newVote": { L: [{ S: vote }] },
        ":emptyList": { L: [] }
      }
    });

    await client.send(updateCommand);
    return new Response('Vote added to mission', { status: 200 });
  } catch (e) {
    console.error("Error adding vote to mission", e);
    return new Response('Error adding vote to mission', { status: 500 });
  }
}
