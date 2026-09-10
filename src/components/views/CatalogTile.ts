import { TCatalogTile } from '../../types';
import { ProductCard } from './ProductCard';

export class CatalogTile extends ProductCard<TCatalogTile> {
    constructor(container: HTMLElement, onSelect: () => void) {
        super(container);
        this.container.addEventListener('click', onSelect);
    }
}
