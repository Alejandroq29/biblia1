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

const BookSchema = z.object({
	id: z.string().uuid(),
	code: z.string(),
	title: z.string(),
	testament: z.string().nullable(),
	summary: z.string().nullable(),
	status: z.enum(['ACTIVE', 'INACTIVE']),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
const ChapterSchema = z.object({
	id: z.string().uuid(),
	bookId: z.string().uuid(),
	number: z.number(),
	title: z.string().nullable(),
	summary: z.string().nullable(),
});
const VerseSchema = z.object({
	id: z.string().uuid(),
	chapterId: z.string().uuid(),
	number: z.number(),
	text: z.string(),
	notes: z.string().nullable(),
});
const FavoriteSchema = z.object({
	id: z.string().uuid(),
	resource: z.string(),
	resourceId: z.string().uuid(),
	createdAt: z.string().datetime(),
});
const ReadingPlanSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	name: z.string(),
	items: z.unknown(),
	startDate: z.string().nullable(),
	endDate: z.string().nullable(),
	status: z.enum(['ACTIVE', 'INACTIVE']),
	createdAt: z.string().datetime(),
});

registry.register('BibliaKidsBook', BookSchema);
registry.register('BibliaKidsChapter', ChapterSchema);
registry.register('BibliaKidsVerse', VerseSchema);
registry.register('BibliaKidsFavorite', FavoriteSchema);
registry.register('BibliaKidsReadingPlan', ReadingPlanSchema);

const bookRef = { $ref: '#/components/schemas/BibliaKidsBook' };
const chapterRef = { $ref: '#/components/schemas/BibliaKidsChapter' };
const verseRef = { $ref: '#/components/schemas/BibliaKidsVerse' };
const favoriteRef = { $ref: '#/components/schemas/BibliaKidsFavorite' };
const readingPlanRef = { $ref: '#/components/schemas/BibliaKidsReadingPlan' };

