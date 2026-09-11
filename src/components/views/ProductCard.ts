import { TCardBase } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

export abstract class ProductCard<T extends TCardBase> extends Component<T> {
    protected readonly titleElement: HTMLElement;
    protected readonly priceElement: HTMLElement;

    protected constructor(container: HTMLElement) {
        super(container);
        this.titleElement = ensureElement('.card__title', container);
        this.priceElement = ensureElement('.card__price', container);
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value === null ? 'Бесценно' : `${value} синапсов`;
    }
}
