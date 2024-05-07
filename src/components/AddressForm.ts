import { Form } from './common/Form';
import { IOrderForm } from '../types';
import { IEvents } from './base/events';
import { ensureAllElements } from '../utils/utils';

export class AddressForm extends Form<IOrderForm> {
	protected _tabs: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._tabs = ensureAllElements<HTMLButtonElement>('.button_alt', container);

		this._tabs.forEach((button) => {
			button.addEventListener('click', () => {
				this.selected = button.name;
			});
		});
	}

	set selected(name: string) {
		this._tabs.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === name);
		});
		this.events.emit('payment:change', { name });
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
