# Компоненты формы
___

## form.store
___
В данный момент служит только для хранения состояний формы. Поддержка событий извне не поддерживается, для ручной отправки формы используйте нативный метод form.submit();
### Данные
```javaScript
    import formStore from './form.store.js';
    let data = formStore.getData();
```
**items**: **Object** - объект всех форм на сайте.  
```javaScript
    let data = data.items['form-id'];
```
**id**: **String** - id формы.  
**status**: **String** - состояние формы.  
-'waiting' - дефолтное состояние, форма в ожидании.  
-'sending' - форма отправлена, ожидает ответа.  
-'submitted' - форма отправлена, получила ответ.  

## form.component
___
Базовая компонента формы

Синтаксис:
```html
<form is="form-component" action="#" method="post" data-id="form-id">
</form>
```
**data-id** обязательный аттрибут. Уникальный id формы для связи с остальными компонентами.  
**action** url для отправки данных.  
**method** метод отправки данный (дефолтный - POST).  
**novalidate** - отключит нативную валидацию и включит кастомную. Плохо с точки зрения ux-а, но может по дизайну нужно.  

Форме автоматически проставляется класс **hidden** когда форме пришел ответ. 

### Пример формы со стилями и разметкой
```html
<div class="form-wrapper">
    <form-response class="response" data-id="form-id">
        <div class="response-inner"></div>
    </form-response>
    <form action="response.json" data-id="form-id" is="form-component">
        <label is="input-wrapper" class="input-wrapper">
            <input type="text" class="text" name="email" required>
        </label>
        <button class="button wide">отправить заявку</button>
    </form>
</div>
```
```css
.form-wrapper {
    position: relative;
}
.form-wrapper .response {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    pointer-events: none;
    opacity: 0;
    transform: translateY(50px);
    transition-property: opacity 0.6s, transform 0.6s;
    transition-duration: 0.6s, 0.6s;
    transition-timing-function: var(--ease-in), ease;
    z-index: 1;
}
.form-wrapper .response.active {
    opacity: 1;
    transform: translateY(0px);
    transition-delay: 0.6s, 0.6s;
    transition-timing-function: var(--ease-out), ease;
    pointer-events: auto;
    z-index: 2;
}
.form-wrapper form {
    transition-property: opacity, transform;
    transition-duration: 0.6s, 0.6s;
    transition-delay: 0.6s, 0.6s;
    transition-timing-function: var(--ease-out), ease;
}
.form-wrapper form.hidden {
    opacity: 0;
    transform: translateY(20px);
    transition-delay: 0s, 0s;
    transition-timing-function: var(--ease-in), ease;
    pointer-events: none;
    z-index: 0;
}
```
### Пример ответа сервера
```json
{"status":"success","response":"Спасибо! Наши менеджеры свяжутся с вами в ближайшее время."}
```

**status**: **String** - success || error || success-reset.  
  'success' - компоненте ответа будет присовон класс 'status-success' и 'active'. Форме - 'hidden'.
  'error' - компоненте ответа будет присовон класс 'status-error' и 'active'. Форме - 'hidden' на **3 секунды**, затем форма будет сброшена обратно.  
  'success' - компоненте ответа будет присовон класс 'status-success' и 'active'. Форме - 'hidden'. на **3 секунды**, затем форма будет сброшена обратно.  

## form-response.component
___
Компонента для вывода ответа формы

Синтаксис:
```html
<form-response class="response" data-id="form-id">
    <div class="response-inner"></div>
</form-response>
```
**data-id** обязательный аттрибут. Уникальный id формы для связи с остальными компонентами.  

Компоненте автоматически проставляется класс **active** когда форме пришел ответ. 
Ответ сервера **(response)** будет записан в элемент **response-inner**.  

## input-wrapper.component
___
Обертки для инпутов

Синтаксис:
```html
<label is="input-wrapper" data-validate="blur">
    <input ....>
</label>
```
**data-validate** - способ валидации инпута. (false || blur || input)
-'false' - дефольный режим, если не указывать аттрибут. Валидация произойдет при сабмите формы.  
-'blur' - Валидация произойдет при снятии фокуса с инпута. (рекомендуется)  
-'input' - Валидация произойдет при любом вводе данных в инпут.  

Добавляет класс **error**, если инпут заполнен неверно  
Добавляет класс **not-empty**, если инпут чем-то заполнен  
Добавляет класс **focus**, если курсор установлен в инпут  

Для включения масок инпутов раскомментировать строку  
import IMask from '../../libs/IMask.js';  

Подключить маски в конце **connectedCallback**  
В коде присутствует закомментированный пример маски.  