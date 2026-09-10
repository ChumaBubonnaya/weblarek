export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type TPayment = 'card' | 'cash' ;

export interface IProduct {
    id: string;
    title: string;
    image: string;
    price: number | null;
    category: string;
    description: string;
}

export interface IBuyer {
    payment: TPayment | '';
    address: string;
    phone: string;
    email: string;
}

export type TFormErrors = Partial<Record<keyof IBuyer, string>>;

export interface IProductListResponse {
    total: number,
    items: IProduct[]
}

export interface IOrder extends IBuyer{
    total: number,
    items: string[]
}

export interface IOrderResponse {
    id: string,
    total: number
}

// Данные представлений выводятся из контрактов прошлого спринта.
export type TCardContent = Pick<IProduct, 'title' | 'price'> &
    Partial<Pick<IProduct, 'image' | 'category'>>;
export type TCatalogTile = Omit<IProduct, 'id' | 'description'>;
export type TProductDetails = Omit<IProduct, 'id'> & {
    actionText: string;
    actionDisabled: boolean;
};
export type TCartLine = Pick<IProduct, 'title' | 'price'> & {
    position: number;
    removeDisabled: boolean;
};
export type TProductSelection = Pick<IProduct, 'id'>;
export type TFormState = { valid: boolean; errors: string; busy: boolean };
export type TDeliveryForm = Pick<IBuyer, 'payment' | 'address'> & TFormState;
export type TContactForm = Pick<IBuyer, 'email' | 'phone'> & TFormState;
export type TCatalogView = { items: HTMLElement[] };
export type THeaderView = { count: number };
export type TCartView = TCatalogView & { total: number; canCheckout: boolean };
export type TModalView = { content: HTMLElement };
export type TReceiptView = Pick<IOrderResponse, 'total'>;
export type TLoadErrorView = { message: string };
export type TOrderRequestState = {
    pending: boolean;
    error: string;
    receipt: IOrderResponse | null;
};
