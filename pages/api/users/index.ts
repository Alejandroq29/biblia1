import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import { auth } from '@/middleware/auth';
import { routerOptions } from '@/lib/api/router-config';
import { userService } from '@/services/users';
import { userQuerySchema, createUserSchema } from '@/validations/users';
import { throwValidationError } from '@/lib/errors/throw-validation-error';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler
	.use(auth)
	.get(async (req, res): Promise<void> => {
		const parsed = userQuerySchema.safeParse(req.query);
		throwValidationError(parsed);

		const result = await userService.getAll(parsed.data);

		res.status(200).json(result);
	})
	.post(async (req, res): Promise<void> => {
		const parsed = createUserSchema.safeParse(req.body);
		throwValidationError(parsed);

		const user = await userService.create(parsed.data);

		res.status(201).json({ data: user });
	});

export default handler.handler(routerOptions);
