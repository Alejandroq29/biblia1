import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { access } from '@/middleware/access';
import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { bibliaKidsService } from '@/services/biblia-kids';
import { chapterParamsSchema, updateChapterSchema } from '@/validations/biblia-kids';

const handler = createRouter<NextApiRequest, NextApiResponse>();
handler.use(auth).patch(access('biblia-kids.chapters.manage'), async (req, res) => {
  const params = chapterParamsSchema.safeParse(req.query);
  const body = updateChapterSchema.safeParse(req.body);
  throwValidationError(params);
  throwValidationError(body);
  res.status(200).json({ data: await bibliaKidsService.updateChapter(params.data.chapterId, body.data) });
});

handler.use(auth).delete(access('biblia-kids.chapters.manage'), async (req, res) => {
  const parsed = chapterParamsSchema.safeParse(req.query);
  throwValidationError(parsed);
  await bibliaKidsService.deactivateChapter(parsed.data.chapterId);
  res.status(204).end();
});

export default handler.handler(routerOptions);
