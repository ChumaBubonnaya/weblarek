# Веб-ларёк

Учебный интернет-магазин на TypeScript, HTML и SCSS. Каталог приходит с API:
покупатель открывает карточки, собирает корзину, указывает доставку и контакты,
отправляет заказ и видит подтверждение с суммой ответа сервера.

## Запуск

Нужен Node.js 22.12+ (или 20.19+) и npm.

1. Выполните `npm ci` в папке проекта.
2. Скопируйте `.env.example` в `.env` в корне проекта. В PowerShell:
   `Copy-Item .env.example .env`; в bash: `cp .env.example .env`.
3. Проверьте строку `VITE_API_ORIGIN=https://larek-api.nomoreparties.co`.
4. Выполните `npm run dev` и откройте адрес, который выведет Vite.

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Сервер разработки |
| `npm run build` | Проверка TypeScript и сборка в `dist` |
| `npm run preview` | Просмотр предварительно собранного приложения |
| `npm test` | Проверки интерфейса и событий в Vitest/jsdom |

`.env` не добавляется в Git. При изменении переменных окружения перезапустите
сервер разработки. На GitHub Pages нужно публиковать результат сборки,
а не исходный `index.html` с TypeScript.

## Организация кода

| Путь | Содержимое |
| --- | --- |
| `index.html` | Страница, контейнер модального окна и шаблоны компонентов |
| `src/main.ts` | Создание объектов, обработчики событий и запрос каталога |
| `src/types/index.ts` | Контракты API, предметной области и входных данных View |
| `src/components/base/` | `Api`, `Component`, `EventEmitter` |
| `src/components/models/` | Каталог, корзина, покупатель, состояние отправки |
| `src/components/views/` | Классы интерфейса |
| `src/components/LarekApi.ts` | Запросы каталога и заказа |
| `src/utils/constants.ts` | Адреса API/CDN, категории и имена событий |
| `src/utils/utils.ts` | Утилиты поиска элементов и клонирования шаблонов |
| `src/common.blocks/`, `src/scss/` | Блоки стилей, переменные, миксины |
| `tests/storefront.test.ts` | Сценарии магазина и регрессии презентера с подменой API |
| `tests/views.test.ts` | Проверки самостоятельных компонентов представления |

Файл `src/pages/index.html` и данные `src/utils/data.ts` остались от стартового
набора. Точкой входа Vite является корневой `index.html`; тестовые данные
не подключены в приложение.

## Архитектура MVP

**Model** хранит данные, предоставляет методы изменения и чтения и сообщает об
изменениях через брокер событий. Модели не обращаются к DOM или API.

**View** отвечает за свой блок HTML. Элементы находятся в конструкторе и
сохраняются в полях; обработчики устанавливаются там же один раз.
Сеттеры записывают переданные значения в DOM. Представления не хранят копии
товаров, корзины или покупателя, не запрашивают модели и не вызывают API.
У них нет геттеров для извлечения данных из интерфейса.

**Presenter** связывает слои в `main.ts`: обрабатывает события, запрашивает
модели, готовит параметры отображения и управляет последовательностью окон.

Обычный цикл: действие в View → событие → обработчик презентера → изменение
модели → событие модели → обновление View. При открытии корзины и форм
используется уже подготовленный DOM: `render()` без аргументов возвращает его
без повторной записи данных. Покупка и удаление не выполняются в карточках.
Форматирование цены, вывод ошибки и выбор CSS-модификатора — ответственность View;
доступность покупки, проверка корзины и переходы между шагами — презентера.

### Сохранение контрактов прошлого спринта

Исходные интерфейсы и типы не изменены. У `CatalogModel`, `CartModel` и
`BuyerModel` сохранены методы, поля и алгоритмы. В методы изменения добавлены
события. Исправлена только несовместимая аннотация поля `BuyerModel.payment`:
`IBuyer['payment']` допускает пустую строку, которую модель использует при
инициализации и очистке. Сам `TPayment` по-прежнему равен `'card' | 'cash'`.
При исправлении замечаний ревьюера модели не менялись; новые типы добавлены
после существующих объявлений и получены из них через утилитарные типы.

## Типы данных

Все прикладные типы находятся в `src/types/index.ts`.

