import type { JobsOptions } from 'bullmq';
import { Queue } from 'bullmq';

import { getRedisConnection } from '@/lib/cache/redis';

export type AttemptAnalyticsPayload = {
	attemptId: string;
	userId: string;
	gameId: string;
	storyId: string;
	levelId: string;
	score: number;
	maxScore: number;
	completedAt: string;
};

const redisConnection = getRedisConnection();

const queue = redisConnection
	? new Queue('biblia-kids.attempts', { connection: redisConnection })
	: null;

export const scheduleAttemptAnalytics = async (
	payload: AttemptAnalyticsPayload,
	options: JobsOptions = { removeOnComplete: true, removeOnFail: true },
): Promise<void> => {
	if (!queue) {
		return;
	}

	await queue.add('attempt.created', payload, options);
};
