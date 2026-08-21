import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { bookParamsSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler.use(auth).get(access('libros.read'), async (req, res): Promise<void> => {
	const parsed = bookParamsSchema.safeParse({ bookId: req.query.libroId });
	throwValidationError(parsed);
	res.status(200).json({ data: await bibliaKidsService.getBook(parsed.data.bookId) });
});

export default handler.handler(routerOptions);