| Тип | Поля и назначение |
| --- | --- |
| `ApiPostMethods` | `'POST' \| 'PUT' \| 'DELETE'` |
| `IApi` | `get<T extends object>(uri: string): Promise<T>`; `post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>` |
| `TPayment` | `'card' \| 'cash'` — варианты оплаты |
| `IProduct` | `id`, `title`, `image`, `category`, `description`: `string`; `price: number \| null` |
| `IBuyer` | `payment: TPayment \| ''`; `address`, `phone`, `email`: `string` |
| `TFormErrors` | `Partial<Record<keyof IBuyer, string>>`, сообщения по незаполненным полям |
| `IProductListResponse` | `total: number`, `items: IProduct[]` |
| `IOrder` | Расширяет `IBuyer`: `total: number`, `items: string[]` — идентификаторы товаров |
| `IOrderResponse` | `id: string`, `total: number` — подтверждение сервера |

Производные типы для интерфейса:

| Тип | Состав |
| --- | --- |
| `TCardContent` | `Pick<IProduct, 'title' \| 'price'>` и необязательные `image`, `category` |
| `TCatalogTile` | `Omit<IProduct, 'id' \| 'description'>` |
| `TProductDetails` | `Omit<IProduct, 'id'>`, `actionText: string`, `actionDisabled: boolean` |
| `TCartLine` | `title`, `price` из `IProduct`, `position: number`, `removeDisabled: boolean` |
| `TProductSelection` | `Pick<IProduct, 'id'>`, полезная нагрузка выбора/удаления |
| `TFormState` | `valid: boolean`, `errors: string`, `busy: boolean` |
| `TDeliveryForm` | `Pick<IBuyer, 'payment' \| 'address'> & TFormState` |
| `TContactForm` | `Pick<IBuyer, 'email' \| 'phone'> & TFormState` |
| `TCatalogView` | `items: HTMLElement[]` |
| `THeaderView` | `count: number` |
| `TCartView` | `TCatalogView`, `total: number`, `canCheckout: boolean` |
| `TModalView` | `content: HTMLElement` |
| `TReceiptView` | `Pick<IOrderResponse, 'total'>` |
| `TLoadErrorView` | `message: string` |
| `TOrderRequestState` | `pending: boolean`, `error: string`, `receipt: IOrderResponse \| null` |
| `TCardBase` | `Pick<TCardContent, 'title' \| 'price'>` — общие данные всех карточек |
| `TIllustratedCard` | `TCardBase` и обязательные `image`, `category`, полученные через `Required<Pick<...>>` |
| `TContactView` | `TContactForm & { requestError: string }` — отдельное сообщение ошибки запроса |

## Базовые классы

### Component<T>

Абстрактная основа представления. Защищённый конструктор
`constructor(container: HTMLElement)` сохраняет корневой узел в
`protected readonly container: HTMLElement`.

- `render(data?: Partial<T>): HTMLElement` вызывает сеттеры через `Object.assign`
  и возвращает контейнер. Без аргументов возвращает тот же элемент.
- `protected setImage(element: HTMLImageElement, src: string, alt?: string): void`
  устанавливает изображение и альтернативный текст.

### Api

Базовый HTTP-клиент. Конструктор
`constructor(baseUrl: string, options: RequestInit = {})` принимает адрес и настройки
заголовков. Поля: `readonly baseUrl: string`, `protected options: RequestInit`.

- `get<T extends object>(uri: string): Promise<T>` выполняет GET.
- `post<T extends object>(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<T>`
  отправляет JSON.
- `protected handleResponse<T>(response: Response): Promise<T>` разбирает JSON,
  отклоняет промис при ошибке HTTP.

### EventEmitter

Реализует `IEvents`. `constructor()` создаёт
`_events: Map<string | RegExp, Set<Function>>`, коллекцию подписок.
Базовые вспомогательные типы брокера находятся в `base/Events.ts`.

- `on<T extends object>(eventName: string | RegExp, callback: (event: T) => void): void`
  подписывает обработчик.
- `off(eventName: string | RegExp, callback: Function): void` удаляет подписку.
- `emit<T extends object>(eventName: string, data?: T): void` уведомляет подписчиков.
- `onAll(callback: (event: { eventName: string; data: unknown }) => void): void`
  подписывает на все события.
- `offAll(): void` удаляет подписки.
- `trigger<T extends object>(eventName: string, context?: Partial<T>): (event?: object) => void`
  создаёт обработчик, который эмитит событие с заданным контекстом.

## Модели

