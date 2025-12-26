import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

var animationBlock = 600;

var active = null;
var lastActive = [];
var wasChanged = false;
var userData = {};

var eventEmitter = new EventEmitter();

var _handleEvent = function(e) {
	if (e.type === 'popup:toggle') {
		if (wasChanged) return;
		if (animationBlock) {
			wasChanged = true;
			setTimeout(function() {
				wasChanged = false;
			}, animationBlock);
		}

		if (active === e.id) {
			active = null;
		} else {
			active = e.id;
		}

		if (e.userData) {
			userData = e.userData;
		}
		eventEmitter.dispatch();
		userData = {};
	}

	if (e.type === 'popup:open') {
		if (wasChanged) return;
		if (active === e.id) return;
		if (animationBlock) {
			wasChanged = true;
			setTimeout(function() {
				wasChanged = false;
			}, animationBlock);
		}



		if (active === e.id) {
			active = null;
		} else {
			active = e.id;
		}

		if (e.userData) {
			userData = e.userData;
		}
		eventEmitter.dispatch();
		userData = {};
	}

	if (e.type === 'popup:close') {
		if (wasChanged) return;
		if (active === false) return;
		if (animationBlock) {
			wasChanged = true;
			setTimeout(function() {
				wasChanged = false;
			}, animationBlock);
		}

		lastActive.push(active);
		active = null;

		if (e.userData) {
			userData = e.userData;
		}
		eventEmitter.dispatch();
		userData = {};
	}

	if (e.type === 'popup:close-all') {
		if (active === null) return;

		lastActive.push(active);
		active = null;

		if (e.userData) {
			userData = e.userData;
		}
		eventEmitter.dispatch();
		userData = {};
	}

	if (e.type === 'popup:back') {
		if (wasChanged) return;
		if (active === null) return;
		if (animationBlock) {
			wasChanged = true;
			setTimeout(function() {
				wasChanged = false;
			}, animationBlock);
		}

		active = lastActive.pop();

		if (e.userData) {
			userData = e.userData;
		}
		eventEmitter.dispatch();
		userData = {};
	}
}

var getData = function() {
	return {
		active: active,
		userData: userData,
		isBlocked: wasChanged
	}
}

var _init = function() {
	dispatcher.subscribe(_handleEvent);
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}
