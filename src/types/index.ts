// интерфейс одного товара
export interface IProductItem {
	id: string;
	description?: string;
	image?: string;
	title: string;
	category?: string;
	price: number | null;
}

// Список из API
export interface IProductList {
	total: number;
	items: IProductItem[];
}

// Оформление доставки
export interface IOrderForm {
	payment: string;
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
export type IBasketItem = Pick<IProductItem, 'title' | 'price' | 'id'> & {
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

export type FormErrors = Partial<Record<keyof IOrder, string>>;
