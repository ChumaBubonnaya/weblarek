import './scss/styles.scss';
import { CatalogModel } from './components/models/CatalogModel';
import { CartModel } from './components/models/CartModel';
import { BuyerModel } from './components/models/BuyerModel';
import { EventEmitter } from './components/base/Events';
import { apiProducts } from './utils/data';
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { LarekApi } from './components/LarekApi';

const events = new EventEmitter();
const baseApi = new Api(API_URL);
const appApi = new LarekApi(baseApi);

const catalog = new CatalogModel(events);
catalog.setProducts(apiProducts.items);
console.log('Массив товаров из каталога:', catalog.getProducts());
console.log('Получение товара по id: ', catalog.getProduct(catalog.getProducts()[0].id));
catalog.setSelectedProduct(catalog.getProducts()[0])
console.log('получение товара для подробного отображения', catalog.getSelectedProduct());

const cart = new CartModel(events);
const product1 = apiProducts.items[0];
const product2 = apiProducts.items[1];
cart.addProduct(product1);
cart.addProduct(product2);
console.log('получение массива товаров, которые находятся в корзине' ,cart.getProducts())
console.log('получение стоимости всех товаров в корзине', cart.getTotalPrice());
console.log('получение количества товаров в корзине', cart.getAmountProducts());
console.log('проверка наличия товара в корзине по его id, полученного в параметр метода', cart.checkProduct(product1.id));
cart.removeProduct(product1.id);
console.log('проверка наличия товара в корзине по его id, полученного в параметр метода', cart.checkProduct(product1.id));
cart.clearCart();
console.log('корзина после очистки' ,cart.getProducts());

const buyer = new BuyerModel(events);
console.log('ошибки при пустой форме', buyer.validate());
buyer.setData({address: 'Мельникайте 10'});
console.log('данные формы с заполненным адресом', buyer.getData());
console.log('валидация с заполненным адресом', buyer.validate());
buyer.setData( {
    payment: 'card',
    phone: '+375 44 348 726 7',
    email: 'exampleemail@gmail.com'
});
console.log('данные после заполнения всех полей', buyer.getData());
console.log('валидация после заполнения всех данных', buyer.validate());
buyer.clearData();
console.log('данные после очистки всез полей', buyer.getData())

appApi.getProductList().then((data) => {
    catalog.setProducts(data.items);
    console.log('массив товаров полученный с сервера: ', catalog.getProducts())
}).catch((error) => {
    console.error('Проблема с загрузкой товаров с сервера', error);
})
