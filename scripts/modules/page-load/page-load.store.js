import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

let eventEmitter = new EventEmitter();
let loaded = false;
let loadedOnce = false;
let interactive = false;

let _handleEvent = function(e) {
	if (e.type === 'page-load:load') {
		loaded = true;
		loadedOnce = true;
		eventEmitter.dispatch();
	}

	if (e.type === 'page-load:interactive') {
		interactive = true;
		eventEmitter.dispatch();
	}

	if (e.type === 'page-load:reset') {
		loaded = false;
		eventEmitter.dispatch();
	}
}

let getData = function() {
	return {
		loaded: loaded,
		loadedOnce: loadedOnce,
		interactive: interactive
	}
}

let _init = function() {
	dispatcher.subscribe('page-load', _handleEvent);
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}
