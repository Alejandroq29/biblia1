import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/database/biblia-kids', async () => {
	const actual =
		await vi.importActual<typeof import('@/database/biblia-kids')>('@/database/biblia-kids');

	return {
		...actual,
		createAttempt: vi.fn(async (userId: string, data: { gameId: string; score: number }) => ({
			id: 'attempt-1',
			gameId: data.gameId,
			storyId: 'story-1',
			levelId: 'level-1',
			score: data.score,
			maxScore: 10,
			completedAt: new Date(),
			createdAt: new Date(),
		})),
	};
});

const scheduleMock = vi.fn();
vi.mock('@/services/biblia-kids/attempt.queue', () => ({ scheduleAttemptAnalytics: scheduleMock }));

describe('biblia-kids service', () => {
	beforeEach(() => {
		scheduleMock.mockReset();
	});

	it('schedules analytics when creating an attempt', async () => {
		const { bibliaKidsService } = await import('@/services/biblia-kids');
		const attempt = await bibliaKidsService.createAttempt('user-1', {
			gameId: 'game-1',
			score: 7,
			answers: [],
		});

		expect(attempt).toHaveProperty('id', 'attempt-1');
		expect(scheduleMock).toHaveBeenCalled();
		const payload = scheduleMock.mock.calls[0][0];
		expect(payload).toMatchObject({
			attemptId: 'attempt-1',
			userId: 'user-1',
			gameId: 'game-1',
			score: 7,
		});
	});
});
