import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { verifySession } from './verifySession';
import { acquireLockWithExpiration, releaseLock } from '../../_utils/lockFunctions';

interface IAddStartMissionVote {
  sessionId: string;
  missionId: string;
  vote: string; // 'fail' or 'success' or any other vote string
}

export async function addStartMissionVotes({ sessionId, missionId, vote }: IAddStartMissionVote): Promise<Response> {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  const lockName = `${sessionId}:${missionId}`
  const lockId = await acquireLockWithExpiration(client,lockName)

  if (lockId === undefined) {
    return new Response('Cannot lock vote', { status: 500 });
  }

  try {
    // Constructing the path to the specific mission's startMissionVotes array
    const missionVotesPath = `missions.#missionId.startMissionVotes`;

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

    const session = await verifySession({ sessionId })

    if (!session) {
      await releaseLock(client, lockName, lockId)
      return new Response('Vote added to start mission', { status: 200 });
    }

    if (session.sessionConfig.maxImpostors
      + session.sessionConfig.maxResistances
      <= session.missions[Number(missionId)].startMissionVotes.length) {

      // Move the current leader to the end of the list
      const newLeaderList = [...session.currentLeader.slice(1), session.currentLeader[0]];

      const updateLeaderCommand = new UpdateItemCommand({
        TableName: "resistance",
        Key: marshall({ id: sessionId }),
        UpdateExpression: "SET #currentLeader = :newLeaderList",
        ExpressionAttributeNames: {
          "#currentLeader": "currentLeader"
        },
        ExpressionAttributeValues: {
          ":newLeaderList": { L: newLeaderList.map(leader => ({ S: leader })) }
        }
      });

      await client.send(updateLeaderCommand);

      const failVotes = session.missions[Number(missionId)].startMissionVotes.filter(vote => vote === "fail")
      const succeedVotes = session.missions[Number(missionId)].startMissionVotes.filter(vote => vote === "succeed")

      if (failVotes.length > succeedVotes.length) {
        // Reset the mission
        const resetMissionExpression = `SET missions.#missionId = :resetMission`;

        const resetMissionCommand = new UpdateItemCommand({
          TableName: "resistance",
          Key: marshall({ id: sessionId }),
          UpdateExpression: resetMissionExpression,
          ExpressionAttributeNames: {
            "#missionId": missionId
          },
          ExpressionAttributeValues: {
            ":resetMission": {
              M: {
                "missionVotes": { L: [] },
                "players": { L: [] },
                "startMissionVotes": { L: [] },
                "status": { S: "not-started" }
              }
            }
          }
        });

        await client.send(resetMissionCommand);

        await releaseLock(client, lockName, lockId)
        return new Response('Vote added to start mission', { status: 200 });
      }

      // Update the status to "voting-for-mission"
      const updateMissionStatusExpression = `SET missions.#missionId.#missionStatus = :newStatus`;

      const updateStatusCommand = new UpdateItemCommand({
        TableName: "resistance",
        Key: marshall({ id: sessionId }),
        UpdateExpression: updateMissionStatusExpression,
        ExpressionAttributeNames: {
          "#missionId": missionId,
          "#missionStatus": "status" // Placeholder for the reserved keyword
        },
        ExpressionAttributeValues: {
          ":newStatus": { S: "voting-for-mission" }
        }
      });

      await client.send(updateStatusCommand);
    }

    await releaseLock(client, lockName, lockId)
    return new Response('Vote added to start mission', { status: 200 });
  } catch (e) {
    console.error("Error adding vote to start mission", e);
    await releaseLock(client, lockName, lockId)
    return new Response('Error adding vote to start mission', { status: 500 });
  }
}