Три исходные модели принимают `constructor(events: IEvents)` и сохраняют
`protected events: IEvents`. Изменения сообщаются после записи полей.

### CatalogModel

Хранит `private products: IProduct[]` и
`private selectedProduct: IProduct | null`.

| Метод | Результат |
| --- | --- |
| `setProducts(products: IProduct[]): void` | Заменяет каталог, эмитит `catalog:changed` |
| `getProducts(): IProduct[]` | Возвращает каталог |
| `getProduct(id: string): IProduct \| undefined` | Ищет товар по id |
| `setSelectedProduct(product: IProduct): void` | Запоминает товар, эмитит `catalog:selection-changed` |
| `getSelectedProduct(): IProduct \| null` | Возвращает выбранный товар |

### CartModel

Хранит `private products: IProduct[]` — содержимое корзины.

| Метод | Результат |
| --- | --- |
| `getProducts(): IProduct[]` | Возвращает позиции |
| `addProduct(product: IProduct): void` | Добавляет товар, эмитит `cart:changed` |
| `removeProduct(id: string): void` | Удаляет товар, эмитит `cart:changed` |
| `clearCart(): void` | Очищает корзину, эмитит `cart:changed` |
| `getTotalPrice(): number` | Сумма цен; `null` даёт нулевой вклад |
| `getAmountProducts(): number` | Количество позиций |
| `checkProduct(id: string): boolean` | Наличие товара |

Презентер проверяет наличие товара перед добавлением, чтобы исключить дубликаты,
и не добавляет товар с ценой `null`. Методы чтения массивов исходных моделей
возвращают их текущие массивы: презентер не изменяет эти массивы напрямую.

### BuyerModel

Поля: `private payment: IBuyer['payment']`, `private address: string`,
`private phone: string`, `private email: string`.

- `setData(data: Partial<IBuyer>): void` обновляет только переданные поля и эмитит `buyer:changed`.
- `getData(): IBuyer` возвращает объект покупателя.
- `clearData(): void` устанавливает пустые строки и эмитит `buyer:changed`.
- `validate(): TFormErrors` проверяет заполненность каждого поля с учётом `trim()`.

Алгоритм валидации прошлого спринта сохранён: проверяется заполненность,
дополнительные ограничения формата email и телефона не вводятся.
Для первого шага презентер берёт ошибки оплаты и адреса, для второго — контактов.

### OrderRequestModel

Хранит состояние отправки, не дублируя корзину и покупателя.
`constructor(events: IEvents)` сохраняет `private readonly events: IEvents`.
Поле `private state: TOrderRequestState` изначально содержит
`{ pending: false, error: '', receipt: null }`.

- `getState(): TOrderRequestState` возвращает копию состояния.
- `start(): void` включает ожидание и убирает предыдущую ошибку/квитанцию.
- `complete(receipt: IOrderResponse): void` сохраняет успешный ответ.
- `fail(error: string): void` сохраняет сообщение об ошибке и снимает ожидание.
- `reset(): void` возвращает начальное состояние перед новым оформлением.

Каждый метод изменения эмитит `order-request:changed`.

## Слой коммуникации

### LarekApi

Использует композицию: `constructor(api: IApi)` сохраняет `private _api: IApi`.

- `getProductList(): Promise<IProductListResponse>` запрашивает `/product` через `Api.get`.
- `orderProducts(order: IOrder): Promise<IOrderResponse>` отправляет `/order` через `Api.post`.

`API_URL` объединяет `VITE_API_ORIGIN` и `/api/weblarek`, `CDN_URL` — тот же
origin и `/content/weblarek`. Полный адрес изображения составляет презентер.

## Слой представления

Все представления наследуют `Component<T>`. У каждого доступен
`render(data?: Partial<T>): HTMLElement`; все перечисленные ниже свойства —
**сеттеры**, а не поля с копиями прикладных данных. Элементы в полях
`protected readonly` кешируются при создании компонента. Поля родителей
наследуются; они не перечисляются повторно у дочерних классов.

### ProductCard<T extends TCardBase>

Абстрактный общий родитель трёх вариантов карточки. Защищённый
`constructor(container: HTMLElement)` сохраняет только общие для всех поля:
`titleElement: HTMLElement`, `priceElement: HTMLElement`.
Сеттеры: `title: string` — название; `price: number | null` — цена в синапсах
или «Бесценно». `CartLine` наследует этот класс напрямую.

