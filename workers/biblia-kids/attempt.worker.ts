import { Worker } from 'bullmq';

import { getRedisConnection } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import { prisma } from '@/database/client';
import type { AttemptAnalyticsPayload } from '@/services/biblia-kids/attempt.queue';

const redisConnection = getRedisConnection();

if (!redisConnection) {
	logger.warn('Redis is not configured; Biblia Kids attempt worker cannot start.');
	process.exit(1);
}

new Worker<AttemptAnalyticsPayload>(
	'biblia-kids.attempts',
	async job => {
		const attempt = job.data;
		const stats = await prisma.bibliaGameAttempt.aggregate({
			where: {
				userId: attempt.userId,
				storyId: attempt.storyId,
				levelId: attempt.levelId,
			},
			_avg: { score: true },
			_count: { id: true },
			_max: { score: true },
		});

		logger.info(
			{
				attemptId: attempt.attemptId,
				userId: attempt.userId,
				storyId: attempt.storyId,
				levelId: attempt.levelId,
				score: attempt.score,
				maxScore: attempt.maxScore,
				averageScore: stats._avg.score,
				attemptsCount: stats._count.id,
				highestScore: stats._max.score,
			},
			'Processed Biblia Kids attempt analytics job',
		);
	},
	{ connection: redisConnection },
);

logger.info('Biblia Kids attempt worker started.');
