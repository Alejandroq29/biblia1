import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { userService } from '@/services/users';
import { updateUserSchema, userParamsSchema } from '@/validations/users';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('usuarios.read'), async (req, res): Promise<void> => {
		const parsed = userParamsSchema.safeParse({ userId: req.query.usuarioId });
		throwValidationError(parsed);
		res.status(200).json({ data: await userService.getById(parsed.data.userId) });
	})
	.patch(access('usuarios.manage'), async (req, res): Promise<void> => {
		const params = userParamsSchema.safeParse({ userId: req.query.usuarioId });
		const body = updateUserSchema.safeParse(req.body);
		throwValidationError(params);
		throwValidationError(body);
		res.status(200).json({ data: await userService.update(params.data.userId, body.data) });
	})
	.delete(access('usuarios.manage'), async (req, res): Promise<void> => {
		const parsed = userParamsSchema.safeParse({ userId: req.query.usuarioId });
		throwValidationError(parsed);
		await userService.remove(parsed.data.userId);
		res.status(204).end();
	});

export default handler.handler(routerOptions);
