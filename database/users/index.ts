import type { Prisma } from '@/generated/prisma/client';
import { Prisma as PrismaClient } from '@/generated/prisma/client';

import { prisma } from '@/database/client';
import { ConflictError } from '@/errors/conflict-error';
import { env } from '@/lib/config/env';
import { normalizePagination } from '@/helper/pagination';
import type { SessionUser } from '@/lib/session';
import type { CreateUserBody, UpdateUserBody, UserQueryParams } from '@/validations/users';

type OAuthSyncUser = {
	user: SessionUser;
};

const isPrismaUniqueConstraintError = (
	error: unknown,
): error is PrismaClient.PrismaClientKnownRequestError =>
	error instanceof PrismaClient.PrismaClientKnownRequestError && error.code === 'P2002';

const splitDisplayName = (displayName: string): { firstName: string; lastName: string } => {
	const parts = displayName.trim().split(/\s+/u).filter(Boolean);

	if (parts.length === 0) {
		return { firstName: 'Usuario', lastName: 'OAuth' };
	}

	if (parts.length === 1) {
		return { firstName: parts[0], lastName: '' };
	}

	return {
		firstName: parts[0],
		lastName: parts.slice(1).join(' '),
	};
};

const buildDisplayName = (
	firstName: string | null | undefined,
	lastName: string | null | undefined,
	email: string,
): string => {
	const name = [firstName, lastName]
		.filter((value): value is string => Boolean(value && value.trim()))
		.join(' ')
		.trim();

	return name || email;
};

const loadUser = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
		include: {
			profile: true,
		},
	});

export const getSessionUser = async (userId: string): Promise<SessionUser | null> => {
	const user = await loadUser(userId);

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		email: user.email,
		name: buildDisplayName(user.profile?.firstName, user.profile?.lastName, user.email),
		roles: [],
		permissions: [],
	};
};

export const findOrSyncByOAuth = async (
	oauthSubject: string,
	email: string,
	name: string,
): Promise<OAuthSyncUser> => {
	const existingAccount = await prisma.authAccount.findUnique({
		where: {
			provider_providerAccountId: {
				provider: env.OAUTH_PROVIDER_NAME,
				providerAccountId: oauthSubject,
			},
		},
	});

	if (existingAccount) {
		const updatedUser = await prisma.user.update({
			where: { id: existingAccount.userId },
			data: {
				email,
				profile: {
					upsert: {
						create: splitDisplayName(name),
						update: splitDisplayName(name),
					},
				},
			},
		});

		const user = await loadUser(updatedUser.id);

		if (!user) {
			throw new Error('User synchronization failed');
		}

		return {
			user: {
				id: user.id,
				email: user.email,
				name: buildDisplayName(user.profile?.firstName, user.profile?.lastName, user.email),
				roles: [],
				permissions: [],
			},
		};
	}

	const createdUser = await prisma.$transaction(async transaction => {
		const user = await transaction.user.create({
			data: {
				email,
				username: email.split('@')[0] || email,
				status: 'ACTIVE',
				profile: {
					create: splitDisplayName(name),
				},
				authAccounts: {
					create: {
						provider: env.OAUTH_PROVIDER_NAME,
						providerAccountId: oauthSubject,
					},
				},
			},
		});

		return user;
	});

	const user = await loadUser(createdUser.id);

	if (!user) {
		throw new Error('User synchronization failed');
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			name: buildDisplayName(user.profile?.firstName, user.profile?.lastName, user.email),
			roles: [],
			permissions: [],
		},
	};
};

const selectUserFields = {
	id: true,
	email: true,
	status: true,
	createdAt: true,
	updatedAt: true,
	profile: true,
};

export const getAll = async (filters: UserQueryParams) => {
	const { skip, take, meta } = normalizePagination(filters);

	const where: Prisma.UserWhereInput = {
		status: filters.active ? 'ACTIVE' : undefined,
	};

	if (filters.search) {
		where.OR = [
			{ email: { contains: filters.search, mode: 'insensitive' } },
			{ profile: { firstName: { contains: filters.search, mode: 'insensitive' } } },
			{ profile: { lastName: { contains: filters.search, mode: 'insensitive' } } },
		];
	}

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			select: selectUserFields,
			skip,
			take,
			orderBy: filters.orderBy
				? { [filters.orderBy]: filters.order ?? 'asc' }
				: { createdAt: 'desc' },
		}),
		prisma.user.count({ where }),
	]);

	return { users, meta: meta(total) };
};

export const create = async (data: CreateUserBody) => {
	try {
		const user = await prisma.user.create({
			data: {
				email: data.email,
				username: data.email.split('@')[0] || data.email,
				status: 'ACTIVE',
				profile: {
					create: {
						firstName: data.firstName,
						lastName: data.lastName,
					},
				},
			},
			select: selectUserFields,
		});

		return user;
	} catch (error) {
		if (isPrismaUniqueConstraintError(error)) {
			throw new ConflictError('Ya existe un usuario con ese correo electrónico.');
		}

		throw error;
	}
};

export const record = (userId: string) => ({
	getUnique: async () =>
		prisma.user.findUnique({
			where: { id: userId },
			select: selectUserFields,
		}),
	update: async (data: UpdateUserBody) =>
		prisma.user.update({
			where: { id: userId },
			data: {
				...(data.email && { email: data.email }),
				...(data.firstName || data.lastName
					? {
							profile: {
								update: {
									...(data.firstName && { firstName: data.firstName }),
									...(data.lastName && { lastName: data.lastName }),
								},
							},
						}
					: {}),
			},
			select: selectUserFields,
		}),
	remove: async () =>
		prisma.user.update({
			where: { id: userId },
			data: {
				status: 'INACTIVE',
			},
			select: selectUserFields,
		}),
});
