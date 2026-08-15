import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { bookParamsSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler.use(auth).get(access('biblia-kids.chapters.read'), async (req, res): Promise<void> => {
	const parsed = bookParamsSchema.safeParse(req.query);
	throwValidationError(parsed);
	res.status(200).json({ data: await bibliaKidsService.getChapters(parsed.data.bookId) });
});

export default handler.handler(routerOptions);
