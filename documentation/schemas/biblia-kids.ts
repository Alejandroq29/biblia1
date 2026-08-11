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
const ChapterSchema = z.object({ id: z.string().uuid(), bookId: z.string().uuid(), number: z.number(), title: z.string().nullable(), summary: z.string().nullable() });
const VerseSchema = z.object({ id: z.string().uuid(), chapterId: z.string().uuid(), number: z.number(), text: z.string(), notes: z.string().nullable() });
const FavoriteSchema = z.object({ id: z.string().uuid(), resource: z.string(), resourceId: z.string().uuid(), createdAt: z.string().datetime() });
const ReadingPlanSchema = z.object({ id: z.string().uuid(), userId: z.string().uuid(), name: z.string(), items: z.any(), startDate: z.string().nullable(), endDate: z.string().nullable(), status: z.enum(['ACTIVE', 'INACTIVE']), createdAt: z.string().datetime() });

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

registry.registerPath({ method: 'get', path: '/biblia-kids/books', tags: ['Biblia Kids'], security, parameters: pagination, responses: { 200: { description: 'Libros', content: { 'application/json': { schema: list(bookRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'post', path: '/biblia-kids/books', tags: ['Biblia Kids'], security, requestBody: { required: true, content: { 'application/json': { schema: bookRef } } }, responses: { 201: { description: 'Libro creado', content: { 'application/json': { schema: data(bookRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'get', path: '/biblia-kids/books/{bookId}', tags: ['Biblia Kids'], security, parameters: [id('bookId')], responses: { 200: { description: 'Libro', content: { 'application/json': { schema: data(bookRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'patch', path: '/biblia-kids/books/{bookId}', tags: ['Biblia Kids'], security, parameters: [id('bookId')], responses: { 200: { description: 'Libro actualizado', content: { 'application/json': { schema: data(bookRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'delete', path: '/biblia-kids/books/{bookId}', tags: ['Biblia Kids'], security, parameters: [id('bookId')], responses: { 204: { description: 'Libro desactivado' }, ...errorResponses } });

registry.registerPath({ method: 'get', path: '/biblia-kids/chapters', tags: ['Biblia Kids'], security, parameters: [{ name: 'bookId', in: 'query', schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Capítulos', content: { 'application/json': { schema: { type: 'array', items: chapterRef } } } }, ...errorResponses } });
registry.registerPath({ method: 'post', path: '/biblia-kids/chapters', tags: ['Biblia Kids'], security, requestBody: { required: true, content: { 'application/json': { schema: chapterRef } } }, responses: { 201: { description: 'Capítulo creado', content: { 'application/json': { schema: data(chapterRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'patch', path: '/biblia-kids/chapters/{chapterId}', tags: ['Biblia Kids'], security, parameters: [id('chapterId')], responses: { 200: { description: 'Capítulo actualizado', content: { 'application/json': { schema: data(chapterRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'delete', path: '/biblia-kids/chapters/{chapterId}', tags: ['Biblia Kids'], security, parameters: [id('chapterId')], responses: { 204: { description: 'Capítulo desactivado' }, ...errorResponses } });

registry.registerPath({ method: 'get', path: '/biblia-kids/verses', tags: ['Biblia Kids'], security, parameters: [{ name: 'chapterId', in: 'query', schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Versículos', content: { 'application/json': { schema: { type: 'array', items: verseRef } } } }, ...errorResponses } });
registry.registerPath({ method: 'post', path: '/biblia-kids/verses', tags: ['Biblia Kids'], security, requestBody: { required: true, content: { 'application/json': { schema: verseRef } } }, responses: { 201: { description: 'Versículo creado', content: { 'application/json': { schema: data(verseRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'patch', path: '/biblia-kids/verses/{verseId}', tags: ['Biblia Kids'], security, parameters: [id('verseId')], responses: { 200: { description: 'Versículo actualizado', content: { 'application/json': { schema: data(verseRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'delete', path: '/biblia-kids/verses/{verseId}', tags: ['Biblia Kids'], security, parameters: [id('verseId')], responses: { 204: { description: 'Versículo desactivado' }, ...errorResponses } });

registry.registerPath({ method: 'get', path: '/biblia-kids/favorites', tags: ['Biblia Kids'], security, responses: { 200: { description: 'Favoritos del usuario', content: { 'application/json': { schema: { type: 'array', items: favoriteRef } } } }, ...errorResponses } });
registry.registerPath({ method: 'post', path: '/biblia-kids/favorites', tags: ['Biblia Kids'], security, requestBody: { required: true, content: { 'application/json': { schema: favoriteRef } } }, responses: { 201: { description: 'Favorito creado', content: { 'application/json': { schema: data(favoriteRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'delete', path: '/biblia-kids/favorites', tags: ['Biblia Kids'], security, requestBody: { required: true, content: { 'application/json': { schema: favoriteRef } } }, responses: { 204: { description: 'Favorito eliminado' }, ...errorResponses } });

registry.registerPath({ method: 'get', path: '/biblia-kids/reading-plans', tags: ['Biblia Kids'], security, responses: { 200: { description: 'Planes de lectura del usuario', content: { 'application/json': { schema: { type: 'array', items: readingPlanRef } } } }, ...errorResponses } });
registry.registerPath({ method: 'post', path: '/biblia-kids/reading-plans', tags: ['Biblia Kids'], security, requestBody: { required: true, content: { 'application/json': { schema: readingPlanRef } } }, responses: { 201: { description: 'Plan de lectura creado', content: { 'application/json': { schema: data(readingPlanRef) } } }, ...errorResponses } });
registry.registerPath({ method: 'delete', path: '/biblia-kids/reading-plans', tags: ['Biblia Kids'], security, parameters: [{ name: 'planId', in: 'query', schema: { type: 'string', format: 'uuid' } }], responses: { 204: { description: 'Plan eliminado' }, ...errorResponses } });
