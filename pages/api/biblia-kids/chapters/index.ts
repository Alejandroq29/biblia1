import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { createChapterSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();
handler.use(auth).post(access('biblia-kids.chapters.manage'), async (req, res) => {
	const parsed = createChapterSchema.safeParse(req.body);
	throwValidationError(parsed);
	res
		.status(201)
		.json({ data: await bibliaKidsService.createChapter(parsed.data.bookId, parsed.data) });
});

handler.use(auth).get(access('biblia-kids.chapters.read'), async (req, res) => {
	const bookId = String(req.query.bookId ?? '');
	if (!bookId)
		return res
			.status(400)
			.json({ error: { code: 'VALIDATION_ERROR', message: 'bookId is required' } });
	res.status(200).json({ data: await bibliaKidsService.getChapters(bookId) });
});

export default handler.handler(routerOptions);
