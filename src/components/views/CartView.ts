import { TCartView } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class CartView extends Component<TCartView> {
    protected readonly listElement: HTMLElement;
    protected readonly totalElement: HTMLElement;
    protected readonly checkoutButton: HTMLButtonElement;
    protected readonly emptyElement: HTMLElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.listElement = ensureElement('.basket__list', container);
        this.totalElement = ensureElement('.basket__price', container);
        this.checkoutButton = ensureElement<HTMLButtonElement>('.basket__button', container);
        this.emptyElement = document.createElement('li');
        this.emptyElement.className = 'basket__empty';
        this.emptyElement.textContent = 'Корзина пуста';
        this.items = [];
        this.total = 0;
        this.canCheckout = false;
        this.checkoutButton.addEventListener('click', () => events.emit(appEvents.checkoutStarted));
    }

    set items(elements: HTMLElement[]) {
        this.listElement.replaceChildren(...(elements.length ? elements : [this.emptyElement]));
    }

    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }

    set canCheckout(value: boolean) {
        this.checkoutButton.disabled = !value;
    }
}
