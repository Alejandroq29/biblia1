import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { gameParamsSchema, updateGameSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('juegos.read'), async (req, res): Promise<void> => {
		const parsed = gameParamsSchema.safeParse({ gameId: req.query.juegoId });
		throwValidationError(parsed);
		res.status(200).json({ data: await bibliaKidsService.getGame(parsed.data.gameId) });
	})
	.patch(access('juegos.manage'), async (req, res): Promise<void> => {
		const params = gameParamsSchema.safeParse({ gameId: req.query.juegoId });
		const body = updateGameSchema.safeParse(req.body);
		throwValidationError(params);
		throwValidationError(body);
		res
			.status(200)
			.json({ data: await bibliaKidsService.updateGame(params.data.gameId, body.data) });
	})
	.delete(access('juegos.manage'), async (req, res): Promise<void> => {
		const parsed = gameParamsSchema.safeParse({ gameId: req.query.juegoId });
		throwValidationError(parsed);
		await bibliaKidsService.deactivateGame(parsed.data.gameId);
		res.status(204).end();
	});

export default handler.handler(routerOptions);
