import * as bibliaKidsData from '@/database/biblia-kids';
import { scheduleAttemptAnalytics } from '@/services/biblia-kids/attempt.queue';

export const bibliaKidsService = {
	getStories: bibliaKidsData.getStories,
	getStory: bibliaKidsData.getStory,
	createStory: bibliaKidsData.createStory,
	updateStory: bibliaKidsData.updateStory,
	deactivateStory: bibliaKidsData.deactivateStory,
	getLevel: bibliaKidsData.getLevel,
	getLevels: bibliaKidsData.getLevels,
	createLevel: bibliaKidsData.createLevel,
	updateLevel: bibliaKidsData.updateLevel,
	deactivateLevel: bibliaKidsData.deactivateLevel,
	getGame: bibliaKidsData.getGame,
	getGames: bibliaKidsData.getGames,
	createGame: bibliaKidsData.createGame,
	updateGame: bibliaKidsData.updateGame,
	deactivateGame: bibliaKidsData.deactivateGame,

	// Biblia resources
	getBooks: bibliaKidsData.getBooks,
	getBook: bibliaKidsData.getBook,
	createBook: bibliaKidsData.createBook,
	updateBook: bibliaKidsData.updateBook,
	deactivateBook: bibliaKidsData.deactivateBook,

	getChapter: bibliaKidsData.getChapter,
	getChapters: bibliaKidsData.getChapters,
	createChapter: bibliaKidsData.createChapter,
	updateChapter: bibliaKidsData.updateChapter,
	deactivateChapter: bibliaKidsData.deactivateChapter,

	getVerse: bibliaKidsData.getVerse,
	getVerses: bibliaKidsData.getVerses,
	createVerse: bibliaKidsData.createVerse,
	updateVerse: bibliaKidsData.updateVerse,
	deactivateVerse: bibliaKidsData.deactivateVerse,

	// Favorites & reading plans
	addFavorite: bibliaKidsData.addFavorite,
	removeFavorite: bibliaKidsData.removeFavorite,
	getFavorites: bibliaKidsData.getFavorites,

	createReadingPlan: bibliaKidsData.createReadingPlan,
	getReadingPlan: bibliaKidsData.getReadingPlan,
	getReadingPlans: bibliaKidsData.getReadingPlans,
	updateReadingPlan: bibliaKidsData.updateReadingPlan,
	deleteReadingPlan: bibliaKidsData.deleteReadingPlan,
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
