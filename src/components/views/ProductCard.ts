import { TCardContent } from '../../types';
import { categoryMap } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

export abstract class ProductCard<T extends TCardContent> extends Component<T> {
    protected readonly titleElement: HTMLElement;
    protected readonly priceElement: HTMLElement;
    protected readonly imageElement: HTMLImageElement | null;
    protected readonly categoryElement: HTMLElement | null;

    protected constructor(container: HTMLElement) {
        super(container);
        this.titleElement = ensureElement('.card__title', container);
        this.priceElement = ensureElement('.card__price', container);
        // В компактном шаблоне нет изображения и категории.
        this.imageElement = container.querySelector('.card__image');
        this.categoryElement = container.querySelector('.card__category');
    }

    set title(value: string) {
        this.titleElement.textContent = value;
        if (this.imageElement) this.imageElement.alt = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value === null ? 'Бесценно' : `${value} синапсов`;
    }

    set image(value: string) {
        if (this.imageElement) this.setImage(this.imageElement, value);
    }

    set category(value: string) {
        if (!this.categoryElement) return;
        this.categoryElement.textContent = value;
        this.categoryElement.classList.remove(...Object.values(categoryMap));
        const modifier = categoryMap[value as keyof typeof categoryMap];
        this.categoryElement.classList.add(modifier ?? categoryMap['другое']);
    }
}
