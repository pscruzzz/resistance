import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { generateJitter } from '../../_utils/generateJitter';
import { verifySession } from './verifySession';

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

    await generateJitter();

    const session = await verifySession({ sessionId })

    if (!session) {
      return new Response('Vote added to start mission', { status: 200 });
    }

    if (session.missions[Number(missionId)].missionVotes.length >=
      session.missions[Number(missionId)].players.length) {
      const hasFailed = session.missions[Number(missionId)].missionVotes.includes("fail")
      const missionStatus = hasFailed ? "failed" : "succeeded"

      const currentMission = session.currentMission;
      let nextMission = currentMission;
      let isFinished = false;

      let updateExpression = `SET missions.#missionId.#missionStatus = :newStatus, #currentMission = :nextMission, #isFinished = :isFinished`;

      if (currentMission + 1 < 5) {
        nextMission = currentMission + 1;
      } else {
        isFinished = true;
      }

      const updateCommand = new UpdateItemCommand({
        TableName: "resistance",
        Key: marshall({ id: sessionId }),
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: {
          "#missionId": missionId,
          "#missionStatus": "status", // Placeholder for the reserved keyword
          "#currentMission": "currentMission",
          "#isFinished": "isFinished" // Adding isFinished to ExpressionAttributeNames
        },
        ExpressionAttributeValues: {
          ":newStatus": { S: missionStatus },
          ":nextMission": { N: nextMission.toString() }, // DynamoDB expects numbers as strings in AttributeValues
          ":isFinished": { BOOL: isFinished } // Adding isFinished to ExpressionAttributeValues
        }
      });

      await client.send(updateCommand);

      return new Response('Vote added to mission and mission updated', { status: 200 });
    }

    return new Response('Vote added to mission', { status: 200 });
  } catch (e) {
    console.error("Error adding vote to mission", e);
    return new Response('Error adding vote to mission', { status: 500 });
  }
}
