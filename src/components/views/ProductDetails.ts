import { TProductDetails } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { IllustratedProductCard } from './IllustratedProductCard';

export class ProductDetails extends IllustratedProductCard<TProductDetails> {
    protected readonly descriptionElement: HTMLElement;
    protected readonly actionButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.descriptionElement = ensureElement('.card__text', container);
        this.actionButton = ensureElement<HTMLButtonElement>('.card__button', container);
        this.actionButton.addEventListener('click', () => events.emit(appEvents.productAction));
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set actionText(value: string) {
        this.actionButton.textContent = value;
    }

    set actionDisabled(value: boolean) {
        this.actionButton.disabled = value;
    }
}
