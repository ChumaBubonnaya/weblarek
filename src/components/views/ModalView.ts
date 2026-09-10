import { TModalView } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class ModalView extends Component<TModalView> {
    protected readonly contentElement: HTMLElement;
    protected readonly closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.contentElement = ensureElement('.modal__content', container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this.closeButton.addEventListener('click', () => events.emit(appEvents.closeRequested));
        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) events.emit(appEvents.closeRequested);
        });
        this.container.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') events.emit(appEvents.closeRequested);
        });
    }

    set content(element: HTMLElement) {
        this.contentElement.replaceChildren(element);
    }

    open(): void {
        this.container.classList.add('modal_active');
        this.container.setAttribute('aria-hidden', 'false');
        this.closeButton.focus();
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.container.setAttribute('aria-hidden', 'true');
        this.contentElement.replaceChildren();
    }
}
