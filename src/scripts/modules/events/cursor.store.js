import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';
import resizeStore from '../resize/resize.store.js';
import { PowerEase } from '../utils/ease.utils.js';

let eventEmitter = new EventEmitter();

let page = {
	x: resizeStore.getData().width / 2,
	y: resizeStore.getData().height / 2
}

let screen = {
	x: page.x,
	y: page.y
}

let speed = {
	x: 0,
	y: 0,
	d: 0
}

let smooth = {
	smooth1: {
		x: page.x,
		y: page.y
	},
	smooth2: {
		x: page.x,
		y: page.y
	},
	smooth3: {
		x: page.x,
		y: page.y
	}
}

let cursorEase = {
	smooth1: new PowerEase({
		power: 2,
		ease: 6
	}),
	smooth2: new PowerEase({
		power: 1,
		ease: 22
	}),
	smooth3: new PowerEase({
		power: 2,
		ease: 2
	}),
}

let locks = {
	smooth1: false,
	smooth2: false,
	smooth3: false
}


function isTouchDevice() {
	let prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	let mq = function(query) {
		return window.matchMedia(query).matches;
	}

	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		return true;
	}

	let query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	return mq(query);
}

let _handleMouseMove = function(e) {
	page = {
		x: e.pageX,
		y: e.pageY
	}

	screen = {
		x: e.clientX,
		y: e.clientY
	}

	speed.x = e.movementX;
	speed.y = e.movementY;
	speed.d = Math.pow(Math.pow(speed.x, 2) + Math.pow(speed.y, 2), 0.5);

	eventEmitter.dispatch();
}

let _loop = function() {
	let ww = resizeStore.getData().width;
	let wh = resizeStore.getData().height;

	Object.keys(smooth).forEach((key) => {
		if (locks[key]) {
			smooth[key] = cursorEase[key].ease({
				x: resizeStore.getData().width / 2,
				y: resizeStore.getData().height / 2,
			});
		} else {
			smooth[key] = cursorEase[key].ease(screen);
		}
	});

	requestAnimationFrame(_loop);
}

let getData = function() {
	return {
		page: page,
		screen: screen,
		speed: speed,

		smooth: smooth.smooth1,
		smooth2: smooth.smooth2,
		smooth3: smooth.smooth3
	}
}

let _handleDispatcher = function(e) {
	if (e.type === 'cursor:lock') {
		locks[e.id] = true;
	} else if (e.type === 'cursor:unlock') {
		locks[e.id] = false;
	}
}

let _init = function() {
	if (isTouchDevice()) return;

	window.addEventListener('mousemove', _handleMouseMove, {
		passive: true
	});

	dispatcher.subscribe(_handleDispatcher);

	_loop();
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}