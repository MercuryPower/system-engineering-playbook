# Утилитарные скрипты для DOM манипуляций
___

## offset
___
Получает отступ элемента от левого-верхнего угла документа **без** учета transform-ов.  
Для получения отступа с transform-ами используйте getBoundingClientRect.  
**синтаксис**
```javaScript
let of = offset(element);
let x = of.top; // отступ сверху
let y = of.left; // отступ слева
```
## getByDataId
___
Служит для получения кастом элемента по его аттрибуту data-id  
### Пример
```html
<popup-component data-id="menu-popup"></popup-component>
```
```javaScript
let element = getByDataId('popup-component', 'menu-popup');
```
### При расширении стандартных элементов**
```html
<button is="popup-toggle" data-id="menu-popup"></button>
```
```javaScript
let element = getByDataId('button:popup-toggle', 'menu-popup');
```  
## getFocusable
___
Получает все элементы, доступные для фокуса с клавиатуры у указанного родителя (или всего документа)  
### Пример  
Получить все у документа  
```javaScript
let focusable = getFocusable();
```
Получить все у родителя  
```javaScript
let focusable = getFocusable(parent);
```
## lasyLoad
___
Устанавливает аттрибут src из аттрибута data-src когда элемент показывается на экране.  
Работает с img, video, source.  
```javaScript
require {lesyLoad} from 'utils/dom.utils.js';
lesyLoad.init();
```
```html
<img data-src="image.jpg"></img>
<video data-src="video.mp4"></video>
```