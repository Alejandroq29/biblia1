import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/env', () => ({
	env: { NODE_ENV: 'test', BYPASS_AUTH: true, BYPASS_ACCESS_CONTROL: true },
}));

const getBooksMock = vi.fn(async () => ({
	data: [],
	meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
}));

vi.mock('@/services/biblia-kids', () => ({
	bibliaKidsService: { getBooks: getBooksMock },
}));

describe('Libros API route', () => {
	it('returns the paginated list of books', async () => {
		const handler = (await import('@/pages/api/libros/index')).default;
		const req = { method: 'GET', url: '/api/libros', query: {} } as never;
		const status = vi.fn().mockReturnThis();
		const json = vi.fn().mockReturnThis();
		const res = { status, json } as never;

		await handler(req, res);

		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({
			data: [],
			meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
		});
	});
});
