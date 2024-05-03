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
