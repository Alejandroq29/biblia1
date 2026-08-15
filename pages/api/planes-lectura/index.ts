import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { createReadingPlanSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('biblia-kids.readingplans.read'), async (req, res): Promise<void> => {
		if (!req.user) throw new Error('Authenticated user was not attached to the request.');
		res.status(200).json({ data: await bibliaKidsService.getReadingPlans(req.user.id) });
	})
	.post(access('biblia-kids.readingplans.manage'), async (req, res): Promise<void> => {
		const parsed = createReadingPlanSchema.safeParse(req.body);
		throwValidationError(parsed);
		if (!req.user) throw new Error('Authenticated user was not attached to the request.');
		res
			.status(201)
			.json({ data: await bibliaKidsService.createReadingPlan(req.user.id, parsed.data) });
	});

export default handler.handler(routerOptions);
