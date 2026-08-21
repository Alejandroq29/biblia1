import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('biblia-kids.readingplans.read'), async (req, res): Promise<void> => {
		if (!req.user) throw new Error('Authenticated user was not attached to the request.');
		const planId = String(req.query.planId ?? '');
		if (!planId) {
			res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'planId is required' } });
			return;
		}
		res.status(200).json({ data: await bibliaKidsService.getReadingPlan(req.user.id, planId) });
	})
	.patch(access('biblia-kids.readingplans.manage'), async (req, res): Promise<void> => {
		if (!req.user) throw new Error('Authenticated user was not attached to the request.');
		const planId = String(req.query.planId ?? '');
		if (!planId) {
			res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'planId is required' } });
			return;
		}
		const parsed = JSON.parse(JSON.stringify(req.body));
		const result = await bibliaKidsService.updateReadingPlan(req.user.id, planId, parsed);
		res.status(200).json({ data: result });
	})
	.delete(access('biblia-kids.readingplans.manage'), async (req, res): Promise<void> => {
		const planId = String(req.query.planId ?? '');
		if (!planId) {
			res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'planId is required' } });
			return;
		}
		await bibliaKidsService.deleteReadingPlan(planId);
		res.status(204).end();
	});

export default handler.handler(routerOptions);
