import { IContacts, IPayment } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";


export class Order extends Form<IPayment> {
    protected paymentButtons: HTMLButtonElement[];

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.paymentButtons = Array.from(container.querySelectorAll('button[name]')) as HTMLButtonElement[];

        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.payment = button.name
                events.emit(`payment:change`, button)
            });
        });
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(value: string) {
        this.paymentButtons.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === value);
		});
    } 
}

export class Contacts extends Form<IContacts> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }
    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}