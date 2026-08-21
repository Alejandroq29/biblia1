import type { Prisma } from '@/generated/prisma/client';

import { prisma } from '@/database/client';
import { ConflictError } from '@/errors/conflict-error';
import { NotFoundError } from '@/errors/not-found-error';
import { normalizePagination } from '@/helper/pagination';
import { cacheDelete, cacheDeleteByPrefix, cacheGet, cacheSet } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import type {
	CreateAttempt,
	CreateGame,
	CreateLevel,
	CreateStory,
	GameQuery,
	LevelQuery,
	ProgressQuery,
	StoryQuery,
	UpdateGame,
	UpdateLevel,
	UpdateStory,
} from '@/validations/biblia-kids';

const isUniqueError = (error: unknown): boolean =>
	error instanceof Error &&
	error.name === 'PrismaClientKnownRequestError' &&
	error.message.includes('P2002');

const storySelect = {
	id: true,
	title: true,
	slug: true,
	summary: true,
	content: true,
	minAge: true,
	maxAge: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	levels: { include: { level: true } },
} satisfies Prisma.BibliaStorySelect;

const levelSelect = {
	id: true,
	code: true,
	name: true,
	description: true,
	sortOrder: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.BibliaLevelSelect;

const questionSelect = {
	id: true,
	questionOrder: true,
	prompt: true,
	options: true,
	points: true,
} satisfies Prisma.BibliaGameQuestionSelect;

const gameSelect = {
	id: true,
	storyId: true,
	levelId: true,
	title: true,
	description: true,
	instructions: true,
	gameType: true,
	maxScore: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	questions: { select: questionSelect, orderBy: { questionOrder: 'asc' as const } },
} satisfies Prisma.BibliaGameSelect;

const STORY_CACHE_TTL_SECONDS = 60;
const STORY_LIST_CACHE_PREFIX = 'biblia-kids:stories:list:';
const STORY_CACHE_KEY_PREFIX = 'biblia-kids:stories:';

const buildStoryListCacheKey = (filters: StoryQuery): string => {
	const normalized = {
		page: Number(filters.page ?? 1),
		pageSize: Number(filters.pageSize ?? 20),
		search: filters.search ?? '',
		minAge: filters.minAge ?? '',
		maxAge: filters.maxAge ?? '',
	};
	return `${STORY_LIST_CACHE_PREFIX}${JSON.stringify(normalized)}`;
};

const buildStoryCacheKey = (storyId: string): string => `${STORY_CACHE_KEY_PREFIX}${storyId}`;

export const getStories = async (filters: StoryQuery) => {
	const cacheKey = buildStoryListCacheKey(filters);
	const cached = await cacheGet<{
		data: Array<unknown>;
		meta: { page: number; pageSize: number; total: number; totalPages: number };
	}>(cacheKey);

	if (cached) {
		logger.info(
			{ cacheKey, operation: 'getStories', cacheHit: true },
			'Biblia Kids story list cache hit',
		);
		return cached;
	}

	const start = Date.now();
	const { skip, take, meta } = normalizePagination(filters);
	const where: Prisma.BibliaStoryWhereInput = {
		status: 'ACTIVE',
		deletedAt: null,
		...(filters.search
			? {
					OR: [
						{ title: { contains: filters.search, mode: 'insensitive' } },
						{ summary: { contains: filters.search, mode: 'insensitive' } },
					],
				}
			: {}),
		...(filters.minAge ? { maxAge: { gte: filters.minAge } } : {}),
		...(filters.maxAge ? { minAge: { lte: filters.maxAge } } : {}),
	};
	const [stories, total] = await Promise.all([
		prisma.bibliaStory.findMany({
			where,
			select: storySelect,
			skip,
			take,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.bibliaStory.count({ where }),
	]);

	const response = { data: stories, meta: meta(total) };
	await cacheSet(cacheKey, response, STORY_CACHE_TTL_SECONDS);
	logger.info(
		{
			cacheKey,
			durationMs: Date.now() - start,
			operation: 'getStories',
			resultCount: stories.length,
		},
		'Biblia Kids story list generated and cached',
	);

	return response;
};

export const getStory = async (storyId: string) => {
	const cacheKey = buildStoryCacheKey(storyId);
	const cached = await cacheGet<typeof storySelect>(cacheKey);

	if (cached) {
		logger.info({ cacheKey, operation: 'getStory', cacheHit: true }, 'Biblia Kids story cache hit');
		return cached;
	}

	const start = Date.now();
	const story = await prisma.bibliaStory.findFirst({
		where: { id: storyId, status: 'ACTIVE', deletedAt: null },
		select: storySelect,
	});

	if (!story) {
		throw new NotFoundError('La historia bíblica solicitada no existe.');
	}

	await cacheSet(cacheKey, story, STORY_CACHE_TTL_SECONDS);
	logger.info(
		{ cacheKey, durationMs: Date.now() - start, operation: 'getStory' },
		'Biblia Kids story retrieved and cached',
	);

	return story;
};

export const createStory = async (data: CreateStory) => {
	if (data.minAge > data.maxAge) {
		throw new ConflictError('La edad mínima no puede superar la edad máxima.');
	}

	try {
		const story = await prisma.$transaction(async transaction => {
			const levels = await transaction.bibliaLevel.findMany({
				where: { id: { in: data.levelIds }, status: 'ACTIVE', deletedAt: null },
				select: { id: true },
			});
			if (levels.length !== new Set(data.levelIds).size) {
				throw new NotFoundError('Uno o más niveles no existen o están inactivos.');
			}
			return transaction.bibliaStory.create({
				data: {
					title: data.title,
					slug: data.slug,
					summary: data.summary,
					content: data.content,
					minAge: data.minAge,
					maxAge: data.maxAge,
					levels: { create: data.levelIds.map(levelId => ({ levelId })) },
				},
				select: storySelect,
			});
		});

		await cacheDeleteByPrefix(STORY_LIST_CACHE_PREFIX);
		return story;
	} catch (error) {
		if (isUniqueError(error)) {
			throw new ConflictError('Ya existe una historia con ese slug.');
		}
		throw error;
	}
};

export const updateStory = async (storyId: string, data: UpdateStory) => {
	const current = await prisma.bibliaStory.findFirst({ where: { id: storyId, deletedAt: null } });
	if (!current) throw new NotFoundError('La historia bíblica solicitada no existe.');
	if (data.minAge !== undefined && data.maxAge !== undefined && data.minAge > data.maxAge) {
		throw new ConflictError('La edad mínima no puede superar la edad máxima.');
	}

	try {
		const story = await prisma.$transaction(async transaction => {
			if (data.levelIds) {
				const levels = await transaction.bibliaLevel.findMany({
					where: { id: { in: data.levelIds }, status: 'ACTIVE', deletedAt: null },
					select: { id: true },
				});
				if (levels.length !== new Set(data.levelIds).size) {
					throw new NotFoundError('Uno o más niveles no existen o están inactivos.');
				}
				await transaction.bibliaStoryLevel.deleteMany({ where: { storyId } });
				await transaction.bibliaStoryLevel.createMany({
					data: data.levelIds.map(levelId => ({ storyId, levelId })),
				});
			}
			return transaction.bibliaStory.update({
				where: { id: storyId },
				data: {
					...(data.title !== undefined && { title: data.title }),
					...(data.slug !== undefined && { slug: data.slug }),
					...(data.summary !== undefined && { summary: data.summary }),
					...(data.content !== undefined && { content: data.content }),
					...(data.minAge !== undefined && { minAge: data.minAge }),
					...(data.maxAge !== undefined && { maxAge: data.maxAge }),
					...(data.status !== undefined && { status: data.status }),
				},
				select: storySelect,
			});
		});

		await cacheDeleteByPrefix(STORY_LIST_CACHE_PREFIX);
		await cacheDelete(buildStoryCacheKey(storyId));
		return story;
	} catch (error) {
		if (isUniqueError(error)) throw new ConflictError('Ya existe una historia con ese slug.');
		throw error;
	}
};

export const deactivateStory = async (storyId: string): Promise<void> => {
	const result = await prisma.bibliaStory.updateMany({
		where: { id: storyId, deletedAt: null },
		data: { status: 'INACTIVE', deletedAt: new Date() },
	});
	if (result.count === 0) throw new NotFoundError('La historia bíblica solicitada no existe.');
	await cacheDeleteByPrefix(STORY_LIST_CACHE_PREFIX);
	await cacheDelete(buildStoryCacheKey(storyId));
};

export const getLevel = async (levelId: string) => {
	const level = await prisma.bibliaLevel.findFirst({
		where: { id: levelId, status: 'ACTIVE', deletedAt: null },
		select: levelSelect,
	});

	if (!level) {
		throw new NotFoundError('El nivel solicitado no existe.');
	}

	return level;
};

export const getLevels = async (filters: LevelQuery) => {
	const { skip, take, meta } = normalizePagination(filters);
	const where = { status: 'ACTIVE' as const, deletedAt: null };
	const [levels, total] = await Promise.all([
		prisma.bibliaLevel.findMany({
			where,
			select: levelSelect,
			skip,
			take,
			orderBy: { sortOrder: 'asc' },
		}),
		prisma.bibliaLevel.count({ where }),
	]);
	return { data: levels, meta: meta(total) };
};

export const createLevel = async (data: CreateLevel) => {
	try {
		return await prisma.bibliaLevel.create({ data, select: levelSelect });
	} catch (error) {
		if (isUniqueError(error)) throw new ConflictError('Ya existe un nivel con ese código.');
		throw error;
	}
};

export const updateLevel = async (levelId: string, data: UpdateLevel) => {
	const current = await prisma.bibliaLevel.findFirst({ where: { id: levelId, deletedAt: null } });
	if (!current) throw new NotFoundError('El nivel solicitado no existe.');
	try {
		return await prisma.bibliaLevel.update({ where: { id: levelId }, data, select: levelSelect });
	} catch (error) {
		if (isUniqueError(error)) throw new ConflictError('Ya existe un nivel con ese código.');
		throw error;
	}
};

export const deactivateLevel = async (levelId: string): Promise<void> => {
	const result = await prisma.bibliaLevel.updateMany({
		where: { id: levelId, deletedAt: null },
		data: { status: 'INACTIVE', deletedAt: new Date() },
	});
	if (result.count === 0) throw new NotFoundError('El nivel solicitado no existe.');
};

export const getGame = async (gameId: string) => {
	const game = await prisma.bibliaGame.findFirst({
		where: { id: gameId, status: 'ACTIVE', deletedAt: null },
		select: gameSelect,
	});

	if (!game) {
		throw new NotFoundError('El juego solicitado no existe.');
	}

	return game;
};

export const getGames = async (filters: GameQuery) => {
	const { skip, take, meta } = normalizePagination(filters);
	const where: Prisma.BibliaGameWhereInput = {
		status: 'ACTIVE',
		deletedAt: null,
		storyId: filters.storyId,
		levelId: filters.levelId,
	};
	const [games, total] = await Promise.all([
		prisma.bibliaGame.findMany({
			where,
			select: gameSelect,
			skip,
			take,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.bibliaGame.count({ where }),
	]);
	return { data: games, meta: meta(total) };
};

const assertReferences = async (storyId: string, levelId: string): Promise<void> => {
	const [story, level, relation] = await Promise.all([
		prisma.bibliaStory.findFirst({
			where: { id: storyId, status: 'ACTIVE', deletedAt: null },
			select: { id: true },
		}),
		prisma.bibliaLevel.findFirst({
			where: { id: levelId, status: 'ACTIVE', deletedAt: null },
			select: { id: true },
		}),
		prisma.bibliaStoryLevel.findUnique({ where: { storyId_levelId: { storyId, levelId } } }),
	]);
	if (!story || !level || !relation)
		throw new NotFoundError('La historia y el nivel deben existir y estar asociados.');
};

export const createGame = async (data: CreateGame) => {
	await assertReferences(data.storyId, data.levelId);
	return prisma.bibliaGame.create({
		data: { ...data, questions: { create: data.questions } },
		select: gameSelect,
	});
};

export const updateGame = async (gameId: string, data: UpdateGame) => {
	const current = await prisma.bibliaGame.findFirst({ where: { id: gameId, deletedAt: null } });
	if (!current) throw new NotFoundError('El juego solicitado no existe.');
	const storyId = data.storyId ?? current.storyId;
	const levelId = data.levelId ?? current.levelId;
	await assertReferences(storyId, levelId);
	return prisma.$transaction(async transaction => {
		if (data.questions) await transaction.bibliaGameQuestion.deleteMany({ where: { gameId } });
		return transaction.bibliaGame.update({
			where: { id: gameId },
			data: {
				storyId,
				levelId,
				...(data.title !== undefined && { title: data.title }),
				...(data.description !== undefined && { description: data.description }),
				...(data.instructions !== undefined && { instructions: data.instructions }),
				...(data.gameType !== undefined && { gameType: data.gameType }),
				...(data.maxScore !== undefined && { maxScore: data.maxScore }),
				...(data.status !== undefined && { status: data.status }),
				...(data.questions && { questions: { create: data.questions } }),
			},
			select: gameSelect,
		});
	});
};

export const deactivateGame = async (gameId: string): Promise<void> => {
	const result = await prisma.bibliaGame.updateMany({
		where: { id: gameId, deletedAt: null },
		data: { status: 'INACTIVE', deletedAt: new Date() },
	});
	if (result.count === 0) throw new NotFoundError('El juego solicitado no existe.');
};

export const createAttempt = async (userId: string, data: CreateAttempt) => {
	const game = await prisma.bibliaGame.findFirst({
		where: { id: data.gameId, status: 'ACTIVE', deletedAt: null },
		select: { id: true, storyId: true, levelId: true, maxScore: true },
	});
	if (!game) throw new NotFoundError('El juego solicitado no existe.');
	if (data.score > game.maxScore)
		throw new ConflictError('El puntaje no puede superar el puntaje máximo del juego.');
	return prisma.$transaction(async transaction => {
		const attempt = await transaction.bibliaGameAttempt.create({
			data: {
				userId,
				gameId: game.id,
				storyId: game.storyId,
				levelId: game.levelId,
				score: data.score,
				maxScore: game.maxScore,
				answers: data.answers,
				completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
			},
			select: {
				id: true,
				gameId: true,
				storyId: true,
				levelId: true,
				score: true,
				maxScore: true,
				completedAt: true,
				createdAt: true,
			},
		});
		await transaction.bibliaProgress.upsert({
			where: { userId_storyId_levelId: { userId, storyId: game.storyId, levelId: game.levelId } },
			create: {
				userId,
				storyId: game.storyId,
				levelId: game.levelId,
				bestScore: data.score,
				attemptsCount: 1,
				completed: true,
				lastPlayedAt: attempt.completedAt,
			},
			update: {
				bestScore: { set: data.score },
				attemptsCount: { increment: 1 },
				completed: true,
				lastPlayedAt: attempt.completedAt,
			},
		});
		return attempt;
	});
};

export const getProgress = async (userId: string, filters: ProgressQuery) => {
	const { skip, take, meta } = normalizePagination(filters);
	const where = { userId, storyId: filters.storyId, levelId: filters.levelId };
	const [progress, total] = await Promise.all([
		prisma.bibliaProgress.findMany({
			where,
			skip,
			take,
			orderBy: { updatedAt: 'desc' },
			include: {
				story: { select: { id: true, title: true } },
				level: { select: { id: true, name: true, sortOrder: true } },
			},
		}),
		prisma.bibliaProgress.count({ where }),
	]);
	return { data: progress, meta: meta(total) };
};

// --- Books / Chapters / Verses ---
const BOOK_LIST_CACHE_PREFIX = 'biblia-kids:books:list:';
const BOOK_CACHE_KEY_PREFIX = 'biblia-kids:books:';
const BOOK_CACHE_TTL_SECONDS = 60;

const buildBookListCacheKey = (filters: { page?: number; pageSize?: number; search?: string }) => {
	const normalized = {
		page: Number(filters.page ?? 1),
		pageSize: Number(filters.pageSize ?? 20),
		search: filters.search ?? '',
	};
	return `${BOOK_LIST_CACHE_PREFIX}${JSON.stringify(normalized)}`;
};

const buildBookCacheKey = (bookId: string) => `${BOOK_CACHE_KEY_PREFIX}${bookId}`;

export const getBooks = async (filters: { page?: number; pageSize?: number; search?: string }) => {
	const cacheKey = buildBookListCacheKey(filters);
	const cached = await cacheGet<{
		data: Array<unknown>;
		meta: { page: number; pageSize: number; total: number; totalPages: number };
	}>(cacheKey);
	if (cached) return cached;

	const { skip, take, meta } = normalizePagination(filters);
	const where: Prisma.BibliaBookWhereInput = {
		status: 'ACTIVE',
		deletedAt: null,
		...(filters.search ? { title: { contains: filters.search, mode: 'insensitive' } } : {}),
	};
	const [books, total] = await Promise.all([
		prisma.bibliaBook.findMany({
			where,
			skip,
			take,
			orderBy: { title: 'asc' },
			select: {
				id: true,
				code: true,
				title: true,
				testament: true,
				summary: true,
				createdAt: true,
			},
		}),
		prisma.bibliaBook.count({ where }),
	]);
	const response = { data: books, meta: meta(total) };
	await cacheSet(cacheKey, response, BOOK_CACHE_TTL_SECONDS);
	return response;
};

export const getBook = async (bookId: string) => {
	const cacheKey = buildBookCacheKey(bookId);
	const cached = await cacheGet(cacheKey);
	if (cached) return cached;
	const book = await prisma.bibliaBook.findFirst({
		where: { id: bookId, status: 'ACTIVE', deletedAt: null },
		select: { id: true, code: true, title: true, testament: true, summary: true, createdAt: true },
	});
	if (!book) throw new NotFoundError('El libro solicitado no existe.');
	await cacheSet(cacheKey, book, BOOK_CACHE_TTL_SECONDS);
	return book;
};

export const createBook = async (data: {
	code: string;
	title: string;
	testament?: string;
	summary?: string;
}) => {
	try {
		const book = await prisma.bibliaBook.create({
			data,
			select: {
				id: true,
				code: true,
				title: true,
				testament: true,
				summary: true,
				createdAt: true,
			},
		});
		await cacheDeleteByPrefix(BOOK_LIST_CACHE_PREFIX);
		return book;
	} catch (error) {
		if (isUniqueError(error)) throw new ConflictError('Ya existe un libro con ese código.');
		throw error;
	}
};

export const updateBook = async (bookId: string, data: Partial<Prisma.BibliaBookUpdateInput>) => {
	const current = await prisma.bibliaBook.findFirst({ where: { id: bookId, deletedAt: null } });
	if (!current) throw new NotFoundError('El libro solicitado no existe.');
	try {
		const book = await prisma.bibliaBook.update({
			where: { id: bookId },
			data,
			select: {
				id: true,
				code: true,
				title: true,
				testament: true,
				summary: true,
				updatedAt: true,
			},
		});
		await cacheDeleteByPrefix(BOOK_LIST_CACHE_PREFIX);
		await cacheDelete(buildBookCacheKey(bookId));
		return book;
	} catch (error) {
		if (isUniqueError(error)) throw new ConflictError('Ya existe un libro con ese código.');
		throw error;
	}
};

export const deactivateBook = async (bookId: string): Promise<void> => {
	const result = await prisma.bibliaBook.updateMany({
		where: { id: bookId, deletedAt: null },
		data: { status: 'INACTIVE', deletedAt: new Date() },
	});
	if (result.count === 0) throw new NotFoundError('El libro solicitado no existe.');
	await cacheDeleteByPrefix(BOOK_LIST_CACHE_PREFIX);
	await cacheDelete(buildBookCacheKey(bookId));
};

export const getChapter = async (chapterId: string) => {
	const chapter = await prisma.bibliaChapter.findFirst({
		where: { id: chapterId, status: 'ACTIVE', deletedAt: null },
		select: { id: true, bookId: true, number: true, title: true, summary: true, createdAt: true },
	});

	if (!chapter) {
		throw new NotFoundError('El capítulo solicitado no existe.');
	}

	return chapter;
};

export const getChapters = async (bookId: string) => {
	const chapters = await prisma.bibliaChapter.findMany({
		where: { bookId, status: 'ACTIVE', deletedAt: null },
		select: { id: true, number: true, title: true, summary: true, createdAt: true },
		orderBy: { number: 'asc' },
	});
	return chapters;
};

export const createChapter = async (
	bookId: string,
	data: { number: number; title?: string; summary?: string },
) => {
	const book = await prisma.bibliaBook.findFirst({
		where: { id: bookId, status: 'ACTIVE', deletedAt: null },
		select: { id: true },
	});
	if (!book) throw new NotFoundError('El libro solicitado no existe.');
	return prisma.bibliaChapter.create({
		data: { bookId, ...data },
		select: { id: true, number: true, title: true },
	});
};

export const updateChapter = async (
	chapterId: string,
	data: Partial<Prisma.BibliaChapterUpdateInput>,
) => {
	const current = await prisma.bibliaChapter.findFirst({
		where: { id: chapterId, deletedAt: null },
	});
	if (!current) throw new NotFoundError('El capítulo solicitado no existe.');
	return prisma.bibliaChapter.update({
		where: { id: chapterId },
		data,
		select: { id: true, number: true, title: true },
	});
};

export const deactivateChapter = async (chapterId: string): Promise<void> => {
	const result = await prisma.bibliaChapter.updateMany({
		where: { id: chapterId, deletedAt: null },
		data: { status: 'INACTIVE', deletedAt: new Date() },
	});
	if (result.count === 0) throw new NotFoundError('El capítulo solicitado no existe.');
};

export const getVerse = async (verseId: string) => {
	const verse = await prisma.bibliaVerse.findFirst({
		where: { id: verseId, status: 'ACTIVE', deletedAt: null },
		select: { id: true, chapterId: true, number: true, text: true, notes: true },
	});

	if (!verse) {
		throw new NotFoundError('El versículo solicitado no existe.');
	}

	return verse;
};

export const getVerses = async (chapterId: string) => {
	const verses = await prisma.bibliaVerse.findMany({
		where: { chapterId, status: 'ACTIVE', deletedAt: null },
		select: { id: true, number: true, text: true, notes: true },
		orderBy: { number: 'asc' },
	});
	return verses;
};

export const createVerse = async (
	chapterId: string,
	data: { number: number; text: string; notes?: string },
) => {
	const chapter = await prisma.bibliaChapter.findFirst({
		where: { id: chapterId, status: 'ACTIVE', deletedAt: null },
		select: { id: true },
	});
	if (!chapter) throw new NotFoundError('El capítulo solicitado no existe.');
	return prisma.bibliaVerse.create({
		data: { chapterId, ...data },
		select: { id: true, number: true, text: true },
	});
};

export const updateVerse = async (
	verseId: string,
	data: Partial<Prisma.BibliaVerseUpdateInput>,
) => {
	const current = await prisma.bibliaVerse.findFirst({ where: { id: verseId, deletedAt: null } });
	if (!current) throw new NotFoundError('El versículo solicitado no existe.');
	return prisma.bibliaVerse.update({
		where: { id: verseId },
		data,
		select: { id: true, number: true, text: true },
	});
};

export const deactivateVerse = async (verseId: string): Promise<void> => {
	const result = await prisma.bibliaVerse.updateMany({
		where: { id: verseId, deletedAt: null },
		data: { status: 'INACTIVE', deletedAt: new Date() },
	});
	if (result.count === 0) throw new NotFoundError('El versículo solicitado no existe.');
};

// --- Favorites ---
export const addFavorite = async (userId: string, resource: string, resourceId: string) =>
	prisma.bibliaFavorite.create({
		data: { userId, resource, resourceId },
		select: { id: true, resource: true, resourceId: true, createdAt: true },
	});

export const removeFavorite = async (userId: string, resource: string, resourceId: string) => {
	await prisma.bibliaFavorite.deleteMany({ where: { userId, resource, resourceId } });
};

export const getFavorites = async (userId: string) =>
	prisma.bibliaFavorite.findMany({
		where: { userId },
		select: { id: true, resource: true, resourceId: true, createdAt: true },
		orderBy: { createdAt: 'desc' },
	});

// --- Reading plans ---
export const createReadingPlan = async (
	userId: string,
	data: { name: string; items: unknown; startDate?: string; endDate?: string },
) =>
	prisma.bibliaReadingPlan.create({
		data: {
			userId,
			name: data.name,
			items: data.items as Prisma.InputJsonValue,
			startDate: data.startDate ? new Date(data.startDate) : undefined,
			endDate: data.endDate ? new Date(data.endDate) : undefined,
		},
		select: { id: true, name: true, items: true, startDate: true, endDate: true, createdAt: true },
	});

export const getReadingPlan = async (userId: string, planId: string) => {
	const plan = await prisma.bibliaReadingPlan.findFirst({
		where: { id: planId, userId },
		select: {
			id: true,
			userId: true,
			name: true,
			items: true,
			startDate: true,
			endDate: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!plan) {
		throw new NotFoundError('El plan de lectura solicitado no existe.');
	}

	return plan;
};

export const getReadingPlans = async (userId: string) =>
	prisma.bibliaReadingPlan.findMany({
		where: { userId },
		select: {
			id: true,
			name: true,
			items: true,
			startDate: true,
			endDate: true,
			status: true,
			createdAt: true,
		},
		orderBy: { createdAt: 'desc' },
	});

export const updateReadingPlan = async (
	userId: string,
	planId: string,
	data: {
		name?: string;
		items?: unknown;
		startDate?: string;
		endDate?: string;
		status?: 'ACTIVE' | 'INACTIVE';
	},
) => {
	const plan = await prisma.bibliaReadingPlan.findFirst({ where: { id: planId, userId } });
	if (!plan) {
		throw new NotFoundError('El plan de lectura solicitado no existe.');
	}

	return prisma.bibliaReadingPlan.update({
		where: { id: planId },
		data: {
			...(data.name !== undefined && { name: data.name }),
			...(data.items !== undefined && { items: data.items as Prisma.InputJsonValue }),
			...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
			...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
			...(data.status !== undefined && { status: data.status }),
		},
		select: {
			id: true,
			userId: true,
			name: true,
			items: true,
			startDate: true,
			endDate: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
	});
};

export const deleteReadingPlan = async (planId: string) => {
	await prisma.bibliaReadingPlan.updateMany({
		where: { id: planId },
		data: { status: 'INACTIVE' },
	});
};
