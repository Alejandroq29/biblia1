import type { NextApiResponse } from 'next';

type RecordedResponse = NextApiResponse & {
	statusCode?: number;
	body?: unknown;
	headers: Record<string, string | string[] | number | undefined>;
	redirectDestination?: string;
};

type MockResponse = {
	statusCode: number;
	body?: unknown;
	headers: Record<string, string | string[] | number | undefined>;
	redirectDestination?: string;
	setHeader: (name: string, value: string | string[] | number | undefined) => MockResponse;
	getHeader: (name: string) => string | string[] | number | undefined;
	status: (code: number) => MockResponse;
	json: (payload: unknown) => MockResponse;
	end: (payload?: unknown) => MockResponse;
	redirect: (statusOrUrl: number | string, url?: string) => MockResponse;
};

export const createMockResponse = (): RecordedResponse => {
	const response: MockResponse = {
		headers: {},
		statusCode: 200,
		setHeader(name: string, value: string | string[] | number | undefined) {
			this.headers[name] = value;
			return this;
		},
		getHeader(name: string) {
			return this.headers[name];
		},
		status(code: number) {
			this.statusCode = code;
			return this;
		},
		json(payload: unknown) {
			this.body = payload;
			return this;
		},
		end(payload?: unknown) {
			this.body = payload;
			return this;
		},
		redirect(statusOrUrl: number | string, url?: string) {
			if (typeof statusOrUrl === 'number') {
				this.statusCode = statusOrUrl;
				this.redirectDestination = url;
			} else {
				this.redirectDestination = statusOrUrl;
			}

			return this;
		},
	};

	return response as unknown as RecordedResponse;
};
