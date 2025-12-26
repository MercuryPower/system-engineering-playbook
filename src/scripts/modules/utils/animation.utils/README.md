# Утилитарные скрипты анимаций
___

## Transition
___
Создает анимацию в стиле GSAP, но на CSS transition-ах.  
Лучше подходит для нагруженных анимаций, где требуется высокая производительность.  
Умеет задавать различные параметры анимации для различных свойств.  

### Синтаксис
Синтаксис всех свойст должен быть в CSS стиле.
2-й объект со свойствами анимаций и каждое отдельное свойство не обязательно к заполнению.  

**defaults:**  
**ease**: 'ease',  
**delay**: 0s  

```javaScript
transition(element, duration_seconds, properties, options);
```
**element(HTMLElement)** HTML элеиент для анимации.  
**duration_seconds** Время анимации в секундах.  

**properties(Object)** Объект типа 'CSS свойство': 'Значение'  
- property(String): value(String),  // пара 'CSS свойство': 'Значение'  
- property(String): value(String),  // пара 'CSS свойство': 'Значение'  
- ...  

**options(Object)**  
- ease: easing(String), // easing анимации в CSS формате  
- delay: delay_seconds(Number) // задержка анимации в секундах  

```javaScript
transition(element, duration_seconds, {
	property: value
}, {
	ease: easing,
	delay: delay_seconds
});
```

Пример
```javaScript
transition(element, 0.3, {
	transform: 'translateX(' + 200 + 'px)',
	opacity: 0
}, {
	ease: 'ease-in',
	delay: 0.1
});
```

Пример с различными свойствами анимаций.  
Здесть анимация по transition будет протекать 0.3с и задержкой в 0с и изингом 'ease', а анимация по opacity за 0.4с, с задержкой 0.3с и изингом 'cubic-bezier(1, 0, 0.3, 1)'  
Можно писать в смешанном стиле и указывать массивы только для тех свойств, которые нужны.  
```javaScript
transition(element, [0.3, 0.4], {
	transform: 'translateX(' + 200 + 'px)',
	opacity: 0
}, {
	delay: [0, 0.3],
	ease: ['ease-in', 'cubic-bezier(1, 0, 0.3, 1)']	
});
```
