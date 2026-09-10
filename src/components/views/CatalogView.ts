import { TCatalogView } from '../../types';
import { Component } from '../base/Component';

export class CatalogView extends Component<TCatalogView> {
    constructor(container: HTMLElement) {
        super(container);
    }

    set items(elements: HTMLElement[]) {
        this.container.replaceChildren(...elements);
    }
}
