import { IBasketItem } from "../../types";
import { ensureElement, createElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { EventEmitter } from "../base/events";

interface IBasketView {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this.items = [];
        this.selected = [];
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
        }
    }

    set selected(items: IBasketItem[]) {
        if (items.length) {
            this.setDisabled(this._button, false);
        } else {
            this.setDisabled(this._button, true);
        }
    }

    set total(total: number) {
        this.setText(this._total, `${total} синапсов`);
    }
}

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class BasketItem extends Component<IBasketItem> {
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _removeButton: HTMLButtonElement;

	constructor(container: HTMLElement, events?: ICardActions) {
		super(container);
		this._index = container.querySelector('.basket__item-index');
		this._title = container.querySelector('.card__title');
		this._price = container.querySelector('.card__price');
		this._removeButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			container
		);
		if (events?.onClick) {
			this._removeButton.addEventListener('click', events.onClick);
		}
	}

	set index(value: number) {
		this.setText(this._index, value + 1);
	}

	set title(value: string) {
		this.setText(this._title, value);
	}
	
	set price(value: string) {
		this.setText(this._price, `${value} синапсов`);
	}

}