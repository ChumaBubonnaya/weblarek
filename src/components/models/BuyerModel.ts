import { IBuyer, TFormErrors} from "../../types";
import { IEvents } from "../base/Events";
import { appEvents } from "../../utils/constants";

export class BuyerModel {
    private payment: IBuyer['payment'] = '';
    private address: string = '';
    private phone: string = '';
    private email: string = '';

    constructor(protected events: IEvents) {}

    setData(data: Partial<IBuyer>): void {
        if (data.address !== undefined) this.address = data.address;
        if (data.email !== undefined) this.email = data.email;
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.phone !== undefined) this.phone = data.phone;
        this.events.emit(appEvents.buyerChanged);
    }

    getData(): IBuyer {
        return {
            address: this.address,
            email: this.email,
            payment: this.payment,
            phone: this.phone
        };
    }

    clearData(): void {
        this.address = '';
        this.email = '';
        this.payment = '';
        this.phone = '';
        this.events.emit(appEvents.buyerChanged);
    }

    validate(): TFormErrors {
        const error: TFormErrors = {};

        if (!this.address.trim()) {
            error.address = 'Не выбран адрес доставки';
        }
        if (!this.email.trim()) {
            error.email = 'Не указан Email';
        }
        if (!this.payment.trim()) {
            error.payment = 'Не указан способ оплаты';
        }
        if (!this.phone.trim()) {
            error.phone = 'Не указан номер телефона';
        }

        return error;
    }
}
