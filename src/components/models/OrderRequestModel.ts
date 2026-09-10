import { IOrderResponse, TOrderRequestState } from '../../types';
import { appEvents } from '../../utils/constants';
import { IEvents } from '../base/Events';

export class OrderRequestModel {
    private state: TOrderRequestState = { pending: false, error: '', receipt: null };

    constructor(private readonly events: IEvents) {}

    getState(): TOrderRequestState {
        return { ...this.state };
    }

    start(): void {
        this.state = { pending: true, error: '', receipt: null };
        this.events.emit(appEvents.requestChanged);
    }

    complete(receipt: IOrderResponse): void {
        this.state = { pending: false, error: '', receipt };
        this.events.emit(appEvents.requestChanged);
    }

    fail(error: string): void {
        this.state = { pending: false, error, receipt: null };
        this.events.emit(appEvents.requestChanged);
    }

    reset(): void {
        this.state = { pending: false, error: '', receipt: null };
        this.events.emit(appEvents.requestChanged);
    }
}
