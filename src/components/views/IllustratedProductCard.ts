import { TIllustratedCard } from '../../types';
import { categoryMap } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { ProductCard } from './ProductCard';

export abstract class IllustratedProductCard<T extends TIllustratedCard> extends ProductCard<T> {
    protected readonly imageElement: HTMLImageElement;
    protected readonly categoryElement: HTMLElement;

    protected constructor(container: HTMLElement) {
        super(container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', container);
        this.categoryElement = ensureElement('.card__category', container);
    }

    set title(value: string) {
        super.title = value;
        this.imageElement.alt = value;
    }

    set image(value: string) {
        this.setImage(this.imageElement, value);
    }

    set category(value: string) {
        this.categoryElement.textContent = value;
        this.categoryElement.classList.remove(...Object.values(categoryMap));
        const modifier = categoryMap[value as keyof typeof categoryMap];
        this.categoryElement.classList.add(modifier ?? categoryMap['другое']);
    }
}
