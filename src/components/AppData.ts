import {
	FormErrors,
	IAppData,
	IBasketItem,
	IOrder,
	IOrderContacts,
	IOrderForm,
	IProductItem,
} from '../types';
import { Model } from './base/model';

export type CatalogChangeEvent = {
	catalog: IProductItem[];
};

export class ProductItem extends Model<IProductItem> {
	id: string;
	description?: string;
	image?: string;
	title: string;
	category?: string;
	price: number | null;
}

export class AppState extends Model<IAppData> {
	basket: IBasketItem[] = [];
	catalog: IProductItem[];
	order: IOrder = {
		payment: '',
		address: '',
		email: '',
		phone: '',
		total: 0,
		items: [],
	};
	preview: string | null;
	formErrors: FormErrors = {};

	setCatalog(items: IProductItem[]) {
		this.catalog = items.map(
			(item) => new ProductItem({ ...item }, this.events)
		);
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: IProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	getTotalSum(): number {
		return this.basket.reduce((acc, item) => acc + item.price, 0);
	}

	addToBasket(item: IProductItem) {
		this.basket.push({
			id: item.id,
			index: this.basket.length + 1,
			title: item.title,
			price: item.price,
		});
		this.emitChanges('basket:changed');
		this.emitChanges('counter:changed');
	}

	removeFromBasket(id: string) {
		this.basket = this.basket.filter((item) => item.id !== id);
		this.emitChanges('basket:changed');
	}

	cleanBasket() {
		this.basket = [];
		this.emitChanges('basket:changed');
		this.emitChanges('counter:changed');
	}

	totalAmountOfProducts() {
		return this.basket.length;
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;
		console.log(this.order);

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	setContactsField(field: keyof IOrderContacts, value: string) {
		this.order[field] = value;
		console.log(this.order);

		if (this.validateOrder()) {
			this.events.emit('contacts:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.payment) {
			errors.address = 'Необходимо указать вид оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
