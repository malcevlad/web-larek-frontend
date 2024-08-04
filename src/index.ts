import './scss/styles.scss';

import { AppApi } from './components/AppApi';
import { EventEmitter } from './components/base/events';
import { CDN_URL, API_URL } from './utils/constants';
import {cloneTemplate, ensureElement} from "./utils/utils";
import { AppState, CatalogChangeEvent } from './components/AppState';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Basket, BasketItem } from './components/common/Basket';
import { Order } from './components/Order';
import { Success } from './components/common/Success';
import { IBasketItem, ICard, IForms } from './types';
import { Card } from './components/Card';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

// Отслеживаем все события, для отладки
events.onAll((event) => {
	console.log(event.eventName, event.data);
});

const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const appState = new AppState({}, events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Order(cloneTemplate(contactsTemplate), events);



events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appState.catalog.map(item => {
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
        });
    });
});

events.on('card:select', (item: ICard) => {
    appState.setPreview(item);
});

events.on('preview:changed', (item: ICard) => {
    const showItem = (item: ICard) => {
        
        const inBasket = appState.basket.some(basketItem => basketItem.id === item.id);
        const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                events.emit('add:card', item)
                if(!inBasket){
                    card.button = !inBasket
                }
            }
        });

        card.button = inBasket;

        modal.render({
            content: card.render({
                description: item.description,
                image: item.image,
                title: item.title,
                category: item.category,
                price: item.price,
            })
        })
    }
    if (item) {
        api.getItemList()
            .then((result) => {
                appState.catalog = result;
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
})

events.on('add:card', (card: IBasketItem) => {
    appState.addProduct(card)
})

events.on('delete:card', (card: IBasketItem) => {
    appState.deleteProduct(card.id);
    basket.total = appState.getTotal();
})

events.on('basket:change', () => {
    basket.items = appState.basket.map((item, index) => {
        basket.total = appState.getTotal();

        const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('delete:card', item)
        })

        return basketItem.render({
            title: item.title,
            index: index,
            price: item.price
        })
    })
    page.counter = appState.basket.length
    basket.selected = appState.basket
})

events.on('basket:open', () => {
    modal.render({
        content: basket.render()
    })
})

events.on('order:open', () => {
    modal.render({
        content: order.render({
            payment: '',
			address: '',
			valid: false,
			errors: [],
        })
    })
})

events.on('order:submit', () => {
    modal.render({
        content: contacts.render({
            email: '',
			phone: '',
			valid: false,
			errors: [],
        })
    })
})

events.on('formErrors:change', (errors: Partial<IForms>) => {
    const { payment, address, email, phone } = errors;

    order.valid = !payment && !address;
    order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');

    contacts.valid = !email && !phone;
    contacts.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

events.on('payment:change', (button: HTMLButtonElement) => {
    appState.order.payment = button.name;
    appState.validatePayment();
})

events.on(/^order\..*:change/, (data: { field: keyof IForms, value: string }) => {
    appState.setPaymentField(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: { field: keyof IForms, value: string }) => {
    appState.setOrderField(data.field, data.value);
});

events.on('contacts:submit', () => {
    appState.createOrder();
    
    api.orderItems(appState.order)
    .then(result => {
        const success = new Success(cloneTemplate(successTemplate), {
            onClick: () => {
                modal.close();
                appState.clearBasket();
                page.counter = 0;
            }
        })
        modal.render({
            content: success.render({
                total: result.total
            })
        })
    })
    .catch(err => {
        console.log(err);
    })
})

events.on('modal:open', () => {
    page.locked = true;
});


events.on('modal:close', () => {
    page.locked = false;
});

api.getItemList()
    .then(appState.setCatalog.bind(appState))
    .catch(err => {
        console.error(err);
    })