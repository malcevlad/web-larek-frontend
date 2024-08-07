import { IAppState, ICard, IOrder, IBasketItem, IForms, IFormErrors } from "../types";
import { Model } from "./base/Model";

export type CatalogChangeEvent = {
    catalog: ICard[];
    preview: string | null;
};

export class AppState extends Model<IAppState> {
    catalog: ICard[];  
    preview: string | null; 
    basket: IBasketItem[] = [];
    forms: IForms = {
        payment: '',
        address: '',
        email: '',
        phone: ''
    };
    formErrors: IFormErrors = {};

    setCatalog(items: ICard[]) {
        this.catalog = items.map((item) => item, this.events);
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ICard) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }
    
    addProduct(card: IBasketItem) {
        const inBasket = this.basket.some(
            (item) => item.id === card.id
        );
        if (!inBasket) {
            this.basket.push(card);
            this.emitChanges('basket:change', { basket: this.basket });
        } 
    }

    deleteProduct(id: string) {
        this.basket = this.basket.filter((element) => element.id !== id);
        this.emitChanges('basket:change', { basket: this.basket });
    }

    getTotal(): number {
        return this.basket.reduce((a, c) => c.price !== null ? a + c.price : a, 0);
    }

    checkBasket(productId: string): boolean {
        return this.basket.some(item => item.id === productId);
    }

    clearBasket() {
        this.basket = [];
        this.emitChanges('basket:change', { basket: this.basket });
    }

    setPaymentField(field: keyof IForms, value: string) {
        this.forms[field] = value;

        if (this.validatePayment()) {
            this.events.emit('payment:ready', this.forms);
        }
    }

    validatePayment() {
        const errors: typeof this.formErrors = {};
        if (!this.forms.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        if (!this.forms.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
    
    setOrderField(field: keyof IForms, value: string) {
        this.forms[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.forms);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.forms.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.forms.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    createOrder(): IOrder {
        return {
            ...this.forms,
            items: this.basket.map(item => item.id),
            total: this.getTotal()
        }
    }
}