### IllustratedProductCard<T extends TIllustratedCard>

Промежуточный абстрактный наследник `ProductCard<T>` для каталога и подробностей.
Защищённый `constructor(container: HTMLElement)` сохраняет обязательные
`imageElement: HTMLImageElement` и `categoryElement: HTMLElement`.
В обоих его дочерних шаблонах эти элементы присутствуют.

Сеттер `title: string` вызывает родительский сеттер и обновляет alt;
`image: string` устанавливает готовый URL;
`category: string` устанавливает текст и модификатор из `categoryMap`.
Перед сменой категории старые модификаторы удаляются. Для неизвестной категории
используется оформление «другое». `CatalogTile` и `ProductDetails` наследуют
этот класс; компактная строка корзины не получает ненужных полей и сеттеров.

### CatalogTile

`IllustratedProductCard<TCatalogTile>`, шаблон `#card-catalog`.
`constructor(container: HTMLElement, onSelect: () => void)` устанавливает
обработчик клика по корневой кнопке. Дополнительных полей нет.
Полученный callback создан брокером через `trigger` и передаёт id выбранного товара.

### ProductDetails

`IllustratedProductCard<TProductDetails>`, шаблон `#card-preview`.
`constructor(container: HTMLElement, events: IEvents)` кеширует
`descriptionElement: HTMLElement`, `actionButton: HTMLButtonElement`.
Клик по кнопке сообщает `product:action`; представление не решает, что сделать с товаром.

Сеттеры: `description: string`, `actionText: string`, `actionDisabled: boolean`.
Название «Купить» / «Удалить из корзины» / «Недоступно» определяет презентер.

### CartLine

`ProductCard<TCartLine>`, шаблон `#card-basket`.
`constructor(container: HTMLElement, onRemove: () => void)` кеширует
`positionElement: HTMLElement`, `removeButton: HTMLButtonElement` и устанавливает callback удаления.
Сеттеры `position: number` и `removeDisabled: boolean` управляют номером и доступностью кнопки.
Callback брокера сообщает `cart:remove` с id; строка не хранит объект товара.

### CatalogView

`Component<TCatalogView>`, корневой узел `.gallery`.
`constructor(container: HTMLElement)`. Дополнительных полей нет.
Сеттер `items: HTMLElement[]` размещает готовые карточки через `replaceChildren`.

### HeaderView

`Component<THeaderView>`, корневой узел `.header`.
`constructor(container: HTMLElement, events: IEvents)` сохраняет
`counterElement: HTMLElement`, `basketButton: HTMLButtonElement`.
Кнопка сообщает `cart:open`. Сеттер `count: number` меняет счётчик и доступное имя кнопки.

### CartView

`Component<TCartView>`, шаблон `#basket`.
`constructor(container: HTMLElement, events: IEvents)` кеширует
`listElement`, `totalElement`: `HTMLElement`, `checkoutButton: HTMLButtonElement`.
В конструкторе также создаётся `emptyElement: HTMLElement` — строка «Корзина пуста»,
которая вставляется в список при пустом массиве. Начальное пустое состояние,
нулевой итог и отключённая кнопка устанавливаются в конструкторе. Поэтому
первое открытие не требует отдельной перерисовки.

Сеттеры: `items: HTMLElement[]` — готовые строки или пустое состояние;
`total: number` — сумма; `canCheckout: boolean` — доступность оформления.
Кнопка сообщает `checkout:start`. Сумму и условия оформления компонент не вычисляет.

### ModalView

`Component<TModalView>`, корневой узел `#modal-container`.
`constructor(container: HTMLElement)` сохраняет
`contentElement: HTMLElement`, `closeButton: HTMLButtonElement`.
Крестик, клик непосредственно по фону и Escape вызывают собственный `close()`.
Это локальная операция представления: событие с просьбой закрыть само себя
не генерируется. Клик внутри содержимого не закрывает окно.

- Сеттер `content: HTMLElement` заменяет содержимое.
- `open(): void` включает `modal_active`, обновляет `aria-hidden`, фокусирует крестик.
- `close(): void` убирает модификатор, обновляет `aria-hidden`, отсоединяет содержимое.

Наследников у модального окна нет. Карточка, корзина, формы и результат —
независимые компоненты и могут размещаться в другом контейнере.
Внешнее окно не прокручивается; прокрутка фона заблокирована CSS, длинная корзина
прокручивается внутри собственного списка.

