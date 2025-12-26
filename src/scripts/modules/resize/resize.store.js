import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

let eventEmitter = new EventEmitter();
let heightHelper = null;

let size = {
	width: 0,
	height: 0,
};

let _windowSize = function () {
	return {
		width: document.documentElement.clientWidth,
		height: heightHelper.offsetHeight,
	};
};

let _onResize = function () {
	size = _windowSize();

	eventEmitter.dispatch();
};

let _handleEvent = function (e) {
	if (e.type === 'resize:store-fire') {
		eventEmitter.dispatch();
	}
};

let _init = function () {
	heightHelper = document.createElement('div');
	heightHelper.style.position = 'fixed';
	heightHelper.style.pointerEvents = 'none';
	heightHelper.style.visibility = 'hidden';
	heightHelper.style.left = '0px';
	heightHelper.style.top = '0px';
	heightHelper.style.right = '0px';
	heightHelper.style.bottom = '0px';

	document.documentElement.appendChild(heightHelper);

	_onResize();

	window.addEventListener('resize', _onResize, { passive: true });
	window.addEventListener('orientationchange', _onResize, { passive: true });
	window.addEventListener('load', _onResize, { passive: true });
	dispatcher.subscribe('resize', _handleEvent);
};

let getData = function () {
	return {
		width: size.width,
		height: size.height,
	};
};

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData,
};
