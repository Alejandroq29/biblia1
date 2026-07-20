import * as bibliaKidsData from '@/database/biblia-kids';

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
	createAttempt: bibliaKidsData.createAttempt,
	getProgress: bibliaKidsData.getProgress,
};
