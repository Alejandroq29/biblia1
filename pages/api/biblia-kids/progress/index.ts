import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { progressQuerySchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();
handler.use(auth).get(access('biblia-kids.progress.read'), async (req, res): Promise<void> => {
	const parsed = progressQuerySchema.safeParse(req.query);
	throwValidationError(parsed);
	if (!req.user) throw new Error('Authenticated user was not attached to the request.');
	res.status(200).json(await bibliaKidsService.getProgress(req.user.id, parsed.data));
});
export default handler.handler(routerOptions);
