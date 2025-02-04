# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Интерфейс `ICard` используется для описания структуры данных объекта карточки товара, получаемой с сервера

```
interface ICard {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}
```


`IForms` описывает структуру данных для форм ввода информации о заказе.

```
interface IForms {
    payment: string;
    address: string;
    email: string;
    phone: string;
}
```
Интерфейс `IAppState` описывает структуру состояния приложения.
```
interface IAppState {
    catalog: ICard[];
    preview: string | null;
    order: IOrder | null;
    basket: IBasketItem[];
}
```
Интерфейс `IOrder` описывает структуру данных заказа, расширяя интерфейс IForms.
```
interface IOrder extends IForms {
    items: string[];
    total: number;
}
```
Интерфейс `IOrderResult` описывает структуру объекта, который возвращается в ответ на запрос оформления заказа.
```
interface IOrderResult {
    id: string;
    total: number;
}
```

`FormErrors` используется для хранения ошибок валидации формы заказа.

```
type FormErrors = Partial<Record<keyof IForms, string>>;
```

`BasketItem` описывает элемент товара в корзине, используя только необходимые поля из карточки товара (id, title и price) и его порядковый номер.

```
type IBasketItem = Pick<ICard, 'id' | 'title' | 'price'> & {index: number};
```

## Архитектура приложения
Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие   

### Слой данных
#### Класс Model
Абстрактный класс, который служит базой для других моделей данных. Он использует `IEvents` для управления событиями, а также имеет метод `emitChanges` для уведомления подписчиков о том, что модель изменилась.

#### Класс AppState
Класс AppState наследует класс `Model` с интерфейсом `IAppState` и управляет состоянием приложения, включая каталог товаров, предварительный просмотр, корзину и заказ. Он также обрабатывает валидацию данных и уведомляет другие части приложения об изменениях через систему событий.

Поля класса:
- `catalog: ICard[]` - массив карточек на странице.
- `preview: string | null` - идентификатор карточки для предварительного просмотра.
- `basket: IBasketItem[]` - массив товаров в корзине.
- `forms: IForms` - данные с формы заказа: способ оплаты, адрес, email и телефон.
- `formErrors: IFormErrors` - ошибки формы.

Методы класса:
- `setCatalog(items: ICard[])` - Устанавливает новый каталог товаров
- `setPreview(item: ICard)` - Устанавливает карточку для предварительного просмотра
- `addProduct(card: IBasketItem)` - Добавляет товар в корзину
- `deleteProduct(id: string)` - Удаляет товар из корзины по его идентификатору
- `getTotal(): number` - Возвращает общую сумму товаров в корзине.
- `createOrder(): IOrder` - Возвращает новый объект типа IOrder, добавляя к данным формы список товаров (items) и общую сумму заказа (total).
- `clearBasket()` -  Очищает корзину
- `checkBasket(productId: string): boolean` - Проверяет наличие товара в корзине.
- `setPaymentField(field: keyof IForms, value: string)` - Устанавливает значение для поля оплаты и проверяет корректность заказа.
- `validatePayment()` - Проверяет корректность данных оплаты и обновляет ошибки формы.
- `setOrderField(field: keyof IForms, value: string)` - Устанавливает значение для поля заказа и проверяет корректность заказа.
- `validateOrder()` - Проверяет корректность данных заказа и обновляет ошибки формы.
 
### Слой представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Класс Modal
Класс Modal расширяет абстрактный класс Component и предоставляет методы `open` и `close` для управления отображением модального окна. Устанавливает слушатели на клавиатуру, для закрытия модального окна по Esc, на клик в оверлей и кнопку-крестик для закрытия попапа.  
`constructor(container: HTMLElement, protected events: IEvents)` - Конструктор класса, принимает контейнер (корневой элемент модального окна) и экземпляр класса `EventEmitter` для возможности инициации событий.  
Поля класса:
- `closeButton` - кнопка закрытия модального окна.
- `content` - элемент содержимого модального окна.

#### Класс Card
Класс Card представляет собой UI-компонент карточки, который включает заголовок, изображение, категорию, описание, цену и кнопку. Он наследуется от класса Component и инициализирует свои элементы в конструкторе, используя переданный контейнер и имя блока для CSS-селекторов. Класс также поддерживает обработку событий клика через интерфейс ICardActions.
```
interface ICardActions {
    onClick: (event: MouseEvent) => void;
}
```
Класс предоставляет сеттеры для установки содержимого элементов карточки

#### Класс Basket
Класс Basket представляет собой компонент корзины для интернет-магазина, который отображает:
- list - список товаров в корзине 
- total - общую сумму товаров
- button - кнопку для оформления заказа.

Он наследуется от класса Component используя интерфейс IBasketView  
```
interface IBasketView {
    items: HTMLElement[];
    total: number;
}
```
В конструкторе будут найдены элементы корзины и добавлен слушатель события клика инициирующий событие `order:open`

Класс предоставляет сеттеры:
- обновление списка товаров в корзине
- активация и декативания кнопки оформления заказа
- отображение текста с общей суммой товаров в корзине.