### CheckoutForm<T extends TFormState>

Абстрактный общий родитель двух форм. Защищённый
`constructor(container: HTMLFormElement, events: IEvents, submitEvent: string)`
кеширует `submitButton: HTMLButtonElement`, `errorsElement: HTMLElement`.
Обработчик submit отменяет перезагрузку и сообщает переданное событие.
Проверка данных выполняется моделью и презентером; нативная submit-валидация отключена.

Сеттеры: `valid: boolean` — доступность submit; `errors: string` — сообщение
в области `aria-live`; `busy: boolean` — атрибут `aria-busy`.
Компонент не хранит ошибки или значения полей отдельно от DOM.

### DeliveryForm

`CheckoutForm<TDeliveryForm>`, шаблон `#order`.
`constructor(container: HTMLFormElement, events: IEvents)` передаёт родителю
`delivery:submit`, сохраняет `addressInput: HTMLInputElement`,
`cardButton`, `cashButton`: `HTMLButtonElement`.
Ввод адреса и выбор оплаты сообщают `buyer:input` с изменённым полем.

Сеттеры: `address: string`, `payment: IBuyer['payment']` (модификатор
`button_alt-active` и `aria-pressed`), `busy: boolean` (также блокирует поля и оплату).

### ContactForm

`CheckoutForm<TContactView>`, шаблон `#contacts`.
`constructor(container: HTMLFormElement, events: IEvents)` передаёт родителю
`contacts:submit`, кеширует `emailInput`, `phoneInput`: `HTMLInputElement`,
`submitGroup: HTMLFieldSetElement`, `requestErrorElement: HTMLElement`.
Ввод сообщает `buyer:input`. Сеттеры: `email: string`, `phone: string`,
`busy: boolean` — блокировка полей и группы кнопки оплаты,
`requestError: string` — отдельное сообщение ошибки отправки.

`valid` устанавливает `disabled` самой кнопки только по ошибкам контактов.
`busy` независимо блокирует её родительский `fieldset`, поэтому ожидание
ответа не подменяет результат валидации. После ошибки сервера fieldset
разблокируется; актуальная валидность полей остаётся прежней. Дополнительные
флаги в полях представления не хранятся. Ошибки заполнения и запроса выводятся
в разных DOM-элементах, чтобы изменение одной модели не затирало другую.

### ReceiptView

`Component<TReceiptView>`, шаблон `#success`.
`constructor(container: HTMLElement, events: IEvents)` сохраняет
`descriptionElement: HTMLElement`, `closeButton: HTMLButtonElement`.
Сеттер `total: number` выводит сумму списания. Кнопка «За новыми покупками!»
сообщает собственное событие `receipt:close`. Презентер закрывает `ModalView`;
сама квитанция не управляет другим компонентом.

### LoadErrorView

`Component<TLoadErrorView>`, шаблон `#catalog-error`.
`constructor(container: HTMLElement, events: IEvents)` сохраняет
`messageElement: HTMLElement`, `retryButton: HTMLButtonElement`.
Сеттер `message: string` выводит объяснение сбоя.
Кнопка сообщает `catalog:retry`; запрос выполняет презентер.

## События

Имена централизованы в `appEvents` из `src/utils/constants.ts`.
События моделей не передают копии данных: обработчик читает модель.

| Событие | Источник, данные | Обработка в презентере |
| --- | --- | --- |
| `catalog:changed` | CatalogModel, без данных | Создать и отобразить плитки каталога |
| `catalog:selection-changed` | CatalogModel, без данных | Подготовить выбранный товар и открыть подробности |
| `cart:changed` | CartModel, без данных | Обновить корзину, счётчик и действие в карточке товара |
| `buyer:changed` | BuyerModel, без данных | Обновить поля и ошибки форм |
| `order-request:changed` | OrderRequestModel, без данных | Обновить только busy/requestError контактов; при успехе очистить модели и показать квитанцию |
| `product:select` | Callback CatalogTile, `TProductSelection` | Найти товар и сохранить выбранный в каталоге |
| `product:action` | ProductDetails, без данных | Добавить/удалить выбранный товар и закрыть окно |
| `cart:remove` | Callback CartLine, `TProductSelection` | Удалить позицию по id |
| `cart:open` | HeaderView, без данных | Открыть уже подготовленную корзину |
| `checkout:start` | CartView, без данных | Проверить корзину, сбросить состояние запроса, открыть доставку |
| `delivery:submit` | CheckoutForm через DeliveryForm, без данных | Проверить первый шаг, открыть контакты |
| `contacts:submit` | CheckoutForm через ContactForm, без данных | Проверить данные, собрать и отправить заказ |
| `buyer:input` | DeliveryForm/ContactForm, `Partial<IBuyer>` | Сохранить изменённое поле в BuyerModel |
| `receipt:close` | ReceiptView, без данных | Закрыть модальное окно после просмотра квитанции |
| `catalog:retry` | LoadErrorView, без данных | Закрыть ошибку и повторить загрузку |

