import { THeaderView } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class HeaderView extends Component<THeaderView> {
    protected readonly counterElement: HTMLElement;
    protected readonly basketButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.counterElement = ensureElement('.header__basket-counter', container);
        this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);
        this.basketButton.addEventListener('click', () => events.emit(appEvents.cartOpened));
    }

    set count(value: number) {
        this.counterElement.textContent = String(value);
        this.basketButton.setAttribute('aria-label', `Корзина. Товаров: ${value}`);
    }
}
