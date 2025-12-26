# Компоненты слайдера

---

## slider.store

---

Основной стор для хранения состояния слайдеров на сайте
Как и остальные сторы, подключать его вручную не нужно.

### Данные

```javaScript
    import sliderStore from './slider.store.js';
    let sliderData = sliderStore.getData();
```

**items**: *Object* - объект со всеми слайдерами, где ключ является id попапа.

**item**

```javaScript
    let sliderData = sliderStore.getData().items[id];
```

**id**: *String* - **id** слайдера.  
**total**: *Number* - число слайдов.  
**index**: *Number* - номер активного слайда.  
**continuous**: *Boolean* - зациклен слайдер или нет  
**userData**: *Object* - пользовательский объект с любыми данными.  

### Поддерживаемые события

**'slider:add'**
Добавление нового слайдера в стор

```javaScript
dispatcher.dispatch({
    type: 'slider:add',
    id: 'slider-id', // id слайдера
    total: 5, // общее число слайдов
    index: 0, // номер текущего слайда
    continuous: true, // зациклен слайдер или нет
})
```

**'slider:update'**
Обновление слайдера  
Все параметры, кроме id - не обязательны

```javaScript
dispatcher.dispatch({
    type: 'slider:update',
    id: 'slider-id', // id слайдера
    total: 5, // общее число слайдов
    index: 0, // номер текущего слайда
    continuous: true, // зациклен слайдер или нет
})
```

**'slider:remove'**
Удаление слайдера из стора

```javaScript
dispatcher.dispatch({
    type: 'slider:remove',
    id: 'slider-id', // id слайдера
})
```

**'slider:next'**
Перелистывание на следующий слайд

```javaScript
dispatcher.dispatch({
    type: 'slider:next',
    id: 'slider-id', // id слайдера
    userData: {} // здесь и далее - не обязательный объект для передачи любых данных в стор. Эти данные будут обнулены сразу после события изменения стора, т.е. служат для синхронной передачи параметров
})
```

**'slider:prev'**
Перелистывание на предыдущий слайд

```javaScript
dispatcher.dispatch({
    type: 'slider:prev',
    id: 'slider-id', // id слайдера
    userData: {}
```

**'slider:to'**
Перелистывание на конкретный слайд

```javaScript
dispatcher.dispatch({
    type: 'slider:to',
    id: 'slider-id', // id слайдера
    index: 5, // индекс нужного слайда
    userData: {}
```

## slider.component

---

Базовая компонента слайдера

```html
<slider-component data-id="slider-id">
    <div class="slide">...</slide>
    <div class="slide">...</slide>
    <div class="slide">...</slide>
    <div class="slide">...</slide>
</slider-component>
```

### Опции

**data-id**: *String* - id слайдера  
**data-speed**: *Number* - default **0.6**. Скорость анимации в ms.  
**data-continuous**: *Boolean* - default **true**. Зациклен слайдер или нет.  
**data-focusable**: *Boolean* - default **true**. Установка фокуса на слайдер и управление им стрелочками с клавиатуры.  
**data-touch**: *Boolean* - default **true**. Свайп с тач устройств.  
**data-draggable**: *Boolean* - default **true**. Драг мышью.  
**data-resize**: *Boolean* - default **false**. Явно ставит высоту слайдера в максимальную высоту слайда.  
**data-animation**: *String* - default **'default'**. Зациклен слайдер или нет.  

### Пример

```html
<slider-component class="slider" data-resize="true">
	<div class="slide">
		<img src="/tmp/slide-1.jpg" />
	</div>
	<div class="slide">
		<img src="/tmp/slide-2.jpg" />
	</div>
	<div class="slide">
		<img src="/tmp/slide-3.jpg" />
	</div>
	<div class="slide">
		<img src="/tmp/slide-4.jpg" />
	</div>
	<div class="slide">
		<img src="/tmp/slide-5.jpg" />
	</div>
</slider-component>
```

```css
.slider {
	position: relative;
	display: block;
}

.slider .slide {
	position: absolute;
	width: 100%;
	left: 0;
	top: 0;
}
```

## Анимации

**[animation-name].decorator.js**  
Декоратор с анимацией слайдера  
В this.\_options доступны все опции родителя

### Функция animate  

**Принимаемые значения**  
**options.prevSlide**: *HTMLElement* - слайд, который нужно спрятать  
**options.nextSlide**: *HTMLElement* - слайд, который нужно показать  
**options.prevIndex**: *Number* - индекс слайда, который нужно спрятать  
**options.nextIndex**: *Number* - индекс слайда, который нужно показать  
**options.durationMultiplyer**: *Number* - default 1. множитель скорости и задержек анимации  
**options.direction**: *String* 'prev' || 'next' направление анимации

## slider-control.component

---

Кнопка для управления слайдером

### Опции

**data-id**: **String** - id слайдера
**data-to**: 'prev' || 'next' || **Number** - индекс слайда или строка 'prev' или 'next'. Куда листать слайдер.

### Пример

```html
<button is="slider-control" data-id="slider-id" data-to="next">
	Следующий слайд
</button>
<button is="slider-control" data-id="slider-id" data-to="prev">
	Предыдущий слайд
</button>

<button is="slider-control" data-id="slider-id" data-to="0">Слайд 1</button>
<button is="slider-control" data-id="slider-id" data-to="1">Слайд 2</button>
<button is="slider-control" data-id="slider-id" data-to="2">Слайд 3</button>
```

## slider-control-group.component

---

Группа контролов. Например буллеты или превью.  
Внутри требуются элементы с классом **.item**

### Опции

**data-id**: **String** - id слайдера

### Пример

```html
<slider-control-group>
	<div class="item">1</div>
	<div class="item">2</div>
	<div class="item">3</div>
</slider-control-group>
```