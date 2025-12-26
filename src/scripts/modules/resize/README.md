# Скрипты для обработки ресайза окна
___
## resize.store
Стор с размерами экрана.
___
```javaScript
import resizeStore from '../resize/resize.store.js';
let size = resizeStore.getData(); 
// вернет {width: Number, height: Number}
```
```javaScript
// подписка
resizeStore.subscribe(handleResize: Function);
```
```javaScript
// отписка
resizeStore.unsubscribe(handleResize: Function);
```
### Поддерживаемые события
**'resize:store-check'**  
Ручной вызов проверки изменения размеров окна. На случай если окно изменило размер без нативных событий.
```javaScript
dispatcher.dispatch({
	type: 'resize:store-check'
});
```

**'resize:store-fire'**  
**Опасно**. Ручной вызов события изменения стора. Вызовет все обработчики завязанные на стор.
```javaScript
dispatcher.dispatch({
	type: 'resize:store-fire'
});
```

## breakpoint.store
Стор с текущим брейкпоинтом


