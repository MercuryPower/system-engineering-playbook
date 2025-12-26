# Проверка активности вкладки браузера
___
Например для остановки музыки / видео когда вкладка становится неактивной.
## tab.view
___
Проверяет активность вкладки. Просто подключить в app.js
## tab.store
Хранит значение **hidden**, которое меняется на true, когда вкладка спрятана браузером.  
Свойство называется hidden т.к. оно нативно так называется. document.hidden.
### Синтаксис
```javaScript
import tabStore from '../tab/tab.store.js';
tabStore.subscribe(function() {
	var tabHidden = tabStore.getData().hidden;
	if (tabHidden) {
		console.log('tab was closed');
	} else {
		console.log('tab was opened')
	}
});
```