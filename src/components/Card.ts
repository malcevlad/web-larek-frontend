import { ICard } from "../types";
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

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._category = container.querySelector(`.${blockName}__category`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._price = container.querySelector(`.${blockName}__price`);
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

    set category(value: string) {
		    this.setText(this._category, value);
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