import './scss/styles.scss';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { LarekApi } from './components/LarekApi';
import { BuyerModel } from './components/models/BuyerModel';
import { CartModel } from './components/models/CartModel';
import { CatalogModel } from './components/models/CatalogModel';
import { OrderRequestModel } from './components/models/OrderRequestModel';
import { CartLine } from './components/views/CartLine';
import { CartView } from './components/views/CartView';
import { CatalogTile } from './components/views/CatalogTile';
import { CatalogView } from './components/views/CatalogView';
import { ContactForm } from './components/views/ContactForm';
import { DeliveryForm } from './components/views/DeliveryForm';
import { HeaderView } from './components/views/HeaderView';
import { LoadErrorView } from './components/views/LoadErrorView';
import { ModalView } from './components/views/ModalView';
import { ProductDetails } from './components/views/ProductDetails';
import { ReceiptView } from './components/views/ReceiptView';
import { IBuyer, IOrder, TProductSelection } from './types';
import { API_URL, CDN_URL, appEvents } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

const events = new EventEmitter();
const appApi = new LarekApi(new Api(API_URL));
const catalog = new CatalogModel(events);
const cart = new CartModel(events);
const buyer = new BuyerModel(events);
const orderRequest = new OrderRequestModel(events);

const templates = {
    tile: ensureElement<HTMLTemplateElement>('#card-catalog'),
    line: ensureElement<HTMLTemplateElement>('#card-basket'),
};
const gallery = new CatalogView(ensureElement('.gallery'));
const header = new HeaderView(ensureElement('.header'), events);
const modal = new ModalView(ensureElement('#modal-container'));
const details = new ProductDetails(cloneTemplate('#card-preview'), events);
const basket = new CartView(cloneTemplate('#basket'), events);
const delivery = new DeliveryForm(cloneTemplate<HTMLFormElement>('#order'), events);
const contacts = new ContactForm(cloneTemplate<HTMLFormElement>('#contacts'), events);
const receipt = new ReceiptView(cloneTemplate('#success'), events);
const loadError = new LoadErrorView(cloneTemplate('#catalog-error'), events);

function openModal(content: HTMLElement): void {
    modal.render({ content });
    modal.open();
}

function renderCart(): void {
    const items = cart.getProducts().map((product, index) => {
        // Брокер создаёт адаптер события; callback вызывается представлением.
        const onRemove = events.trigger<TProductSelection>(appEvents.productRemoved, { id: product.id });
        const line = new CartLine(cloneTemplate(templates.line), onRemove);
        return line.render({
            title: product.title,
            price: product.price,
            position: index + 1,
        });
    });
    basket.render({ items, total: cart.getTotalPrice(), canCheckout: items.length > 0 });
    header.render({ count: cart.getAmountProducts() });
}

function renderProductAction(): void {
    const product = catalog.getSelectedProduct();
    if (!product) return;
    const available = product.price !== null;
    details.render({
        actionText: available
            ? (cart.checkProduct(product.id) ? 'Удалить из корзины' : 'Купить')
            : 'Недоступно',
        actionDisabled: !available,
    });
}

function renderForms(): void {
    const data = buyer.getData();
    const errors = buyer.validate();
    delivery.render({
        payment: data.payment,
        address: data.address,
        errors: [errors.payment, errors.address].filter(Boolean).join('. '),
        valid: !errors.payment && !errors.address,
    });
    contacts.render({
        email: data.email,
        phone: data.phone,
        errors: [errors.email, errors.phone].filter(Boolean).join('. '),
        valid: !errors.email && !errors.phone,
    });
}

async function loadCatalog(): Promise<void> {
    try {
        const data = await appApi.getProductList();
        catalog.setProducts(data.items);
    } catch {
        openModal(loadError.render({ message: 'Проверьте подключение к интернету и попробуйте ещё раз.' }));
    }
}

events.on(appEvents.catalogChanged, () => {
    gallery.render({
        items: catalog.getProducts().map((product) => {
            const onSelect = events.trigger<TProductSelection>(appEvents.productSelected, { id: product.id });
            const tile = new CatalogTile(cloneTemplate(templates.tile), onSelect);
            return tile.render({
                title: product.title,
                price: product.price,
                image: `${CDN_URL}${product.image}`,
                category: product.category,
            });
        }),
    });
});

events.on<TProductSelection>(appEvents.productSelected, ({ id }) => {
    const product = catalog.getProduct(id);
    if (product) catalog.setSelectedProduct(product);
});

events.on(appEvents.selectionChanged, () => {
    const product = catalog.getSelectedProduct();
    if (!product) return;
    details.render({
        title: product.title,
        price: product.price,
        image: `${CDN_URL}${product.image}`,
        category: product.category,
        description: product.description,
    });
    renderProductAction();
    openModal(details.render());
});

events.on(appEvents.productAction, () => {
    const product = catalog.getSelectedProduct();
    if (!product || product.price === null) return;
    if (cart.checkProduct(product.id)) cart.removeProduct(product.id);
    else cart.addProduct(product);
    modal.close();
});

events.on(appEvents.cartChanged, () => {
    renderCart();
    renderProductAction();
});

events.on<TProductSelection>(appEvents.productRemoved, ({ id }) => {
    if (cart.checkProduct(id)) cart.removeProduct(id);
});

events.on(appEvents.cartOpened, () => {
    openModal(basket.render());
});

events.on(appEvents.checkoutStarted, () => {
    if (!cart.getAmountProducts() || orderRequest.getState().pending) return;
    orderRequest.reset();
    openModal(delivery.render());
});

events.on<Partial<IBuyer>>(appEvents.buyerInput, (data) => {
    buyer.setData(data);
});

events.on(appEvents.buyerChanged, renderForms);

events.on(appEvents.deliverySubmitted, () => {
    const errors = buyer.validate();
    if (errors.payment || errors.address) return;
    openModal(contacts.render());
});

events.on(appEvents.contactsSubmitted, async () => {
    const errors = buyer.validate();
    if (errors.email || errors.phone) return;
    const data = buyer.getData();
    const order: IOrder = {
        ...data,
        address: data.address.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        total: cart.getTotalPrice(),
        items: cart.getProducts().map((product) => product.id),
    };
    orderRequest.start();
    try {
        orderRequest.complete(await appApi.orderProducts(order));
    } catch {
        orderRequest.fail('Не удалось отправить заказ. Попробуйте оплатить ещё раз');
    }
});

events.on(appEvents.requestChanged, () => {
    const request = orderRequest.getState();
    contacts.render({ busy: request.pending, requestError: request.error });
    if (request.receipt) {
        cart.clearCart();
        buyer.clearData();
        openModal(receipt.render({ total: request.receipt.total }));
    }
});

events.on(appEvents.receiptClosed, () => modal.close());
events.on(appEvents.catalogRetried, () => {
    modal.close();
    void loadCatalog();
});

// Начальное состояние форм поступает из модели после установки подписок.
buyer.clearData();
void loadCatalog();
