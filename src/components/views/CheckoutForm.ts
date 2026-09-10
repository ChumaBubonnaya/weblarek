import { TFormState } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export abstract class CheckoutForm<T extends TFormState> extends Component<T> {
    protected readonly submitButton: HTMLButtonElement;
    protected readonly errorsElement: HTMLElement;

    protected constructor(container: HTMLFormElement, events: IEvents, submitEvent: string) {
        super(container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
        this.errorsElement = ensureElement('.form__errors', container);
        this.errorsElement.setAttribute('aria-live', 'polite');
        container.noValidate = true;
        container.addEventListener('submit', (event) => {
            event.preventDefault();
            events.emit(submitEvent);
        });
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    set errors(value: string) {
        this.errorsElement.textContent = value;
    }

    set busy(value: boolean) {
        this.container.setAttribute('aria-busy', String(value));
    }
}
