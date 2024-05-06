import { IProductItem } from '../types';
import { Component } from './base/Component';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	category?: string;
	title: string;
	image?: string;
	price: number | null;
	description?: string;
	button?: HTMLButtonElement;
}

export class Card extends Component<IProductItem> {
	protected _category?: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _price: HTMLElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._category = container.querySelector('.card__category');
		this._title = container.querySelector('.card__title');
		this._image = container.querySelector('.card__image');
		this._price = container.querySelector('.card__price');
		this._description = container.querySelector('.card__text');
		this._button = container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	set price(value: number | null) {
		if (!value) {
			this.setText(this._price, 'Бесценно');
			this.setDisabled(this._button, true);
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	get price(): string {
		return this._price.textContent;
	}

	set buyButton(value: boolean) {
		if (this._button) {
			if (value) {
				this._button.disabled = true;
				this.setText(this._button, 'Товар уже добавлен');
			} else {
				this._button.disabled = false;
				this.setText(this._button, 'В корзину');
			}
		}
	}
}
