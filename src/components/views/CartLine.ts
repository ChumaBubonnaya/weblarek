import { TCartLine } from '../../types';
import { ensureElement } from '../../utils/utils';
import { ProductCard } from './ProductCard';

export class CartLine extends ProductCard<TCartLine> {
    protected readonly positionElement: HTMLElement;
    protected readonly removeButton: HTMLButtonElement;

    constructor(container: HTMLElement, onRemove: () => void) {
        super(container);
        this.positionElement = ensureElement('.basket__item-index', container);
        this.removeButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);
        this.removeButton.addEventListener('click', onRemove);
    }

    set position(value: number) {
        this.positionElement.textContent = String(value);
    }

    set removeDisabled(value: boolean) {
        this.removeButton.disabled = value;
    }
}
