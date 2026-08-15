import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { storyParamsSchema, updateStorySchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('biblia-kids.stories.read'), async (req, res): Promise<void> => {
		const parsed = storyParamsSchema.safeParse(req.query);
		throwValidationError(parsed);
		res.status(200).json({ data: await bibliaKidsService.getStory(parsed.data.storyId) });
	})
	.patch(access('biblia-kids.stories.manage'), async (req, res): Promise<void> => {
		const params = storyParamsSchema.safeParse(req.query);
		const body = updateStorySchema.safeParse(req.body);
		throwValidationError(params);
		throwValidationError(body);
		res
			.status(200)
			.json({ data: await bibliaKidsService.updateStory(params.data.storyId, body.data) });
	})
	.delete(access('biblia-kids.stories.manage'), async (req, res): Promise<void> => {
		const parsed = storyParamsSchema.safeParse(req.query);
		throwValidationError(parsed);
		await bibliaKidsService.deactivateStory(parsed.data.storyId);
		res.status(204).end();
	});

export default handler.handler(routerOptions);
