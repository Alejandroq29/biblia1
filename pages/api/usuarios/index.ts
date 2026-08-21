import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { throwValidationError } from '@/lib/errors/throw-validation-error';
import { routerOptions } from '@/lib/api/router-config';
import { access } from '@/middleware/access';
import { auth } from '@/middleware/auth';
import { userService } from '@/services/users';
import { createUserSchema, userQuerySchema } from '@/validations/users';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(access('usuarios.read'), async (req, res): Promise<void> => {
		const parsed = userQuerySchema.safeParse(req.query);
		throwValidationError(parsed);
		res.status(200).json(await userService.getAll(parsed.data));
	})
	.post(access('usuarios.manage'), async (req, res): Promise<void> => {
		const parsed = createUserSchema.safeParse(req.body);
		throwValidationError(parsed);
		res.status(201).json({ data: await userService.create(parsed.data) });
	});

export default handler.handler(routerOptions);
