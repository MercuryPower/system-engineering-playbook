import dispatcher from '../dispatcher.js';
import pageLoadStore from '../page-load/page-load.store.js';
import config from '../config.js';

var thresholdTimeOut = config.SCROLL_BLOCK;

var time = null;
var scrollBuffer = [];
var isScrolling = false;

var _resetBuffer = function() {
	scrollBuffer = [];
	for (var i = 0; i < 40; i++) {
		scrollBuffer.push(0);
	}
}

var _onWheel = function(e) {
	var value = e.wheelDelta || -e.deltaY || -e.detail;
	var direction = value > 0 ? 'up' : 'down';
	var previousTime;
	var summ1, summ2;
	var bufferOld, bufferNew;
	// e.preventDefault();

	if (!pageLoadStore.getData().loaded) return;
	if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDelta) || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

	previousTime = time;
	time = new Date().getTime();

	if (previousTime && time - previousTime > thresholdTimeOut / 2) {
		console.log('reset buffer');
		_resetBuffer();
	}

	scrollBuffer.push(Math.abs(value));
	scrollBuffer.shift();

	bufferNew = scrollBuffer.slice(20, 40);
	bufferOld = scrollBuffer.slice(0, 20);

	summ1 = bufferNew.reduce(function(previousValue, currentValue) {
		return previousValue + currentValue;
	});
	summ2 = bufferOld.reduce(function(previousValue, currentValue) {
		return previousValue + currentValue;
	});

	summ1 = summ1/20;
	summ2 = summ2/20;

	if (isScrolling) return;

	if (summ1 * 0.7 >= summ2) {
		isScrolling = true;
		setTimeout(function() {
			isScrolling = false;
		}, thresholdTimeOut);

		if (direction === 'up') {
			dispatcher.dispatch({
				type: 'mousewheel:up'
			});
		} else if (direction === 'down') {
			dispatcher.dispatch({
				type: 'mousewheel:down'
			});
		}
	}
}

var _init = function() {
	document.addEventListener('mousewheel', _onWheel, {passive: true});
	document.addEventListener('wheel', _onWheel, {passive: true});

	_resetBuffer();
}

_init()


export default {};