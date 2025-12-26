# Компоненты попапов

---

## popup.store

---

Основной стор для хранения состояния попапов на сайте
Как и остальные сторы, подключать его вручную не нужно.

### Данные

```javaScript
    import popupStore from './popup.store.js';
    let data = popupStore.getData();
```

**id**: **String** - **id** активного попапа или **null**  
**lastActive**: **Array** - массив id последних открытых попапов. История попапов.  
**isBlocked**: **Boolean** - заблокировано ли переключение попапов по таймеру.  
**userData**: **Object** - пользовательский объект с любыми данными.

### Поддерживаемые события

**'popup:toggle'**
Открытие / закрытие попапа с соответствующим id

```javaScript
dispatcher.dispatch({
    type: 'popup:toggle',
    id: 'popup-id', // id попапа
    userData: object // здесь и далее - не обязательный объект для передачи любых данных в стор. Эти данные будут обнулены сразу после события изменения стора, т.е. служат для синхронной передачи параметров
})
```

**'popup:open'**
Только открытие попапа с соответствующим id

```javaScript
dispatcher.dispatch({
    type: 'popup:open',
    id: 'popup-id', // id попапа
    userData: object
})
```

**'popup:close'**
Только закрытие попапа с соответствующим id

```javaScript
dispatcher.dispatch({
    type: 'popup:close',
    id: 'popup-id', // id попапа
    userData: object
})
```

**'popup:close-all'**
Закрытие всех открытых попапов

```javaScript
dispatcher.dispatch({
    type: 'popup:close-all',
    userData: object
})
```

**'popup:back'**
Движение назад по истории попапов. Закрывает текущий попап и открывает предыдущий, если он был.  
Например, если мы открываем из одного попапа другой и хотим вернуться назад.  
Если было состояние, где все попапы были закрыты, то вернется к нему.  
В истории может храниться сколько угодно состояний, т.е. можно вызывать несколько раз.

```javaScript
dispatcher.dispatch({
    type: 'popup:back',
    userData: object
})
```

### Изменяемые параметры в коде

_animationBlock = 600;_ - время в миллисекундах, на которое стор блокирует изменение состояния попапов. Блокировка на время анимации.
Т.е. если клиент нажимает на кнопку открытия попапа несколько раз, то стор не будет меняться до истечения таймера.

## popup.component

---

Базовая компонента попапа

Синтаксис:

```html
<popup-component data-id="popup-id">
    <div class="popup-content">
        .....
    </div>
</popup-component>
```

**data-id** обязательный аттрибут. Уникальный id попапа для связи с остальными компонентами.  
**popup-content** обертка контента попапа. При использовании _popup-heler.view_ все клики вне этого элемента будут закрывать попап.

### Доп аттрибуты

Следующие аттрибуты проставляются автоматически  
**role="dialog"**  
**aria-modal="true"**  
**inert** для закрытых попапов  
**tabindex="-1"** Заблокирует возможность ставить фокус на элементы скрытых папапов. будет поставлем всем элементам (button, a, input, select, textarea) у закрытых попапов, у открытых аттрибут tabindex будет удален. Элементы с классом **.non-focusable** будут проигнорированы. Нужно для элементов, которые сами управляют своим табиндексом, например дроп-дауны.

### Изменяемые параметры в коде

**\_openAnimation** и **\_closeAnimation** вызываются при открытии, закрытии попапа. При необходимости можно туда добавлять что-то свое. Но для обработки открытия и закрытия попапов все же рекомендуется использовать модуль **popup-helper.view**

### Пример полноэкранного попапа со стилями и разметкой

```html
<popup-component data-id="'popup-id'">
    <div class="overflow">
        <div class="popup-content">
            <nav class="menu" role="navigation">
                <a href="index.html">Главная</a>
                <a href="about.html">О нас</a>
                <a href="contacts.html">Контакты</a>
            </nav>
        </div>
    </div>
</popup-component>
```

```css
popup-component {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 100%;
    z-index: 50;
    transform: translateZ(0px);
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.5s linear 0s, transform 0.5s ease 0s,
        bottom 0s ease 0.5s;
}
popup-component.active {
    bottom: 0;
    opacity: 1;
    pointer-events: auto;
    transition: opacity 0.5s linear 0s, transform 0.5s ease 0s,
        bottom 0s ease 0s;
}
popup-component .overflow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
}
popup-component.active .overflow {
    overflow-y: auto;
}
popup-component .popup-content {
    position: relative;
    padding-top: 85px;
    padding-bottom: 50px;
    min-height: calc(100vh - 135px);
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
}
```

## popup-toggle.component

---

Компонента для кнопки открытия/закрытия попапа

Синтаксис:

```html
<button is="popup-toggle" data-id="'popup-id'">Меню</button>
```

Кнопке автоматически проставляется класс _active_ когда соответствующий попап открыть

**data-id** обязательный аттрибут. Id попапа который нужно открыть.  
**class="close-all** - не обязвтельный класс, при указании которого кнопка будет становиться активной при открытии любого попапа и закрывать его при последующем клике. Например кнопка меню может открывать меню, но превращаться в крестик при открытии любого друго попапа и закрывать его при клике

```html
<button is="popup-toggle" data-id="'popup-id'" class="close-all">Меню</button>
```

### Доп аттрибуты

Следующие аттрибуты проставляются автоматически  
**class="active"** если соответствующий попап открыт  
**aria-haspopup="true"**  
**aria-expanded="true"** если соответствующий попап открыт  
**aria-expanded="false"** если соответствующий попап закрыт

## popup-close.component

---

Простая кнопка, которая закрывает **все** попапы. Например для размещения внутри попапа.  
Синтаксис:

```html
<button is="popup-close">X</button>
```

## popup-helper.view

---

Очень важный скрипт-медиатор для работы с попапами. Требуется просто подключить вручную.

### Зависимости

**utils/dom.utils.js** _жесткая зависимость_ для получения элементов по тэгу и аттрибуту **is**  
**events/keyboard.view.js** для обработки событий с клавиатуры.  
**scroll/scroll-locker-css.js** для блокировки скролла вне попапа

### Что делает

Блокирует фокус внутри попапа при перемещении фокуса tab-ом и shift-tab-ом.  
Исключение составляет элемент **button.close-all** - это считается кнопкой, которая закрывает все попапы, например кнопка меню.  
Т.е фокус будет перемещаться только по элементам внутри попапа и элементу **button** с классом **close-all**

Закрывает активные попапы при нажатии кнопки **esc** на клавиатуре.

Закрывает активные попапы при клике вне элемента .popup-content. Исключение составляют кнопки и ссылки. На случай если они существуют вне попапа и должны оставаться кликабельными. Явный пример - кнопка меню и сделано в редколлар.

Ставит на элемент **.page-wrapper** класс **active** при наличии такого элемента

Блокирует скролл вне попапа.

Предоставляет функцию-медиатор, внутри которой можно писать любые доп. анимации связанные с состоянием попапа  
**\_handlePopup** - там есть 3 комментария  
**change animation** - анимация на смену акртвынх попапав  
**open animation** - анимация на открытие нового попапа, если все до этого были закрыты  
**close animation** - анимация на закрыие попопа в случае если больше нет активных

Внутри переменные:  
**active** - id активного попапа  
**wasActive** - id предыдущего попапа  
**popup** - элемент активного попапа  
**previousPopup** - элемент предыдущего активного попапа

---

По вопросам и предложениям - к **Panic**-у