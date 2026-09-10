import { IBuyer, TDeliveryForm } from '../../types';
import { appEvents } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { CheckoutForm } from './CheckoutForm';

export class DeliveryForm extends CheckoutForm<TDeliveryForm> {
    protected readonly addressInput: HTMLInputElement;
    protected readonly cardButton: HTMLButtonElement;
    protected readonly cashButton: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events, appEvents.deliverySubmitted);
        this.addressInput = ensureElement<HTMLInputElement>('[name="address"]', container);
        this.cardButton = ensureElement<HTMLButtonElement>('[name="card"]', container);
        this.cashButton = ensureElement<HTMLButtonElement>('[name="cash"]', container);
        this.addressInput.addEventListener('input', () => {
            events.emit<Partial<IBuyer>>(appEvents.buyerInput, { address: this.addressInput.value });
        });
        this.cardButton.addEventListener('click', () => {
            events.emit<Partial<IBuyer>>(appEvents.buyerInput, { payment: 'card' });
        });
        this.cashButton.addEventListener('click', () => {
            events.emit<Partial<IBuyer>>(appEvents.buyerInput, { payment: 'cash' });
        });
    }

    set address(value: string) {
        this.addressInput.value = value;
    }

    set payment(value: IBuyer['payment']) {
        this.cardButton.classList.toggle('button_alt-active', value === 'card');
        this.cashButton.classList.toggle('button_alt-active', value === 'cash');
        this.cardButton.setAttribute('aria-pressed', String(value === 'card'));
        this.cashButton.setAttribute('aria-pressed', String(value === 'cash'));
    }

    set busy(value: boolean) {
        super.busy = value;
        this.addressInput.disabled = value;
        this.cardButton.disabled = value;
        this.cashButton.disabled = value;
    }
}
