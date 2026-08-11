import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { createVerseSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();
handler.use(auth).post(access('biblia-kids.verses.manage'), async (req, res) => {
  const parsed = createVerseSchema.safeParse(req.body);
  throwValidationError(parsed);
  res.status(201).json({ data: await bibliaKidsService.createVerse(parsed.data.chapterId, parsed.data) });
});

handler.use(auth).get(access('biblia-kids.verses.read'), async (req, res) => {
  const chapterId = String(req.query.chapterId ?? '');
  if (!chapterId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'chapterId is required' } });
  res.status(200).json({ data: await bibliaKidsService.getVerses(chapterId) });
});

export default handler.handler(routerOptions);
