import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { levelParamsSchema, updateLevelSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('niveles.read'), async (req, res): Promise<void> => {
		const parsed = levelParamsSchema.safeParse({ levelId: req.query.nivelId });
		throwValidationError(parsed);
		res.status(200).json({ data: await bibliaKidsService.getLevel(parsed.data.levelId) });
	})
	.patch(access('niveles.manage'), async (req, res): Promise<void> => {
		const params = levelParamsSchema.safeParse({ levelId: req.query.nivelId });
		const body = updateLevelSchema.safeParse(req.body);
		throwValidationError(params);
		throwValidationError(body);
		res
			.status(200)
			.json({ data: await bibliaKidsService.updateLevel(params.data.levelId, body.data) });
	})
	.delete(access('niveles.manage'), async (req, res): Promise<void> => {
		const parsed = levelParamsSchema.safeParse({ levelId: req.query.nivelId });
		throwValidationError(parsed);
		await bibliaKidsService.deactivateLevel(parsed.data.levelId);
		res.status(204).end();
	});

export default handler.handler(routerOptions);
