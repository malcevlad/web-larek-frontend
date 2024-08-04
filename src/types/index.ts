// Интерфейс данных карточки приходящей с сервера
export interface ICard {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

// Интерфейс для форм
export interface IForms {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

// Интерфейс для модели данных приложения
export interface IAppState {
    catalog: ICard[];
    preview: string | null;
    order: IOrder | null;
    basket: IBasketItem[];
}

// Интерфейс данных о заказе отправляемых на сервер
export interface IOrder extends IForms {
    items: string[];
    total: number;
}

// Тип ответа от сервера при оформлении заказа
export interface IOrderResult {
    id: string;
    total: number;
}

// Тип, с потенциальными ошибками для полей формы заказа
export type IFormErrors = Partial<Record<keyof IForms, string>>;

// Тип товара в корзине
export type IBasketItem = Pick<ICard, 'id' | 'title' | 'price'> & {index: number};