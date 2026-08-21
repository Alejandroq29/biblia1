import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { createLevelSchema, levelQuerySchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('niveles.read'), async (req, res): Promise<void> => {
		const parsed = levelQuerySchema.safeParse(req.query);
		throwValidationError(parsed);
		res.status(200).json(await bibliaKidsService.getLevels(parsed.data));
	})
	.post(access('niveles.manage'), async (req, res): Promise<void> => {
		const parsed = createLevelSchema.safeParse(req.body);
		throwValidationError(parsed);
		res.status(201).json({ data: await bibliaKidsService.createLevel(parsed.data) });
	});

export default handler.handler(routerOptions);
