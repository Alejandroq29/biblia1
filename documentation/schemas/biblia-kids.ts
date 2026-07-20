import { z } from 'zod';

import { registry } from '@/documentation/registry';
import { ErrorResponseSchema } from '@/documentation/responses/common';

const id = (name: string) => ({
	name,
	in: 'path' as const,
	required: true,
	schema: { type: 'string' as const, format: 'uuid' },
});
const pagination = [
	{ name: 'page', in: 'query' as const, schema: { type: 'integer' as const, minimum: 1 } },
	{
		name: 'pageSize',
		in: 'query' as const,
		schema: { type: 'integer' as const, minimum: 1, maximum: 100 },
	},
];
const errorResponses = {
	400: {
		description: 'Solicitud inválida',
		content: { 'application/json': { schema: ErrorResponseSchema } },
	},
	401: {
		description: 'No autenticado',
		content: { 'application/json': { schema: ErrorResponseSchema } },
	},
	403: {
		description: 'Permisos insuficientes',
		content: { 'application/json': { schema: ErrorResponseSchema } },
	},
	404: {
		description: 'Recurso no encontrado',
		content: { 'application/json': { schema: ErrorResponseSchema } },
	},
	409: {
		description: 'Conflicto',
		content: { 'application/json': { schema: ErrorResponseSchema } },
	},
};
const security = [{ cookieAuth: [] }];

const LevelSchema = z.object({
	id: z.string().uuid(),
	code: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	sortOrder: z.number(),
	status: z.enum(['ACTIVE', 'INACTIVE']),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
const StorySchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	slug: z.string(),
	summary: z.string().nullable(),
	content: z.string(),
	minAge: z.number(),
	maxAge: z.number(),
	status: z.enum(['ACTIVE', 'INACTIVE']),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	levels: z.array(z.object({ level: LevelSchema })),
});
const QuestionSchema = z.object({
	id: z.string().uuid(),
	questionOrder: z.number(),
	prompt: z.string(),
	options: z.array(z.string()).nullable(),
	points: z.number(),
});
const GameSchema = z.object({
	id: z.string().uuid(),
	storyId: z.string().uuid(),
	levelId: z.string().uuid(),
	title: z.string(),
	description: z.string().nullable(),
	instructions: z.string().nullable(),
	gameType: z.string(),
	maxScore: z.number(),
	status: z.enum(['ACTIVE', 'INACTIVE']),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	questions: z.array(QuestionSchema),
});
const AttemptSchema = z.object({
	id: z.string().uuid(),
	gameId: z.string().uuid(),
	storyId: z.string().uuid(),
	levelId: z.string().uuid(),
	score: z.number(),
	maxScore: z.number(),
	completedAt: z.string().datetime(),
	createdAt: z.string().datetime(),
});
const ProgressSchema = z.object({
	userId: z.string().uuid(),
	storyId: z.string().uuid(),
	levelId: z.string().uuid(),
	bestScore: z.number(),
	attemptsCount: z.number(),
	completed: z.boolean(),
	lastPlayedAt: z.string().datetime().nullable(),
	story: z.object({ id: z.string().uuid(), title: z.string() }),
	level: z.object({ id: z.string().uuid(), name: z.string(), sortOrder: z.number() }),
});
const storyRef = { $ref: '#/components/schemas/BibliaKidsStory' };
const levelRef = { $ref: '#/components/schemas/BibliaKidsLevel' };
const gameRef = { $ref: '#/components/schemas/BibliaKidsGame' };
const attemptRef = { $ref: '#/components/schemas/BibliaKidsAttempt' };
const progressRef = { $ref: '#/components/schemas/BibliaKidsProgress' };
const list = (schema: typeof storyRef) => ({
	type: 'object' as const,
	properties: {
		data: { type: 'array' as const, items: schema },
		meta: {
			type: 'object' as const,
			properties: {
				page: { type: 'integer' as const },
				pageSize: { type: 'integer' as const },
				total: { type: 'integer' as const },
				totalPages: { type: 'integer' as const },
			},
			required: ['page', 'pageSize', 'total', 'totalPages'],
		},
	},
	required: ['data', 'meta'],
});
const data = (schema: typeof storyRef) => ({
	type: 'object' as const,
	properties: { data: schema },
	required: ['data'],
});

registry.register('BibliaKidsLevel', LevelSchema);
registry.register('BibliaKidsStory', StorySchema);
registry.register('BibliaKidsGame', GameSchema);
registry.register('BibliaKidsAttempt', AttemptSchema);
registry.register('BibliaKidsProgress', ProgressSchema);

registry.registerPath({
	method: 'get',
	path: '/biblia-kids/stories',
	tags: ['Biblia Kids'],
	security,
	parameters: pagination,
	responses: {
		200: {
			description: 'Historias activas',
			content: { 'application/json': { schema: list(storyRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/stories',
	tags: ['Biblia Kids'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: storyRef } } },
	responses: {
		201: {
			description: 'Historia creada',
			content: { 'application/json': { schema: data(storyRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/biblia-kids/stories/{storyId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('storyId')],
	responses: {
		200: { description: 'Historia', content: { 'application/json': { schema: data(storyRef) } } },
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/biblia-kids/stories/{storyId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('storyId')],
	responses: {
		200: {
			description: 'Historia actualizada',
			content: { 'application/json': { schema: data(storyRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/stories/{storyId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('storyId')],
	responses: { 204: { description: 'Historia desactivada' }, ...errorResponses },
});
registry.registerPath({
	method: 'get',
	path: '/biblia-kids/levels',
	tags: ['Biblia Kids'],
	security,
	parameters: pagination,
	responses: {
		200: {
			description: 'Niveles activos',
			content: { 'application/json': { schema: list(levelRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/levels',
	tags: ['Biblia Kids'],
	security,
	responses: {
		201: {
			description: 'Nivel creado',
			content: { 'application/json': { schema: data(levelRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/biblia-kids/levels/{levelId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('levelId')],
	responses: {
		200: {
			description: 'Nivel actualizado',
			content: { 'application/json': { schema: data(levelRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/levels/{levelId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('levelId')],
	responses: { 204: { description: 'Nivel desactivado' }, ...errorResponses },
});
registry.registerPath({
	method: 'get',
	path: '/biblia-kids/games',
	tags: ['Biblia Kids'],
	security,
	parameters: pagination,
	responses: {
		200: {
			description: 'Juegos activos',
			content: { 'application/json': { schema: list(gameRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/games',
	tags: ['Biblia Kids'],
	security,
	responses: {
		201: {
			description: 'Juego creado',
			content: { 'application/json': { schema: data(gameRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/biblia-kids/games/{gameId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('gameId')],
	responses: {
		200: {
			description: 'Juego actualizado',
			content: { 'application/json': { schema: data(gameRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/games/{gameId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('gameId')],
	responses: { 204: { description: 'Juego desactivado' }, ...errorResponses },
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/attempts',
	tags: ['Biblia Kids'],
	security,
	responses: {
		201: {
			description: 'Intento registrado',
			content: { 'application/json': { schema: data(attemptRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/biblia-kids/progress',
	tags: ['Biblia Kids'],
	security,
	parameters: pagination,
	responses: {
		200: {
			description: 'Progreso del participante',
			content: { 'application/json': { schema: list(progressRef) } },
		},
		...errorResponses,
	},
});
