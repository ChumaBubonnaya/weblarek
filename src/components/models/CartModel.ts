import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class CartModel {
    private products: IProduct[] = []

    constructor(protected events: IEvents) {}

    getProducts(): IProduct[] {
        return this.products;
    }

    addProduct(product: IProduct): void {
        this.products.push(product);
    }

    removeProduct(id: string): void {
        this.products = this.products.filter((item) => item.id !== id);
    }

    clearCart():void {
        this.products = [];
    }

    getTotalPrice(): number {
        return this.products.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    getAmountProducts(): number {
        return this.products.length;
    }

    checkProduct(id: string): boolean {
        return this.products.some((item) => item.id === id);
    }
}