import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { createStorySchema, storyQuerySchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('historias.read'), async (req, res): Promise<void> => {
		const parsed = storyQuerySchema.safeParse(req.query);
		throwValidationError(parsed);
		res.status(200).json(await bibliaKidsService.getStories(parsed.data));
	})
	.post(access('historias.manage'), async (req, res): Promise<void> => {
		const parsed = createStorySchema.safeParse(req.body);
		throwValidationError(parsed);
		res.status(201).json({ data: await bibliaKidsService.createStory(parsed.data) });
	});

export default handler.handler(routerOptions);
