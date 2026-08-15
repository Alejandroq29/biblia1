import { describe, expect, it } from 'vitest';

import { bibliaKidsService } from '@/services/biblia-kids';

describe('Biblia Kids API contract', () => {
	it('exposes the CRUD detail accessors required by the Spanish routes', () => {
		expect(bibliaKidsService).toHaveProperty('getLevel');
		expect(bibliaKidsService).toHaveProperty('getGame');
		expect(bibliaKidsService).toHaveProperty('getChapter');
		expect(bibliaKidsService).toHaveProperty('getVerse');
	});
});
