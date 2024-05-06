import { AddressForm } from './components/AddressForm';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Card } from './components/Card';
import { ContactForm } from './components/ContactForm';
import { LarekApi } from './components/LarekApi';
import { Page } from './components/Page';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import './scss/styles.scss';
import { IProductItem } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

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

// изменен открытый товар
events.on('preview:changed', (item: IProductItem) => {
	const showItem = (item: IProductItem) => {
		const cardPreview = new Card(cloneTemplate(cardPreviewTemplate), {
			onClick: () => {},
		});

		modal.render({
			content: cardPreview.render({
				image: item.image,
				category: item.category,
				title: item.title,
				description: item.description,
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
