// все свойства в css формате

// transition(element, 0.3, {
//		transform: 'translateX(' + 200 + 'px)',
//		opacity: 0
//});

// или можно массивами

// transition(element, [0.3, 0.4], {
//		transform: 'translateX(' + 200 + 'px)',
//		opacity: 0
// }, {
//		delay: [0, 0.3],
//		ease: ['ease-in', 'cubic-bezier(1, 0, 0.3, 1)']	
// });

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

var transition = function(elements, speed, styles, options) {
	var defaults = {
		delay: 0,
		ease: 'ease'
	}
	var key;
	var i = 0;
	var styleString = '';
	var numStyles;

	function getPropsString (obj) {
		var styleString = '';
		var i = 0;

		for (key in obj) {
			if (i !== 0) {
				styleString += ', ';
			}

			styleString += key;
			i++;
		}
		return styleString;
	}

	function getValsString(arr, suffix, numStyles) {
		var styleString = '';
		var i;

		suffix = suffix || '';
		if (!Array.isArray(arr)) {
			arr = [arr];
		};
		for (i = arr.length - 1; i < numStyles; i++) {
			arr[i] = arr[arr.length - 1];
		}
		for (i = 0; i < numStyles; i++) {
			if (i !== 0) {
				styleString += ', ';
			}
			styleString += arr[i] + suffix;
		}
		return styleString;
	}

	if (!elements) return;

	if (HTMLCollection.prototype.isPrototypeOf(elements)) {
		elements = Array.prototype.slice.call(elements);
	}

	if (!Array.isArray(elements)) {
		elements = [elements];
	}

	options = Object.assign(defaults, options);
	numStyles = getPropsString(styles).split(' ').length;

	elements.forEach(function(element) {
		element.style.webkitTransitionProperty =
		element.style.transitionProperty = getPropsString(styles);

		element.style.webkitTransitionDuration =
		element.style.transitionDuration = getValsString(speed, 's', numStyles);

		element.style.webkitTransitionDelay =
		element.style.transitionDelay = getValsString(options.delay, 's', numStyles);

		element.style.webkitTransitionTimingFunction = 
		element.style.transitionTimingFunction = getValsString(options.ease, '', numStyles);

		for (var style in styles) {
			if (isChrome && !element.style.hasOwnProperty(style)) {
				console.log(element);
				console.warn('style ' + style + ' does not exist on element');
			} else {
				if (style === 'transform') {
					element.style.webkitTransform =
					element.style.transform = styles.transform;
				} else {
					element.style[style] = styles[style];
				}
			}
		}
	});
}

export default transition;