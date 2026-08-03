import Redis from 'ioredis';

import { env } from '@/lib/config/env';
import { logger } from '@/lib/logger';

let redisClient: Redis | null = null;

const getRedisClient = (): Redis | null => {
	if (!env.REDIS_URL) {
		return null;
	}

	if (!redisClient) {
		redisClient = new Redis(env.REDIS_URL);
		redisClient.on('error', error => {
			logger.error({ error }, 'Redis connection error');
		});
	}

	return redisClient;
};

export const getRedisConnection = (): Redis | null => getRedisClient();

export const cacheGet = async <T>(key: string): Promise<T | null> => {
	const client = getRedisClient();
	if (!client) {
		return null;
	}

	const stored = await client.get(key);
	if (!stored) {
		return null;
	}

	try {
		return JSON.parse(stored) as T;
	} catch (error) {
		logger.error({ key, error }, 'Failed to parse cached value');
		await client.del(key);
		return null;
	}
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
	const client = getRedisClient();
	if (!client) {
		return;
	}

	await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

export const cacheDelete = async (key: string): Promise<void> => {
	const client = getRedisClient();
	if (!client) {
		return;
	}

	await client.del(key);
};

export const cacheDeleteByPrefix = async (prefix: string): Promise<void> => {
	const client = getRedisClient();
	if (!client) {
		return;
	}

	let cursor = '0';
	const match = `${prefix}*`;

	do {
		const [nextCursor, keys] = await client.scan(cursor, 'MATCH', match, 'COUNT', 100);
		if (keys.length > 0) {
			await client.del(...keys);
		}
		cursor = nextCursor;
	} while (cursor !== '0');
};