#### Класс BasketItem
Класс BasketItem расширяет класс Card, отвечая за отображение единицы товара в корзине. Он управляет элементами DOM, связанными с товаром, такими как порядковый номер, название, цена и кнопка удаления товара из корзины которые находятся в полях класса.\
Конструктор присваивает полям класса, соответствующие элементы найденные в DOM.
С помощью сеттеров устанавливает текстовые значения порядковому номеру, названию, цене товара

#### Класс Form
Класс Form представляет собой компонент формы, который обрабатывает ввод данных пользователем, провяет на валидность и отображает ошибки. Класс наследуется от базового класса Component и использует интерфейс IFormState для управления состоянием формы.
```
interface IFormState {
    valid: boolean;
    errors: string[];
}
```
Поля класса:
- submit - Кнопка отправки формы
- errors - Элемент для отображения ошибок формы

Конструктор принимает два аргумента: контейнер формы и объект для управления событиями.
Сеттеры класса устанавливают состояние кнопки отправки формы и текст ошибок в элементе

#### Класс Order
Класс Order наследуется от базового класса Form, использует интерфейс `IForms`. Этот класс с помощью сеттеров добавляет возможность установки значений для полей ввода телефона, электронной почты, адреса доставки и выбора способа оплаты. 
Конструктор собирает массив кнопок оплаты и добавляет обработчики событий для каждой кнопки передавая в сеттер `payment` имя нажатой кнопки

Сеттер `payment` устанавливает выбранный способ оплаты, активирует выбранную кнопку, деактивиря все остальные

#### Класс Page
Класс Page предоставляет функциональность для отображения основных элементов страницы, включая счетчик товаров в корзине, каталог товаров и состояние блокировки страницы. Он наследуется от базового класса Component и использует интерфейс IPage
```
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
```
Поля класса:
- counter - счетчик товаров в корзине.
- catalog - элемент, содержащий каталог товаров
- wrapper - элемент-обертка страницы
- basket - элемент-кнопка корзины.

Конструктор инициализирует элементы страницы и добавляет обработчик событий для кнопки корзины.

Сеттеры устанавливают значение счетчика товаров, обновляют каталог и управляют блокировкой страницы

#### Класс Success
Класс Success отвечает за сообщение об успешном завершении заказа. Он управляет элементами, связанными с описанием успешного заказа и кнопкой закрытия.  
Конструктор инициализирует поля класса, находит соответствующие элементы DOM и добавляет обработчик клика для кнопки закрытия.
Сеттер устанавливает итоговую сумму заказа в сообщении.

### Слой коммуникации

#### Класс AppApi
Расширяет класс Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.
Методы класса:
- `getItemList(): Promise<ICard[]>` - метод возвращает промис с массивом объектов типа ICard. Отправляет GET-запрос endpoint /product и получает список карточек
- `orderItems(order: IOrder): Promise<IOrderResult>` - метод возвращает промис с результатом заказа типа IOrderResult. Отправляет POST-запрос на endpoint /order с данными заказа

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий. Презентер подписан на события с помощью метода `on` экземпляря класса `EventEmitter`

#### Пример взаимодействия
В этом примере мы рассмотрим, как различные слои приложения взаимодействуют друг с другом, когда пользователь кликает по карточке товара в галерее.
- Для каждой карточки создан экземпляр класса `Card` из слоя представления, которому передается клон шаблона карточки и объект с обработчиком события onClick
- экземпляр реагирует на клик пользователя и генерирует событие `card:select` с текущей карточкой
- презентер подписан на это событие и выбранная карточка передается в метод `setPreview` объекта класса `AppState` из слоя данных, который устанавливает полю `preview` id выбранной карточки и генерирует событие `preview:changed`.
- Презентер обрабатывает событие `preview:changed`, cоздаёт экземпляр класса `Card`, которому передается клон шаблона для предварительного просмотра.
- Презентер вызывает метод `render` из объекта класса представления `Modal` и в открывшимся модальном окне отображается выбранная карточка.

*Список всех событий, которые могут генерироваться в системе:*\
*События изменения данных (генерируются классами моделями данных)*
- `items:changed` - изменение массива карточек
- `preview:changed` - изменение данных карточки в окне предпросмотра
- `basket:change` - изменение данных в корзине
- `formErrors:change` - изменение ошибок валидации форм
- `payment:ready` - статус корркетной формы оплаты
- `order:ready` - статус корркетной формы заказа


*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `card:select` - выбрана карточка
- `modal:open` - открыто модальное окно
- `modal:close` - закрыто модальное окно
- `basket:open` - открыта корзина товаров
- `add:card` - добавлена карточка в корзину
- `delete:card` - удалена карточка из корзины
- `order:open` - открыто окно оформления заказа
- `order.payment:change` - изменился способ оплаты
- `order.address:change ` - изменился дарес доставки
- `order.email:change` - изменился email
- `order.phone:change ` - изменился номер телефона
- `order:submit` - форма подтверждена
