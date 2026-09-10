import { TLoadErrorView } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class LoadErrorView extends Component<TLoadErrorView> {
    protected readonly messageElement: HTMLElement;
    protected readonly retryButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.messageElement = ensureElement('.catalog-error__message', container);
        this.retryButton = ensureElement<HTMLButtonElement>('.catalog-error__retry', container);
        this.retryButton.addEventListener('click', () => events.emit(appEvents.catalogRetried));
    }

    set message(value: string) {
        this.messageElement.textContent = value;
    }
}
