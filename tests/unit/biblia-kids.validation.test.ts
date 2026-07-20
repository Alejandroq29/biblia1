import { describe, expect, it } from 'vitest';

import { createAttemptSchema, createStorySchema } from '@/validations/biblia-kids';

describe('Biblia Kids validations', () => {
	it('accepts a story payload with educational age range', () => {
		const result = createStorySchema.safeParse({
			title: 'David y Goliat',
			slug: 'david-y-goliat',
			content: 'Una historia para aprender valentía.',
			minAge: 6,
			maxAge: 10,
			levelIds: ['123e4567-e89b-12d3-a456-426614174000'],
		});

		expect(result.success).toBe(true);
	});

	it('rejects an attempt with a negative score', () => {
		const result = createAttemptSchema.safeParse({
			gameId: '123e4567-e89b-12d3-a456-426614174000',
			score: -1,
		});

		expect(result.success).toBe(false);
	});
});
