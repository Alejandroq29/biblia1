import * as sessionDb from '@/database/sessions';
import { getSessionUser } from '@/database/users';
import { AuthenticationError } from '@/errors/auth';
import { cacheDelete, cacheGet, cacheSet } from '@/lib/cache/redis';
import { env } from '@/lib/config/env';
import { sealTokens, unsealTokens } from '@/lib/session';
import type { SessionPayload, SessionTokenSet } from '@/lib/session';

const SESSION_USER_CACHE_TTL_SECONDS = 30;

const getSessionUserCacheKey = (userId: string): string => `session-user:${userId}`;

export const sessionService = {
	/** Crea la sesión en servidor y devuelve el id que se guardará en la cookie. */
	async create(userId: string, tokens: SessionTokenSet): Promise<string> {
		const expiresAt = new Date(Date.now() + env.SESSION_COOKIE_MAX_AGE_SECONDS * 1000);
		const session = await sessionDb.create({
			userId,
			sealedTokens: await sealTokens(tokens),
			expiresAt,
		});

		return session.id;
	},

	/**
	 * Reconstruye la sesión en cada petición.
	 *
	 * Rechaza sesiones revocadas o expiradas: por eso el logout ahora sí invalida
	 * la cookie del lado del servidor, y no sólo la borra del navegador.
	 */
	async resolve(sessionId: string): Promise<SessionPayload> {
		const session = await sessionDb.findActive(sessionId);

		if (!session) {
			throw new AuthenticationError('Tu sesión ha expirado o fue cerrada. Inicia sesión de nuevo.');
		}

		const cacheKey = getSessionUserCacheKey(session.userId);
		let user = await cacheGet<ReturnType<typeof getSessionUser>>(cacheKey);

		if (!user) {
			user = await getSessionUser(session.userId);

			if (!user) {
				throw new AuthenticationError('El usuario de la sesión ya no existe.');
			}

			await cacheSet(cacheKey, user, SESSION_USER_CACHE_TTL_SECONDS);
		}

		return {
			sessionId: session.id,
			user,
			tokens: await unsealTokens(session.sealedTokens),
			createdAt: session.createdAt.toISOString(),
		};
	},

	async rotateTokens(sessionId: string, tokens: SessionTokenSet): Promise<void> {
		await sessionDb.updateTokens(sessionId, await sealTokens(tokens));
		const session = await sessionDb.findById(sessionId);
		if (session) {
			await cacheDelete(getSessionUserCacheKey(session.userId));
		}
	},

	async revoke(sessionId: string): Promise<void> {
		const session = await sessionDb.findById(sessionId);
		await sessionDb.revoke(sessionId);
		if (session) {
			await cacheDelete(getSessionUserCacheKey(session.userId));
		}
	},
};
