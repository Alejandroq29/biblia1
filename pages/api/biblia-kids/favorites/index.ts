import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { favoriteSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();
handler.use(auth).get(access('biblia-kids.favorites.read'), async (req, res) => {
	if (!req.user) throw new Error('Authenticated user was not attached to the request.');
	res.status(200).json({ data: await bibliaKidsService.getFavorites(req.user.id) });
});

handler.use(auth).post(access('biblia-kids.favorites.manage'), async (req, res) => {
	const parsed = favoriteSchema.safeParse(req.body);
	throwValidationError(parsed);
	if (!req.user) throw new Error('Authenticated user was not attached to the request.');
	res.status(201).json({
		data: await bibliaKidsService.addFavorite(
			req.user.id,
			parsed.data.resource,
			parsed.data.resourceId,
		),
	});
});

handler.use(auth).delete(access('biblia-kids.favorites.manage'), async (req, res) => {
	const parsed = favoriteSchema.safeParse(req.body);
	throwValidationError(parsed);
	if (!req.user) throw new Error('Authenticated user was not attached to the request.');
	await bibliaKidsService.removeFavorite(req.user.id, parsed.data.resource, parsed.data.resourceId);
	res.status(204).end();
});

export default handler.handler(routerOptions);
