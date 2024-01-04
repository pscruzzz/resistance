import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

async function acquireLockWithExpiration(redisClient: Redis, lockName: string, acquireTimeout: number = 10, lockTimeout: number = 10): Promise<string | undefined> {
    const identifier = uuidv4();
    const lockKey = `lock:${lockName}`;
    const end = Date.now() + acquireTimeout * 1000; // Convert to milliseconds

    while (Date.now() < end) {
        const lockSet = await redisClient.set(lockKey, identifier, 'EX', lockTimeout, 'NX');
        if (lockSet === 'OK') {
            return identifier;
        }
        await new Promise(resolve => setTimeout(resolve, 1)); // Sleep for 1 ms
    }

    return undefined;
}

async function releaseLock(redisClient: Redis, lockName: string, identifier: string): Promise<boolean> {
    const lockKey = `lock:${lockName}`;
    const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
    `;

    const result = await redisClient.eval(script, 1, lockKey, identifier);
    return result === 1;
}

export { acquireLockWithExpiration, releaseLock };