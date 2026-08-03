import * as bibliaKidsData from '@/database/biblia-kids';
import { scheduleAttemptAnalytics } from '@/services/biblia-kids/attempt.queue';

export const bibliaKidsService = {
	getStories: bibliaKidsData.getStories,
	getStory: bibliaKidsData.getStory,
	createStory: bibliaKidsData.createStory,
	updateStory: bibliaKidsData.updateStory,
	deactivateStory: bibliaKidsData.deactivateStory,
	getLevels: bibliaKidsData.getLevels,
	createLevel: bibliaKidsData.createLevel,
	updateLevel: bibliaKidsData.updateLevel,
	deactivateLevel: bibliaKidsData.deactivateLevel,
	getGames: bibliaKidsData.getGames,
	createGame: bibliaKidsData.createGame,
	updateGame: bibliaKidsData.updateGame,
	deactivateGame: bibliaKidsData.deactivateGame,
	createAttempt: async (
		userId: string,
		data: Parameters<typeof bibliaKidsData.createAttempt>[1],
	) => {
		const attempt = await bibliaKidsData.createAttempt(userId, data);
		await scheduleAttemptAnalytics({
			attemptId: attempt.id,
			userId,
			gameId: attempt.gameId,
			storyId: attempt.storyId,
			levelId: attempt.levelId,
			score: attempt.score,
			maxScore: attempt.maxScore,
			completedAt: attempt.completedAt.toISOString(),
		});
		return attempt;
	},
	getProgress: bibliaKidsData.getProgress,
};
