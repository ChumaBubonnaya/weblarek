// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventEmitter } from '../src/components/base/Events';
import { CartLine } from '../src/components/views/CartLine';
import { CatalogTile } from '../src/components/views/CatalogTile';
import { ModalView } from '../src/components/views/ModalView';
import { ReceiptView } from '../src/components/views/ReceiptView';
import { appEvents } from '../src/utils/constants';
import { cloneTemplate } from '../src/utils/utils';

const markup = readFileSync('index.html', 'utf8');
beforeEach(() => {
    document.body.innerHTML = markup.match(/<body[^>]*>([\s\S]*?)<\/body>/)![1];
});

describe('Самостоятельные представления', () => {
    it('модальное окно закрывается без посредника-презентера', () => {
        const root = document.querySelector<HTMLElement>('.modal')!;
        const modal = new ModalView(root);
        modal.render({ content: document.createElement('article') });
        modal.open();
        root.querySelector<HTMLElement>('.modal__container')!.click();
        expect(root.classList.contains('modal_active')).toBe(true);
        root.click();
        expect(root.classList.contains('modal_active')).toBe(false);
        modal.open();
        root.querySelector<HTMLElement>('.modal__close')!.click();
        expect(root.classList.contains('modal_active')).toBe(false);
        modal.open();
        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(root.getAttribute('aria-hidden')).toBe('true');
    });

    it('квитанция сообщает собственное событие и не управляет другим компонентом', () => {
        const events = new EventEmitter();
        const received: string[] = [];
        events.onAll(({ eventName }) => received.push(eventName));
        const receipt = new ReceiptView(cloneTemplate('#success'), events);
        const root = receipt.render({ total: 750 });
        document.querySelector('.gallery')!.append(root);
        receipt.render(); receipt.render();
        root.querySelector<HTMLElement>('.order-success__close')!.click();
        expect(received).toEqual([appEvents.receiptClosed]);
        expect(root.isConnected).toBe(true);
    });

    it('компактной карточке не нужны изображение и категория, иллюстрированная обновляет их', () => {
        const line = new CartLine(cloneTemplate('#card-basket'), () => {});
        const root = line.render({ title: 'Товар', price: 0, position: 1 });
        expect(line.render()).toBe(root);
        expect(root.querySelector('.card__price')!.textContent).toBe('0 синапсов');
        expect('image' in line).toBe(false);
        expect('category' in line).toBe(false);

        const tile = new CatalogTile(cloneTemplate('#card-catalog'), () => {});
        const card = tile.render({ title: 'Товар', image: '/first.svg', category: 'софт-скил', price: 750 });
        tile.render({ title: 'Другое название', image: '/second.svg', category: 'хард-скил' });
        expect(card.querySelector<HTMLImageElement>('.card__image')!.alt).toBe('Другое название');
        expect(card.querySelector<HTMLImageElement>('.card__image')!.getAttribute('src')).toBe('/second.svg');
        expect(card.querySelector('.card__category')!.classList.contains('card__category_soft')).toBe(false);
        expect(card.querySelector('.card__category')!.classList.contains('card__category_hard')).toBe(true);
    });
});
