import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { createGameSchema, gameQuerySchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('biblia-kids.games.read'), async (req, res): Promise<void> => {
		const parsed = gameQuerySchema.safeParse(req.query);
		throwValidationError(parsed);
		res.status(200).json(await bibliaKidsService.getGames(parsed.data));
	})
	.post(access('biblia-kids.games.manage'), async (req, res): Promise<void> => {
		const parsed = createGameSchema.safeParse(req.body);
		throwValidationError(parsed);
		res.status(201).json({ data: await bibliaKidsService.createGame(parsed.data) });
	});

export default handler.handler(routerOptions);
