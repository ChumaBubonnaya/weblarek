import { IOrder, IApi, IOrderResponse, IProductListResponse } from "../types";

export class LarekApi {
    private _api: IApi;

    constructor (api: IApi) {
        this._api = api
    }

    getProductList(): Promise<IProductListResponse> {
        return this._api.get<IProductListResponse>('/product');
    }

    orderProducts(order: IOrder): Promise<IOrderResponse> {
        return this._api.post<IOrderResponse>('/order', order);
    }
}