const StoryInputSchema = z.object({
	title: z.string().min(1).max(180),
	slug: z
		.string()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
		.max(200),
	summary: z.string().max(1000).optional(),
	content: z.string().min(1),
	minAge: z.number().int().min(6).max(18),
	maxAge: z.number().int().min(6).max(18),
	levelIds: z.array(z.string().uuid()).min(1),
});
const LevelInputSchema = z.object({
	code: z
		.string()
		.regex(/^[a-z0-9-]+$/u)
		.max(80),
	name: z.string().min(1).max(120),
	description: z.string().max(1000).optional(),
	sortOrder: z.number().int().min(0),
});
const GameQuestionInputSchema = z.object({
	questionOrder: z.number().int().min(1),
	prompt: z.string().min(1),
	options: z.array(z.string().max(300)).min(2),
	correctAnswer: z.string().min(1).max(300),
	points: z.number().int().min(1).max(100),
});
const GameInputSchema = z.object({
	storyId: z.string().uuid(),
	levelId: z.string().uuid(),
	title: z.string().min(1).max(180),
	description: z.string().max(1000).optional(),
	instructions: z.string().max(2000).optional(),
	gameType: z.string().min(1).max(50),
	maxScore: z.number().int().min(1).max(10000),
	questions: z.array(GameQuestionInputSchema).min(1),
});
const BookInputSchema = z.object({
	code: z.string().max(80),
	title: z.string().min(1).max(250),
	testament: z.string().max(20).optional(),
	summary: z.string().max(2000).optional(),
});
const ChapterInputSchema = z.object({
	bookId: z.string().uuid(),
	number: z.number().int().min(1),
	title: z.string().max(250).optional(),
	summary: z.string().max(2000).optional(),
});
const VerseInputSchema = z.object({
	chapterId: z.string().uuid(),
	number: z.number().int().min(1),
	text: z.string().min(1),
	notes: z.string().max(2000).optional(),
});
const ReadingPlanInputSchema = z.object({
	name: z.string().min(1).max(180),
	items: z.unknown(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
});

registry.register('BibliaKidsStoryInput', StoryInputSchema);
registry.register('BibliaKidsLevelInput', LevelInputSchema);
registry.register('BibliaKidsGameInput', GameInputSchema);
registry.register('BibliaKidsBookInput', BookInputSchema);
registry.register('BibliaKidsChapterInput', ChapterInputSchema);
registry.register('BibliaKidsVerseInput', VerseInputSchema);
registry.register('BibliaKidsReadingPlanInput', ReadingPlanInputSchema);

const storyInputRef = { $ref: '#/components/schemas/BibliaKidsStoryInput' };
const levelInputRef = { $ref: '#/components/schemas/BibliaKidsLevelInput' };
const gameInputRef = { $ref: '#/components/schemas/BibliaKidsGameInput' };
const bookInputRef = { $ref: '#/components/schemas/BibliaKidsBookInput' };
const chapterInputRef = { $ref: '#/components/schemas/BibliaKidsChapterInput' };
const verseInputRef = { $ref: '#/components/schemas/BibliaKidsVerseInput' };
const readingPlanInputRef = { $ref: '#/components/schemas/BibliaKidsReadingPlanInput' };

registry.registerPath({
	method: 'get',
	path: '/biblia-kids/books',
	tags: ['Biblia Kids'],
	security,
	parameters: pagination,
	responses: {
		200: { description: 'Libros', content: { 'application/json': { schema: list(bookRef) } } },
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/books',
	tags: ['Biblia Kids'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: bookInputRef } } },
	responses: {
		201: {
			description: 'Libro creado',
			content: { 'application/json': { schema: data(bookRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/biblia-kids/books/{bookId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('bookId')],
	requestBody: { required: true, content: { 'application/json': { schema: bookInputRef } } },
	responses: {
		200: { description: 'Libro', content: { 'application/json': { schema: data(bookRef) } } },
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/biblia-kids/books/{bookId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('bookId')],
	responses: {
		200: {
			description: 'Libro actualizado',
			content: { 'application/json': { schema: data(bookRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/books/{bookId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('bookId')],
	responses: { 204: { description: 'Libro desactivado' }, ...errorResponses },
});

registry.registerPath({
	method: 'get',
	path: '/biblia-kids/chapters',
	tags: ['Biblia Kids'],
	security,
	parameters: [{ name: 'bookId', in: 'query', schema: { type: 'string', format: 'uuid' } }],
	responses: {
		200: {
			description: 'Capítulos',
			content: { 'application/json': { schema: { type: 'array', items: chapterRef } } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/chapters',
	tags: ['Biblia Kids'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: chapterInputRef } } },
	responses: {
		201: {
			description: 'Capítulo creado',
			content: { 'application/json': { schema: data(chapterRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/biblia-kids/chapters/{chapterId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('chapterId')],
	requestBody: { required: true, content: { 'application/json': { schema: chapterInputRef } } },
	responses: {
		200: {
			description: 'Capítulo actualizado',
			content: { 'application/json': { schema: data(chapterRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/chapters/{chapterId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('chapterId')],
	responses: { 204: { description: 'Capítulo desactivado' }, ...errorResponses },
});

registry.registerPath({
	method: 'get',
	path: '/biblia-kids/verses',
	tags: ['Biblia Kids'],
	security,
	parameters: [{ name: 'chapterId', in: 'query', schema: { type: 'string', format: 'uuid' } }],
	responses: {
		200: {
			description: 'Versículos',
			content: { 'application/json': { schema: { type: 'array', items: verseRef } } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/verses',
	tags: ['Biblia Kids'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: verseInputRef } } },
	responses: {
		201: {
			description: 'Versículo creado',
			content: { 'application/json': { schema: data(verseRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/biblia-kids/verses/{verseId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('verseId')],
	requestBody: { required: true, content: { 'application/json': { schema: verseInputRef } } },
	responses: {
		200: {
			description: 'Versículo actualizado',
			content: { 'application/json': { schema: data(verseRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/verses/{verseId}',
	tags: ['Biblia Kids'],
	security,
	parameters: [id('verseId')],
	responses: { 204: { description: 'Versículo desactivado' }, ...errorResponses },
});

registry.registerPath({
	method: 'get',
	path: '/biblia-kids/favorites',
	tags: ['Biblia Kids'],
	security,
	responses: {
		200: {
			description: 'Favoritos del usuario',
			content: { 'application/json': { schema: { type: 'array', items: favoriteRef } } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/favorites',
	tags: ['Biblia Kids'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: favoriteRef } } },
	responses: {
		201: {
			description: 'Favorito creado',
			content: { 'application/json': { schema: data(favoriteRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/favorites',
	tags: ['Biblia Kids'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: favoriteRef } } },
	responses: { 204: { description: 'Favorito eliminado' }, ...errorResponses },
});

registry.registerPath({
	method: 'get',
	path: '/biblia-kids/reading-plans',
	tags: ['Biblia Kids'],
	security,
	responses: {
		200: {
			description: 'Planes de lectura del usuario',
			content: { 'application/json': { schema: { type: 'array', items: readingPlanRef } } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/biblia-kids/reading-plans',
	tags: ['Biblia Kids'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: readingPlanRef } } },
	responses: {
		201: {
			description: 'Plan de lectura creado',
			content: { 'application/json': { schema: data(readingPlanRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/biblia-kids/reading-plans',
	tags: ['Biblia Kids'],
	security,
	parameters: [{ name: 'planId', in: 'query', schema: { type: 'string', format: 'uuid' } }],
	responses: { 204: { description: 'Plan eliminado' }, ...errorResponses },
});

// Rutas REST públicas del dominio. Se mantienen separadas de las rutas heredadas
// bajo /biblia-kids para que la especificación describa el contrato consumido por clientes.
registry.registerPath({
	method: 'get',
	path: '/historias',
	tags: ['Historias'],
	security,
	parameters: [
		...pagination,
		{ name: 'search', in: 'query', schema: { type: 'string', maxLength: 180 } },
		{ name: 'minAge', in: 'query', schema: { type: 'integer', minimum: 6, maximum: 18 } },
		{ name: 'maxAge', in: 'query', schema: { type: 'integer', minimum: 6, maximum: 18 } },
	],
	responses: {
		200: {
			description: 'Historias activas paginadas',
			content: { 'application/json': { schema: list(storyRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/historias',
	tags: ['Historias'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: storyInputRef } } },
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
	path: '/historias/{storyId}',
	tags: ['Historias'],
	security,
	parameters: [id('storyId')],
	responses: {
		200: { description: 'Historia', content: { 'application/json': { schema: data(storyRef) } } },
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/historias/{storyId}',
	tags: ['Historias'],
	security,
	parameters: [id('storyId')],
	requestBody: { required: true, content: { 'application/json': { schema: storyInputRef } } },
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
	path: '/historias/{storyId}',
	tags: ['Historias'],
	security,
	parameters: [id('storyId')],
	responses: { 204: { description: 'Historia desactivada' }, ...errorResponses },
});

const registerContentResource = (
	path: string,
	tag: string,
	parameter: string,
	input: typeof levelInputRef,
	output: typeof levelRef,
	listParameters: Array<{
		name: string;
		in: 'query';
		schema: Record<string, unknown>;
	}> = pagination,
) => {
	registry.registerPath({
		method: 'get',
		path,
		tags: [tag],
		security,
		parameters: listParameters,
		responses: {
			200: {
				description: `Listado de ${tag.toLowerCase()}`,
				content: { 'application/json': { schema: list(output) } },
			},
			...errorResponses,
		},
	});
	registry.registerPath({
		method: 'post',
		path,
		tags: [tag],
		security,
		requestBody: { required: true, content: { 'application/json': { schema: input } } },
		responses: {
			201: {
				description: `${tag} creado`,
				content: { 'application/json': { schema: data(output) } },
			},
			...errorResponses,
		},
	});
	registry.registerPath({
		method: 'get',
		path: `${path}/{${parameter}}`,
		tags: [tag],
		security,
		parameters: [id(parameter)],
		responses: {
			200: { description: tag, content: { 'application/json': { schema: data(output) } } },
			...errorResponses,
		},
	});
	registry.registerPath({
		method: 'patch',
		path: `${path}/{${parameter}}`,
		tags: [tag],
		security,
		parameters: [id(parameter)],
		requestBody: { required: true, content: { 'application/json': { schema: input } } },
		responses: {
			200: {
				description: `${tag} actualizado`,
				content: { 'application/json': { schema: data(output) } },
			},
			...errorResponses,
		},
	});
	registry.registerPath({
		method: 'delete',
		path: `${path}/{${parameter}}`,
		tags: [tag],
		security,
		parameters: [id(parameter)],
		responses: { 204: { description: `${tag} desactivado` }, ...errorResponses },
	});
};

registerContentResource('/niveles', 'Niveles', 'levelId', levelInputRef, levelRef);
registerContentResource('/juegos', 'Juegos', 'gameId', gameInputRef, gameRef, [
	...pagination,
	{ name: 'storyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
	{ name: 'levelId', in: 'query', schema: { type: 'string', format: 'uuid' } },
]);

registry.registerPath({
	method: 'get',
	path: '/libros',
	tags: ['Libros'],
	security,
	parameters: [
		...pagination,
		{ name: 'search', in: 'query', schema: { type: 'string', maxLength: 250 } },
	],
	responses: {
		200: {
			description: 'Libros activos paginados',
			content: { 'application/json': { schema: list(bookRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/libros/{bookId}',
	tags: ['Libros'],
	security,
	parameters: [id('bookId')],
	responses: {
		200: { description: 'Libro', content: { 'application/json': { schema: data(bookRef) } } },
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/libros/{bookId}/capitulos',
	tags: ['Capítulos'],
	security,
	parameters: [id('bookId')],
	responses: {
		200: {
			description: 'Capítulos del libro',
			content: { 'application/json': { schema: data({ type: 'array', items: chapterRef }) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/libros/{bookId}/capitulos/{chapterId}',
	tags: ['Capítulos'],
	security,
	parameters: [id('bookId'), id('chapterId')],
	responses: {
		200: { description: 'Capítulo', content: { 'application/json': { schema: data(chapterRef) } } },
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/capitulos/{chapterId}/versiculos',
	tags: ['Versículos'],
	security,
	parameters: [id('chapterId')],
	responses: {
		200: {
			description: 'Versículos del capítulo',
			content: { 'application/json': { schema: data({ type: 'array', items: verseRef }) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/capitulos/{chapterId}/versiculos/{verseId}',
	tags: ['Versículos'],
	security,
	parameters: [id('chapterId'), id('verseId')],
	responses: {
		200: { description: 'Versículo', content: { 'application/json': { schema: data(verseRef) } } },
		...errorResponses,
	},
});

registry.registerPath({
	method: 'get',
	path: '/planes-lectura',
	tags: ['Planes de lectura'],
	security,
	responses: {
		200: {
			description: 'Planes del usuario autenticado',
			content: { 'application/json': { schema: data({ type: 'array', items: readingPlanRef }) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'post',
	path: '/planes-lectura',
	tags: ['Planes de lectura'],
	security,
	requestBody: { required: true, content: { 'application/json': { schema: readingPlanInputRef } } },
	responses: {
		201: {
			description: 'Plan creado',
			content: { 'application/json': { schema: data(readingPlanRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'get',
	path: '/planes-lectura/{planId}',
	tags: ['Planes de lectura'],
	security,
	parameters: [id('planId')],
	responses: {
		200: {
			description: 'Plan de lectura',
			content: { 'application/json': { schema: data(readingPlanRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'patch',
	path: '/planes-lectura/{planId}',
	tags: ['Planes de lectura'],
	security,
	parameters: [id('planId')],
	requestBody: { required: true, content: { 'application/json': { schema: readingPlanInputRef } } },
	responses: {
		200: {
			description: 'Plan actualizado',
			content: { 'application/json': { schema: data(readingPlanRef) } },
		},
		...errorResponses,
	},
});
registry.registerPath({
	method: 'delete',
	path: '/planes-lectura/{planId}',
	tags: ['Planes de lectura'],
	security,
	parameters: [id('planId')],
	responses: { 204: { description: 'Plan desactivado' }, ...errorResponses },
});
