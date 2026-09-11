import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
});

describe('Адреса каталога и изображений', () => {
    it.each([
        { name: 'без .env', value: undefined },
        { name: 'с пустым значением', value: '' },
        { name: 'со значением из пробелов', value: '   ' },
    ])('использует учебный API $name', async ({ value }) => {
        vi.stubEnv('VITE_API_ORIGIN', value);
        vi.resetModules();
        const { API_URL, CDN_URL } = await import('../src/utils/constants');
        expect(API_URL).toBe('https://larek-api.nomoreparties.co/api/weblarek');
        expect(CDN_URL).toBe('https://larek-api.nomoreparties.co/content/weblarek');
    });

    it('сохраняет явно заданный сервер и убирает крайние пробелы и слеши', async () => {
        vi.stubEnv('VITE_API_ORIGIN', '  https://catalog.example.test///  ');
        vi.resetModules();
        const { API_URL, CDN_URL } = await import('../src/utils/constants');
        expect(API_URL).toBe('https://catalog.example.test/api/weblarek');
        expect(CDN_URL).toBe('https://catalog.example.test/content/weblarek');
    });
});
