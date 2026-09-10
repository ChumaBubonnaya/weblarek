// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IProduct } from '../src/types';

const markup = readFileSync('index.html', 'utf8');
const products: IProduct[] = [
    { id: 'first', title: 'Первый товар', description: 'Описание первого', category: 'софт-скил', image: '/first.svg', price: 750 },
    { id: 'second', title: 'Второй товар', description: 'Описание второго', category: 'хард-скил', image: '/second.svg', price: 1000 },
    { id: 'unavailable', title: 'Бесценный товар', description: 'Нет цены', category: 'другое', image: '/third.svg', price: null },
    { id: 'free', title: 'Бесплатный товар', description: 'Нулевая цена', category: 'кнопка', image: '/fourth.svg', price: 0 },
];
const fetchMock = vi.fn();
const response = (data: object, ok = true) => ({ ok, json: async () => data, statusText: 'Server error' });
const element = <T extends HTMLElement = HTMLElement>(selector: string): T => {
    const result = document.querySelector<T>(selector);
    if (!result) throw new Error(`Не найден ${selector}`);
    return result;
};
const click = (selector: string) => element(selector).click();
const input = (name: string, value: string) => {
    const field = element<HTMLInputElement>(`.modal input[name="${name}"]`);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
};
const active = () => element('.modal').classList.contains('modal_active');
const submitDisabled = () => element<HTMLButtonElement>('.modal button[type="submit"]').disabled;
const counter = () => element('.header__basket-counter').textContent;
const openProduct = (index = 0) => click(`.gallery > :nth-child(${index + 1})`);
const addProduct = (index = 0) => { openProduct(index); click('.modal .card__button'); };
const openCart = () => click('.header__basket');
const openDelivery = () => { openCart(); click('.basket__button'); };
const openContacts = () => {
    openDelivery();
    click('.modal [name="card"]');
    input('address', 'Тестовый адрес');
    click('.modal button[type="submit"]');
};
const fillContacts = () => { input('email', 'test@example.com'); input('phone', '+70000000000'); };

beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = markup.match(/<body[^>]*>([\s\S]*?)<\/body>/)![1];
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => response({ total: products.length, items: products }));
    vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); document.body.replaceChildren(); });

async function start() {
    await import('../src/main');
    await vi.waitFor(() => expect(document.querySelectorAll('.gallery > .card')).toHaveLength(products.length));
}

describe('Каталог, карточки и корзина', () => {
    it('загружает каталог, выводит категории, изображение и описание', async () => {
        await start();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/weblarek\/product$/);
        expect(element('.gallery .card__category').classList.contains('card__category_soft')).toBe(true);
        expect(element<HTMLImageElement>('.gallery .card__image').src).toContain('/content/weblarek/first.svg');
        openProduct();
        expect(active()).toBe(true);
        expect(element('.modal .card__text').textContent).toBe('Описание первого');
        expect(element('.modal .card__button').textContent).toBe('Купить');
    });

    it('показывает пустую корзину и запрещает оформление', async () => {
        await start(); openCart();
        expect(element('.basket__list').textContent).toBe('Корзина пуста');
        expect(element<HTMLButtonElement>('.basket__button').disabled).toBe(true);
        expect(element('.basket__price').textContent).toBe('0 синапсов');
    });

    it('добавляет товар один раз и удаляет его из подробной карточки', async () => {
        await start(); addProduct();
        expect(active()).toBe(false);
        expect(counter()).toBe('1');
        openProduct();
        expect(element('.modal .card__button').textContent).toBe('Удалить из корзины');
        click('.modal .card__button');
        expect(counter()).toBe('0');
        expect(active()).toBe(false);
    });

    it('обновляет сумму, счётчик и нумерацию после удаления', async () => {
        await start(); addProduct(); addProduct(1); openCart();
        expect(element('.basket__price').textContent).toBe('1750 синапсов');
        click('.basket__item-delete');
        expect(counter()).toBe('1');
        expect(element('.basket__item-index').textContent).toBe('1');
        expect(element('.basket__list .card__title').textContent).toBe('Второй товар');
        expect(element('.basket__price').textContent).toBe('1000 синапсов');
        click('.basket__item-delete');
        expect(element('.basket__empty').textContent).toBe('Корзина пуста');
        expect(element<HTMLButtonElement>('.basket__button').disabled).toBe(true);
    });

    it('блокирует null-цену, но разрешает товар с нулевой ценой', async () => {
        await start(); openProduct(2);
        expect(element('.modal .card__button').textContent).toBe('Недоступно');
        expect(element<HTMLButtonElement>('.modal .card__button').disabled).toBe(true);
        click('.modal .card__button');
        expect(counter()).toBe('0');
        click('.modal__close'); addProduct(3); openCart();
        expect(counter()).toBe('1');
        expect(element<HTMLButtonElement>('.basket__button').disabled).toBe(false);
        expect(element('.basket__price').textContent).toBe('0 синапсов');
    });

    it('закрывает окно крестиком, фоном и Escape; содержимое не закрывает окно', async () => {
        await start(); openProduct(); click('.modal .card__title'); expect(active()).toBe(true);
        click('.modal__close'); expect(active()).toBe(false);
        openCart(); click('.modal'); expect(active()).toBe(false);
        openProduct(); element('.modal').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(active()).toBe(false);
    });
});

