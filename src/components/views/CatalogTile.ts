import { TCatalogTile } from '../../types';
import { IllustratedProductCard } from './IllustratedProductCard';

export class CatalogTile extends IllustratedProductCard<TCatalogTile> {
    constructor(container: HTMLElement, onSelect: () => void) {
        super(container);
        this.container.addEventListener('click', onSelect);
    }
}
