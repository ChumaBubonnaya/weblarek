import { IProduct } from "../../types";
import { IEvents } from "../base/Events";
import { appEvents } from "../../utils/constants";

export class CatalogModel {
    private products: IProduct[] = [];
    private selectedProduct: IProduct | null = null;

    constructor(protected events: IEvents) {}

    setProducts(products: IProduct[]): void {
        this.products = products;
        this.events.emit(appEvents.catalogChanged);
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    getProduct(id: string): IProduct | undefined {
        return this.products.find((item) => item.id === id);
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProduct = product;
        this.events.emit(appEvents.selectionChanged);
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}
