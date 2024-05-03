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
export interface IOrderInfo {
	email: string;
	phone: string;
}

// Интерфейс заказа
export interface IOrder extends IOrderInfo, IOrderForm {
	items: string[];
	total: number;
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
В конструктор передается базовый адрес (baseUrl) сервера и объект с опциями(options), в котором находятся заголовки запросов(по умолчанию пустой объект).

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
В конструктор передается объект с начальными данными для модели (data) и объект для управления событиями (events)

Метод:

- `emitChanges` - сообщает всем что модель поменялась

#### Класс LarekApi

Класс LarekApi расширяет класс Api.\
Предназначен для взаимодействия с api веб-ларька\
В конструктор передается: URL-адрес контента (cdn); базовый URL-адрес (baseUrl); объект с опциями (options), по умолчанию - пустой объект.

Методы:

- `getProductList(): Promise<IProductItem[]>` - получить список товаров с сервера
- `getProductItem(id: string): Promise<IProductItem>` - получить экземпляр товара. В качестве параметра принимает `id` товара.
- `orderProduct(order: IOrder): Promise<IOrderResult>` - оформить заказ товара. В качестве параметра принимает `order` - форму заказа товара(-ов).
