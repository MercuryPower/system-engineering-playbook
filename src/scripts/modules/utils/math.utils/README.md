# Утилитарные математические функции.
___
**Расширяют стандартный модуль Math**

## clamp
___
Порт аналогичной функции из glsl. Обрезает значение числа заданными границами.

Синтаксис:
```javaScript
var newX = Math.clamp(x, minVal, maxVal);
```

newX = {  
	**x** если **minVal < x < maxVal**,  
	**minVal** если **x <= minVal**,  
	**maxVal** если **x >= maxVal**  
}

## smoothstep
___
Нелинейная вариация функции **clamp**  
Порт аналогичной функции из glsl. Обрезает значение числа заданными границами, интерполируя значение между граничными нелинейной сигмоиной функцией.

Подробнее про **smoothstep** и **smootherstep** https://en.wikipedia.org/wiki/Smoothstep  

Изображение функций при minVal = 0; maxVal = 1;  
![](https://upload.wikimedia.org/wikipedia/commons/5/57/Smoothstep_and_Smootherstep.svg)

Синтаксис:
```javaScript
let newX = Math.smoothstep(minVal, maxVal, x);
```

## smootherstep
___
Вариация функции **smoothstep** с больше степенью интерполяции.  
Обрезает значение числа заданными границами, интерполируя значение между граничными нелинейной сигмоиной функцией.

Подробнее про **smoothstep** и **smootherstep** https://en.wikipedia.org/wiki/Smoothstep

Синтаксис:
```javaScript
let newX = Math.smootherstep(minVal, maxVal, x);
```

## distance
___
Порт аналогичной функции из glsl. Обрезает значение числа заданными границами. 
Вычисляет дистанцию между 2-я векторами (объектами со свойствами x, y (и z));

Синтаксис:
```javaScript
let d2 = Math.distance({x: 10, y: 10}, {x: 20, y: 20});
let d3 = Math.distance({x: 10, y: 10, z: 10}, {x: 20, y: 20, z: 20});
```

