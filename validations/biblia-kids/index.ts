import { z } from 'zod';

const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const statusSchema = z.enum(['ACTIVE', 'INACTIVE']);
const answerSchema = z.object({
	questionId: z.string().uuid(),
	answer: z.string().max(500),
});

export const storyQuerySchema = paginationSchema.extend({
	search: z.string().max(180).optional(),
	minAge: z.coerce.number().int().min(6).max(18).optional(),
	maxAge: z.coerce.number().int().min(6).max(18).optional(),
});

export const storyParamsSchema = z.object({ storyId: z.string().uuid() });
export const createStorySchema = z.object({
	title: z.string().trim().min(1).max(180),
	slug: z
		.string()
		.trim()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
		.max(200),
	summary: z.string().max(1000).optional(),
	content: z.string().trim().min(1),
	minAge: z.number().int().min(6).max(18),
	maxAge: z.number().int().min(6).max(18),
	levelIds: z.array(z.string().uuid()).min(1),
});
export const updateStorySchema = createStorySchema
	.partial()
	.extend({ status: statusSchema.optional() });

export const levelQuerySchema = paginationSchema;
export const levelParamsSchema = z.object({ levelId: z.string().uuid() });
export const createLevelSchema = z.object({
	code: z
		.string()
		.trim()
		.regex(/^[a-z0-9-]+$/u)
		.max(80),
	name: z.string().trim().min(1).max(120),
	description: z.string().max(1000).optional(),
	sortOrder: z.number().int().min(0),
});
export const updateLevelSchema = createLevelSchema
	.partial()
	.extend({ status: statusSchema.optional() });

export const gameQuerySchema = paginationSchema.extend({
	storyId: z.string().uuid().optional(),
	levelId: z.string().uuid().optional(),
});
export const gameParamsSchema = z.object({ gameId: z.string().uuid() });
export const gameQuestionSchema = z.object({
	questionOrder: z.number().int().min(1),
	prompt: z.string().trim().min(1),
	options: z.array(z.string().max(300)).min(2),
	correctAnswer: z.string().min(1).max(300),
	points: z.number().int().min(1).max(100),
});
export const createGameSchema = z.object({
	storyId: z.string().uuid(),
	levelId: z.string().uuid(),
	title: z.string().trim().min(1).max(180),
	description: z.string().max(1000).optional(),
	instructions: z.string().max(2000).optional(),
	gameType: z.string().trim().min(1).max(50),
	maxScore: z.number().int().min(1).max(10000),
	questions: z.array(gameQuestionSchema).min(1),
});
export const updateGameSchema = createGameSchema
	.partial()
	.extend({ status: statusSchema.optional() });

export const createAttemptSchema = z.object({
	gameId: z.string().uuid(),
	score: z.number().int().min(0),
	answers: z.array(answerSchema).optional(),
	completedAt: z.string().datetime().optional(),
});
export const progressQuerySchema = paginationSchema.extend({
	storyId: z.string().uuid().optional(),
	levelId: z.string().uuid().optional(),
});

export type StoryQuery = z.infer<typeof storyQuerySchema>;
export type CreateStory = z.infer<typeof createStorySchema>;
export type UpdateStory = z.infer<typeof updateStorySchema>;
export type CreateLevel = z.infer<typeof createLevelSchema>;
export type UpdateLevel = z.infer<typeof updateLevelSchema>;
export type LevelQuery = z.infer<typeof levelQuerySchema>;
export type GameQuery = z.infer<typeof gameQuerySchema>;
export type CreateGame = z.infer<typeof createGameSchema>;
export type UpdateGame = z.infer<typeof updateGameSchema>;
export type CreateAttempt = z.infer<typeof createAttemptSchema>;
export type ProgressQuery = z.infer<typeof progressQuerySchema>;