## Презентер

Презентер реализован обработчиками в `src/main.ts`, отдельный класс не вводится.
Экземпляры моделей и компонентов создаются один раз, плитки и строки — при
перерисовке соответствующего списка. Все подписки устанавливаются до GET каталога.

Вспомогательные функции:

- `openModal(content: HTMLElement): void` передаёт разметку модальному окну и открывает его.
- `renderCart(): void` обновляет позиции, итог, нумерацию, счётчик и доступность оформления по данным корзины.
- `renderProductAction(): void` обновляет только текст и доступность кнопки выбранного товара.
- `renderForms(): void` передаёт поля покупателя и ошибки соответствующего шага формам; вызывается только по `buyer:changed`.
- `loadCatalog(): Promise<void>` получает каталог; при сбое открывает компонент ошибки.

Презентер не вызывает `emit`. Для плиток и строк он передаёт callback, созданный
`events.trigger(...)`: событие возникает только при вызове callback представлением.
После изменения модели не следует прямой повторный render из обработчика действия:
модель синхронно уведомляет подписчиков. `cart:open`, `checkout:start` и
`delivery:submit` открывают существующее представление через `render()` без
аргументов. Начальное состояние форм приходит от `buyer.clearData()` после
установки подписок; пустая корзина подготавливается в конструкторе `CartView`.

Доставка валидна, если нет ошибок оплаты и адреса. Контакты валидны, если нет
ошибок email и телефона. Обе проверки независимы от корзины и сетевого запроса;
контакты также не зависят от ошибок первого шага. Событие `cart:changed` не
перезаписывает формы, а `order-request:changed` передаёт контактам только
`busy` и `requestError`. Полное описание товара обновляется при смене выбранного
товара; изменение корзины обновляет только действие в карточке.

При отправке заказ собирается из `buyer.getData()`, `cart.getProducts()` и
`cart.getTotalPrice()`. Контакты и адрес очищаются от крайних пробелов в копии
заказа. Проверка пустой корзины и незавершённого запроса выполняется только при
`checkout:start`. Во время отправки контактная форма отключает поля и кнопку
оплаты через `busy`; повторный пользовательский клик не отправляет новый запрос.
Это ограничение взаимодействия отделено от `valid`. Если закрыть форму,
каталог и корзина продолжают работать, но новое оформление не откроется до
завершения предыдущего запроса. Переданное тело заказа уже содержит отдельный
массив идентификаторов и не меняется при дальнейших действиях с корзиной.
При ошибке состояние покупателя и корзины сохраняется, кнопка оплаты снова доступна.
При успешном ответе `OrderRequestModel` эмитит событие; обработчик очищает корзину
и покупателя и открывает квитанцию с `total` сервера. Закрытие окна во время
запроса не отменяет его: успешный ответ всё равно показывает результат.

## Проверка

`npm test` проверяет каталог, категории, детали товара, пустую корзину, покупку,
удаление и нумерацию, нулевую/отсутствующую цену, закрытие окна, оба шага формы,
сохранение черновика, тело заказа, блокировку повторной отправки, успех, ошибку
и повторную попытку. Дополнительные проверки контролируют отсутствие повторной
записи полей при открытии и изменении запроса, независимую валидацию контактов,
самостоятельное закрытие ModalView, собственное событие ReceiptView и разделение
общих полей карточек. Всего 19 проверок. Ответы API подменены: тесты не создают
заказы на сервере.

Перед сдачей выполните `npm run build` и `npm test`, затем откройте `npm run dev`
в обычном браузере и пройдите покупку. Проверьте внешний вид по макету, доступность
кнопок, закрытие фоном и отсутствие прокрутки внешнего модального окна.