describe('Оформление', () => {
    it('валидирует оплату и адрес, включая пробелы, переключает вид оплаты', async () => {
        await start(); addProduct(); openDelivery();
        expect(submitDisabled()).toBe(true);
        expect(element('.form__errors').textContent).toContain('способ оплаты');
        expect(element('.form__errors').textContent).toContain('адрес');
        input('address', 'Улица'); expect(submitDisabled()).toBe(true);
        click('.modal [name="card"]'); expect(submitDisabled()).toBe(false);
        expect(element('.modal [name="card"]').classList.contains('button_alt-active')).toBe(true);
        click('.modal [name="cash"]');
        expect(element('.modal [name="card"]').classList.contains('button_alt-active')).toBe(false);
        expect(element('.modal [name="cash"]').classList.contains('button_alt-active')).toBe(true);
        input('address', '   '); expect(submitDisabled()).toBe(true);
        input('address', 'Адрес'); click('.modal button[type="submit"]');
        expect(element<HTMLFormElement>('.modal form').name).toBe('contacts');
    });

    it('валидирует контакты и восстанавливает черновик после закрытия', async () => {
        await start(); addProduct(); openContacts();
        expect(submitDisabled()).toBe(true);
        input('email', 'test@example.com'); expect(submitDisabled()).toBe(true);
        input('phone', '  '); expect(submitDisabled()).toBe(true);
        input('phone', '+70000000000'); expect(submitDisabled()).toBe(false);
        click('.modal__close'); openDelivery();
        expect(element<HTMLInputElement>('.modal [name="address"]').value).toBe('Тестовый адрес');
        click('.modal button[type="submit"]');
        expect(element<HTMLInputElement>('.modal [name="email"]').value).toBe('test@example.com');
        expect(submitDisabled()).toBe(false);
    });

    it('передаёт заказ, предотвращает повторный запрос и очищает данные только после успеха', async () => {
        await start(); addProduct(); addProduct(1); openContacts(); fillContacts();
        let finish!: (result: ReturnType<typeof response>) => void;
        fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
        const form = element<HTMLFormElement>('.modal form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(submitDisabled()).toBe(true);
        expect(counter()).toBe('2');
        expect(element<HTMLInputElement>('.modal [name="email"]').disabled).toBe(true);
        const [url, options] = fetchMock.mock.calls[1];
        expect(url).toMatch(/\/order$/);
        expect(options.method).toBe('POST');
        expect(JSON.parse(options.body)).toEqual({
            payment: 'card', address: 'Тестовый адрес', email: 'test@example.com', phone: '+70000000000',
            items: ['first', 'second'], total: 1750,
        });
        finish(response({ id: 'test-order', total: 1750 }));
        await vi.waitFor(() => expect(element('.order-success__description').textContent).toBe('Списано 1750 синапсов'));
        expect(counter()).toBe('0');
        click('.order-success__close'); openCart();
        expect(element('.basket__empty').textContent).toBe('Корзина пуста');
        click('.modal__close'); addProduct(); openDelivery();
        expect(element<HTMLInputElement>('.modal [name="address"]').value).toBe('');
        expect(document.querySelectorAll('.modal .button_alt-active')).toHaveLength(0);
        click('.modal [name="cash"]'); input('address', 'Новый адрес'); click('.modal button[type="submit"]');
        expect(element<HTMLInputElement>('.modal [name="email"]').value).toBe('');
        expect(element<HTMLInputElement>('.modal [name="phone"]').value).toBe('');
    });

    it('сохраняет корзину и контакты при ошибке сервера, позволяет повторить запрос', async () => {
        await start(); addProduct(); openContacts(); fillContacts();
        fetchMock.mockResolvedValueOnce(response({ error: 'Ошибка сервера' }, false));
        click('.modal button[type="submit"]');
        await vi.waitFor(() => expect(element('.form__errors').textContent).toContain('Не удалось отправить заказ'));
        expect(counter()).toBe('1');
        expect(element<HTMLInputElement>('.modal [name="email"]').value).toBe('test@example.com');
        expect(submitDisabled()).toBe(false);
        fetchMock.mockResolvedValueOnce(response({ id: 'retry-order', total: 750 }));
        click('.modal button[type="submit"]');
        await vi.waitFor(() => expect(element('.order-success__description').textContent).toContain('750'));
        expect(counter()).toBe('0');
    });

    it('не меняет отправленный заказ, если окно закрыли во время запроса', async () => {
        await start(); addProduct(); openContacts(); fillContacts();
        let finish!: (result: ReturnType<typeof response>) => void;
        fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
        click('.modal button[type="submit"]'); click('.modal__close'); openCart();
        click('.basket__item-delete');
        expect(counter()).toBe('1');
        expect(element<HTMLButtonElement>('.basket__button').disabled).toBe(true);
        finish(response({ id: 'order', total: 750 }));
        await vi.waitFor(() => expect(counter()).toBe('0'));
        expect(element('.order-success__title').textContent).toBe('Заказ оформлен');
    });
});

describe('Отказ загрузки', () => {
    it('показывает понятную ошибку и повторно загружает каталог', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
        await import('../src/main');
        await vi.waitFor(() => expect(document.querySelector('.modal .catalog-error')).not.toBeNull());
        expect(active()).toBe(true);
        click('.catalog-error__retry');
        await vi.waitFor(() => expect(document.querySelectorAll('.gallery > .card')).toHaveLength(4));
        expect(active()).toBe(false);
    });
});
