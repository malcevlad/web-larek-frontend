import { Categories, IBasketItem, ICard, itemCategories } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<ICard> {
    protected _description: HTMLElement;
	protected _image: HTMLImageElement;
	protected _title: HTMLElement;
	protected _category: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;



    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._image = container.querySelector(`.${blockName}__image`);
		this._price = ensureElement<HTMLImageElement>(`.card__price`, container);
		this._category = container.querySelector(`.${blockName}__category`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._button = container.querySelector(`.${blockName}__button`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }
    
    set title(value: string) {
		    this.setText(this._title, value);
    }

     set description(value: string) {
		    this.setText(this._description, value);
    }

     set image(value: string) {
		    this.setImage(this._image, value);
    }

    set category(value: Categories) {
		this.setText(this._category, value);
		this._category.className = `card__category card__category_${itemCategories[value]}`;
	}

    set price(value: number) {
        if(value) {
            this.setText(this._price, `${value} синапсов`);
        } else {
            this.setText(this._price, 'Бесценно');
            this.setDisabled(this._button, true);
        }
    }

    set button(inBasket: boolean) {
        this.setDisabled(this._button, inBasket)
        this.setText(this._button, inBasket ? 'Товар в корзине' : 'В корзину')
    }
}

export class BasketItem extends Card {
    protected _index: HTMLElement;
    protected _removeButton: HTMLButtonElement;


    constructor(container: HTMLElement, actions?: ICardActions) {
		super('', container, actions);

		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._removeButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

		if (actions?.onClick) {
			this._removeButton.addEventListener('click', actions.onClick);
		}
	}

    set index(value: number) {
		this.setText(this._index, value + 1);
	}

    render(data: IBasketItem): HTMLElement {
        this.title = data.title;
        this.price = data.price;
        this.index = data.index;
        return this.container;
    }

}