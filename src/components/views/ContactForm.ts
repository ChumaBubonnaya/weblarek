import { IBuyer, TContactView } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { CheckoutForm } from './CheckoutForm';

export class ContactForm extends CheckoutForm<TContactView> {
    protected readonly emailInput: HTMLInputElement;
    protected readonly phoneInput: HTMLInputElement;
    protected readonly submitGroup: HTMLFieldSetElement;
    protected readonly requestErrorElement: HTMLElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events, appEvents.contactsSubmitted);
        this.emailInput = ensureElement<HTMLInputElement>('[name="email"]', container);
        this.phoneInput = ensureElement<HTMLInputElement>('[name="phone"]', container);
        this.submitGroup = ensureElement<HTMLFieldSetElement>('.form__submit', container);
        this.requestErrorElement = ensureElement('.form__request-error', container);
        this.emailInput.addEventListener('input', () => {
            events.emit<Partial<IBuyer>>(appEvents.buyerInput, { email: this.emailInput.value });
        });
        this.phoneInput.addEventListener('input', () => {
            events.emit<Partial<IBuyer>>(appEvents.buyerInput, { phone: this.phoneInput.value });
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    set busy(value: boolean) {
        super.busy = value;
        this.emailInput.disabled = value;
        this.phoneInput.disabled = value;
        // Fieldset блокирует оплату независимо от valid, установленного по данным покупателя.
        this.submitGroup.disabled = value;
    }

    set requestError(value: string) {
        this.requestErrorElement.textContent = value;
    }
}
