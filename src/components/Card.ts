import { Categories, IBasketItem, ICard, itemCategories } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card<T> extends Component<T> {
    protected _title: HTMLElement;
    protected _price: HTMLImageElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);
		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._price = ensureElement<HTMLImageElement>(`.card__price`, container);
        this._button = container.querySelector(`.card__button`);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number) {
        if(value) {
            this.setText(this._price, `${value} синапсов`);
        } else {
            this.setText(this._price, 'Бесценно');
            this.setDisabled(this._button, true);
        }
    }
}

export class MainPageCard extends Card<ICard> {
    protected _image: HTMLImageElement;
	protected _category: HTMLElement;

    constructor(container: HTMLElement,  actions?: ICardActions) {
        super(container);
        this._image = container.querySelector('.card__image') as HTMLImageElement;
        this._category = container.querySelector('.card__category') as HTMLElement;

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set image(value: string) {
        this.setImage(this._image, value);
    }

    set category(value: Categories) {
        this.setText(this._category, value);
        this._category.className = `card__category card__category_${itemCategories[value]}`;
    }
}

export class BasketItemCard extends Card<IBasketItem> {
    protected _index: HTMLElement;
    protected _removeButton: HTMLButtonElement;
    
    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);
        
		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._removeButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);
        
		if (actions?.onClick) {
            this._removeButton.addEventListener('click', actions.onClick);
		}
	}
    
    set index(value: number) {
        this.setText(this._index, value + 1);
	}
    
}

export class ModalCard extends Card<ICard> {
    protected _description: HTMLElement;
	protected _image: HTMLImageElement;
    
    constructor(container: HTMLElement,  actions?: ICardActions) {
        super(container);
        this._image = container.querySelector(`.card__image`);
        this._description = container.querySelector(`.card__text`);

        if (actions?.onClick) {
            this._button.addEventListener('click', actions.onClick);
		}
    }

    set image(value: string) {
        this.setImage(this._image, value);
    }
    set description(value: string) {
        this.setText(this._description, value);
    }
    set button(inBasket: boolean) {
        this.setDisabled(this._button, inBasket)
        this.setText(this._button, inBasket ? 'Товар в корзине' : 'В корзину')
    }
}