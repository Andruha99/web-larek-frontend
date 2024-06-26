import { AddressForm } from './components/AddressForm';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Card } from './components/Card';
import { ContactForm } from './components/ContactForm';
import { LarekApi } from './components/LarekApi';
import { Page } from './components/Page';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Success } from './components/common/Success';
import './scss/styles.scss';
import { IOrderContacts, IOrderForm, IProductItem } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

// Все шаблоны
const successModalTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketModalTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderModalTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsModalTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketModalTemplate), events);
const order = new AddressForm(cloneTemplate(orderModalTemplate), events);
const contacts = new ContactForm(cloneTemplate(contactsModalTemplate), events);

api
	.getProductList()
	.then((productList) => appData.setCatalog(productList))
	.catch((err) => console.error(err));

// отображение списка карточек
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});

		return card.render({
			category: item.category,
			title: item.title,
			image: item.image,
			price: item.price,
		});
	});
});

// отображение полной информации о товаре
events.on('card:select', (item: IProductItem) => {
	appData.setPreview(item);
});

// Превью товара
events.on('preview:changed', (item: IProductItem) => {
	const showItem = (item: IProductItem) => {
		const cardPreview = new Card(cloneTemplate(cardPreviewTemplate), {
			onClick: () => {
				appData.addToBasket(item);
				modal.close();
			},
		});

		const productInBasket = appData.basket.findIndex(
			(product) => product.id === item.id
		);

		if (productInBasket !== -1) {
			cardPreview.buyButton = true;
		} else {
			cardPreview.buyButton = false;
		}

		modal.render({
			content: cardPreview.render({
				image: item.image,
				category: item.category,
				title: item.title,
				description: item.description,
				price: item.price,
			}),
		});
	};

	if (item) {
		api.getProductItem(item.id).then((result) => {
			item.description = result.description;
			showItem(item);
		});
	} else {
		modal.close();
	}
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Открыть корзину
events.on('basket:open', () => {
	modal.render({
		content: createElement<HTMLElement>('div', {}, [basket.render()]),
	});
});

// Отрисовка продукта в корзине
events.on('basket:changed', () => {
	const basketItems = appData.basket.map((item) => {
		const basketCard = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('basket:remove', item),
		});

		return basketCard.render({
			price: item.price,
			title: item.title,
			id: item.id,
		});
	});

	basket.render({
		items: basketItems,
		total: appData.getTotalSum(),
	});

	basket.selected = basketItems;
});

// Удаление из корзины
events.on('basket:remove', (item: IProductItem) => {
	appData.removeFromBasket(item.id);
	events.emit('basket:changed');
	events.emit('counter:changed');
});

// Количество товаров в корзине
events.on('counter:changed', () => {
	page.counter = appData.totalAmountOfProducts();
});

// Открыть форму заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			payment: '',
			address: '' || appData.order.address,
			valid: false,
			errors: [],
		}),
	});
	appData.validateOrder();
});

// Изменение способа оплаты
events.on('payment:change', (item: HTMLButtonElement) => {
	appData.order.payment = item.name;
	appData.validateOrder();
});

// Изменилось одно из полей
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
		appData.validateOrder();
	}
);

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Открыть форму контактов
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '' || appData.order.email,
			phone: '' || appData.order.phone,
			valid: true,
			errors: [],
		}),
	});
	appData.validateContacts();
});

// Изменилось состояние валидации формы контактов
events.on('formErrors:change', (errors: Partial<IOrderContacts>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей формы контактов
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderContacts; value: string }) => {
		appData.setContactsField(data.field, data.value);
		appData.validateContacts();
	}
);

// Отправлена форма заказа
events.on('contacts:submit', () => {
	appData.order.items = appData.basket.map((item) => item.id);
	appData.order.total = appData.getTotalSum();

	api
		.orderProduct(appData.order)
		.then(() => {
			const success = new Success(
				cloneTemplate(successModalTemplate),
				{
					onClick: () => {
						modal.close();
						appData.cleanBasket();
						page.counter = 0;

						appData.order = {
							payment: '',
							address: '',
							email: '',
							phone: '',
							total: 0,
							items: [],
						};
					},
				},
				appData.order.total
			);

			modal.render({
				content: success.render(),
			});
		})
		.catch((err) => console.error(err));
});
