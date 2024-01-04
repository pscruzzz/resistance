import { DynamoDBClient, PutItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

async function acquireLockWithExpiration(client: DynamoDBClient, lockName: string, acquireTimeout: number = 10, lockTimeout: number = 10): Promise<string | undefined> {
  const identifier = uuidv4();
  const lockKey = lockName;
  const ttl = Math.floor(Date.now() / 1000) + lockTimeout;
  const end = Date.now() + acquireTimeout * 1000;

  while (Date.now() < end) {
    const params = {
      TableName: 'resistance-lock', // Replace with your DynamoDB table name
      Item: marshall({
        lockKey: lockKey,
        identifier: identifier,
        ttl: ttl
      }),
      ConditionExpression: 'attribute_not_exists(lockKey)'
    };

    try {
      await client.send(new PutItemCommand(params));
      return identifier;
    } catch (error) {
      const e = error as any
      if (e.name !== 'ConditionalCheckFailedException') {
        throw error;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  return undefined;
}

async function releaseLock(client: DynamoDBClient, lockName: string, identifier: string): Promise<boolean> {
  const lockKey = lockName;
  const params = {
    TableName: 'resistance-lock', // Replace with your DynamoDB table name
    Key: marshall({ lockKey: lockKey }),
    ConditionExpression: 'identifier = :identifier',
    ExpressionAttributeValues: marshall({
      ':identifier': identifier
    })
  };

  try {
    await client.send(new DeleteItemCommand(params));
    return true;
  } catch (error) {
    const e = error as any
    if (e.name === 'ConditionalCheckFailedException') {
      return false;
    }
    throw error;
  }
}

export { acquireLockWithExpiration, releaseLock };
