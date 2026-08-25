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
