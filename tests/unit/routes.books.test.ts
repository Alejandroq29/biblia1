import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/env', () => ({
	env: { NODE_ENV: 'test', BYPASS_AUTH: true, BYPASS_ACCESS_CONTROL: true },
}));

const getBooksMock = vi.fn(async () => ({
	data: [],
	meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
}));
const createBookMock = vi.fn(async () => ({ id: 'book-1', code: 'GEN', title: 'Génesis' }));
vi.mock('@/services/biblia-kids', () => ({
	bibliaKidsService: { getBooks: getBooksMock, createBook: createBookMock },
}));

describe('Books API route', () => {
	it('returns list of books (GET)', async () => {
		const handlerModule = await import('@/pages/api/biblia-kids/books/index');
		const handler = handlerModule.default;

		const req: any = { method: 'GET', url: '/api/biblia-kids/books', query: {} };
		const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalled();
	});

	it('creates a book (POST)', async () => {
		const handlerModule = await import('@/pages/api/biblia-kids/books/index');
		const handler = handlerModule.default;

		const req: any = {
			method: 'POST',
			url: '/api/biblia-kids/books',
			query: {},
			body: { code: 'GEN', title: 'Génesis' },
		};
		const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };

		await handler(req, res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalled();
	});
});
