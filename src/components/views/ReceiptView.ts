import { TReceiptView } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class ReceiptView extends Component<TReceiptView> {
    protected readonly descriptionElement: HTMLElement;
    protected readonly closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.descriptionElement = ensureElement('.order-success__description', container);
        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        this.closeButton.addEventListener('click', () => events.emit(appEvents.closeRequested));
    }

    set total(value: number) {
        this.descriptionElement.textContent = `Списано ${value} синапсов`;
    }
}
