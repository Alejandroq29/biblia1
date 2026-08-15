import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { verseParamsSchema, updateVerseSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();
handler.use(auth).patch(access('biblia-kids.verses.manage'), async (req, res) => {
	const params = verseParamsSchema.safeParse(req.query);
	const body = updateVerseSchema.safeParse(req.body);
	throwValidationError(params);
	throwValidationError(body);
	res
		.status(200)
		.json({ data: await bibliaKidsService.updateVerse(params.data.verseId, body.data) });
});

handler.use(auth).delete(access('biblia-kids.verses.manage'), async (req, res) => {
	const parsed = verseParamsSchema.safeParse(req.query);
	throwValidationError(parsed);
	await bibliaKidsService.deactivateVerse(parsed.data.verseId);
	res.status(204).end();
});

export default handler.handler(routerOptions);
