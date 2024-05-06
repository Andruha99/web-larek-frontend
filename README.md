# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных

```
// интерфейс одного товара
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// Список из API
export interface IProductList {
	total: number;
	items: IProductItem[];
}

// Оформление доставки
export interface IOrderForm {
	payment: 'card' | 'cash';
	address: string;
}

// Контактные данные
export interface IOrderContacts {
	email: string;
	phone: string;
}

// Интерфейс заказа
export interface IOrder extends IOrderContacts, IOrderForm {
	total: number;
	items: string[];
}

// Интерфейс успешного заказа
export interface IOrderResult {
	id: string;
	total: number;
}

// Данные об одном товаре в корзине
export type IBasketItem = Pick<IProductItem, 'title' | 'price'> & {
	// Порядковый номер в корзине
	index: number;
};

// Интерфейс корзины
export interface IBasket {
	items: IBasketItem[];
	price: number;
}

// Интерфейс глобального состояния приложения
export interface IAppData {
	basket: IBasketItem[];
	catalog: IProductItem[];
	order: IOrder | null;
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадишме MVP:

- слой данных (Model) отвечает за хранение и изменение данных;
- слой представления (View) отвечает за отоброжение данных на странице;
- Presenter отвечает за связь представления и данных

### Базовый код

#### Класс Api

Содержит в себе базовую логику отправки запросов.\
В конструктор передается базовый адрес (`baseUrl: string`) сервера и объект с опциями(`options: RequestInit`), в котором находятся заголовки запросов(по умолчанию пустой объект).

Методы:

- `handleResponse` - обрабатывает ответ сервера. Если в ответе ошибка, вернется отклоненный промис с сообщением об ошибке
- `get` - принимает endpoint(строку), отправляет GET запрос на сервер и возвращает Promise с результатом
- `post` - принимает конечный endpoint(строку), объект с данными, которые будут переданы в JSON в теле запроса и отправлены на сервер. По умолчанию выполнится `POST`-запрос, но метод может быть переопределен при помощи параметра method

#### Класс EventEmitter

Позволяет подписываться на события и уведомлять подписчиков о наступлении события. Используется в Presenter для обработки событий и в слоях приложения для генерации событий.

Методы:

- `on` - установить обработчик на событие
- `off` - снять обработчик с события
- `emit` - инициировать событие с данными
- `onAll` - слушать все события
- `offAll` - сбросить все обработчики
- `offAll` - сделать коллбек триггер, генерирующий событие при вызове

### Слой данных

#### Класс Model

Абстрактный класс, для управления данными.\
В конструктор передается объект с начальными данными для модели (`data: Partial<T>`) и объект для управления событиями (`protected events: IEvents`)

Метод:

- `emitChanges` - сообщает всем что модель поменялась

#### Класс AppState

Класс предназначен для хранения состояния приложения. Расширяет класс Model.\

Методы:

- `setCatalog(items: IProductItem[])` - устанавливает каталог товаров
- `setPreview(item: IProductItem)` - устанавливает превью товара
- `getTotalSum(): number` - возвращает общую стоимость товаров в корзине
- `addToBasket(item: ProductItem)` - добавляет товар в корзину
- `removeFromBasket(id: string)` - удаляет товар из корзины
- `cleanBasket()` - очищает корзину от всех товаров
- `totalAmountOfProducts()` - общее количество товаров в корзине
- `setOrderField(field: keyof IOrderForm, value: string)` - устанавливает поля формы заказа
- `setContactsField(field: keyof IOrderContacts, value: string)` - устанавливает поля формы контактов
- `validateOrder()` - валидация формы заказа
- `validateContacts()` - валидация формы контактов

### Слой представления

#### Класс Component

Абстрактный класс для всех компонентов. Предназначен для работы с DOM.\
В конструкторе принимает DOM-элемент (`protected readonly container: HTMLElement`).

Методы:

- `toggleClass(element: HTMLElement, className: string, force?: boolean)` - переключить класс
- `protected setText(element: HTMLElement, value: unknown)` - установить текстовое содержимое
- `setDisabled(element: HTMLElement, state: boolean)` - сменить статус блокировки
- `protected setHidden(element: HTMLElement)` - скрыть
- `protected setVisible(element: HTMLElement)` - показать
- `protected setImage(element: HTMLImageElement, src: string, alt?: string)` - установить изображение с алтернативным текстом
- `render(data?: Partial<T>): HTMLElement` - вернуть корневой DOM-элемент

#### Класс Modal

Позволяет управлять модальными окнами. Modal расширяет класс Component.\
Конструктор принимает: DOM-элемент модального окна (`container: HTMLElement`) и события (`protected events: IEvents`).

Методы:

- `set content(value: HTMLElement)` - сеттер для установки содержимого модального окна
- `open()` - открыть модальное окно
- `close()` - закрыть модальное окно
- `render(data: IModalData): HTMLElement` - вывод модального окна на экран

#### Класс Success

Используется для отображения успешного оформления заказа. Расширяет класс Component.\
Конструктор принимает: DOM-элемент модального окна успешного заказа(`container: HTMLElement`), события (`actions: ISuccessActions`), итоговую сумму (`total: number`).

#### Класс Form

Используется для создания и отображения форм. Расширяет класс Component.\
Конструктор принимает: DOM-элемент формы(`protected container: HTMLFormElement`), события (`protected events: IEvents`).

Методы:

- `protected onInputChange(field: keyof T, value: string)` - событие изменения поля формы
- `set valid(value: boolean)` - сеттер для установки валидности формы
- `set errors(value: string)` - сеттер для установки текста ошибки поля
- `render(state: Partial<T> & IFormState)` - вывод формы на экран

#### Класс AddressForm

Используется для формы с выбором вида платежа и указанием адреса доставки. Расширяет класс Form.\
Конструктор принимает: DOM-элемент формы контактных данных (`container: HTMLFormElement`), события (`protected events: IEvents`).

Методы:

- `set selected(name: string)` - устанавливает значение вида платежа
- `set address(value: string)` - сеттер для установки адреса доставки

#### Класс ContactForm

Используется для формы контакты. Расширяет класс Form.\
Конструктор принимает: DOM-элемент формы контактных данных (`container: HTMLFormElement`), события (`protected events: IEvents`).

Методы:

- `set email(value: string)` - сеттер для установки email
- `set phone(value: string)` - сеттер для установки телефона

#### Класс Card

Используется для создания карточек товара на главной странице, в корзине, в модальном окне просмотра.\
Конструктор принимает контейнер карточки товара (`container: HTMLElement`), необязательный объект с событиями (`actions?: ICardActions`)

Методы:

- `set id(value: string)` - устанавливает id
- `get id(): string` - получает id
- `set title(value: string)` - устанавливает название карточки
- `get title(): string` - получает название карточки
- `set image(value: string)` - устанавливает картинку товара
- `set description(value: string)` - устанавливает описание товара
- `set category(value: string)` - устанавливает категорию товара
- `get category(): string` - получает категорию товара
- `set price(value: number | null)` - устанавливает цену товара
- `get price(): string` - получает цену товара
- `set buyButton(value: boolean)` - устанавливает активность кнопки купить, в зависимости от наличия товара в корзине

#### Класс Basket

Предназначен для работы с корзиной. Расширяет класс Component.\
Конструктор принимает: DOM-элемент корзины (`container: HTMLElement`) и объект с событиями (`protected events: EventEmitter`).

Методы:

- `set items(items: HTMLElement[])` - устанавливает список товаров в корзине и индекс каждого товара
- `set selected(items: string[])` - устанавливает активность кнопки оформления заказа, в зависимости от наличия товаров в корзине
- `set total(total: number)` - устанавливает итоговую стоимость для оформления заказа

#### Класс Page

Предназначен для работы с главной страницей. Расширяет класс Component.\
Контейнер принимает: DOM-элемент контейнер (`container: HTMLElement`) и объект с событиями (`protected events: IEvents`).

Методы:

- `set counter(value: number)` - устанавливает значение количества товаров в корзине
- `set catalog(items: HTMLElement[])` - устанавливает список товаров
- `set locked(value: boolean)` - блокирует/разблокирует скролл при открытии/закрытии модального окна

### Слой коммуникации

#### Класс LarekApi

Класс LarekApi расширяет класс Api.\
Предназначен для взаимодействия с api веб-ларька\
В конструктор передается: URL-адрес контента (`cdn: string`); базовый URL-адрес (`baseUrl: string`); объект с опциями (`options?: RequestInit`), по умолчанию - пустой объект.

Методы:

- `getProductList(): Promise<IProductItem[]>` - получить список товаров с сервера
- `getProductItem(id: string): Promise<IProductItem>` - получить экземпляр товара. В качестве параметра принимает `id` товара.
- `orderProduct(order: IOrder): Promise<IOrderResult>` - оформить заказ товара. В качестве параметра принимает `order` - форму заказа товара(-ов).
