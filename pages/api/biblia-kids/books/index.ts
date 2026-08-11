import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { bookQuerySchema, createBookSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();
handler
  .use(auth)
  .get(access('biblia-kids.books.read'), async (req, res) => {
    const parsed = bookQuerySchema.safeParse(req.query);
    throwValidationError(parsed);
    res.status(200).json(await bibliaKidsService.getBooks(parsed.data));
  })
  .post(access('biblia-kids.books.manage'), async (req, res) => {
    const parsed = createBookSchema.safeParse(req.body);
    throwValidationError(parsed);
    res.status(201).json({ data: await bibliaKidsService.createBook(parsed.data) });
  });

export default handler.handler(routerOptions);
