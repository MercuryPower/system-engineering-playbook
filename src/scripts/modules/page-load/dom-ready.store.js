import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

var eventEmitter = new EventEmitter();

var ready = false;

var _handleEvent = function(e) {
	if (e.type === 'dom:ready') {
		ready = true;

		eventEmitter.dispatch();
	}

	if (e.type === 'dom:not-ready') {
		ready = false;

		eventEmitter.dispatch();
	}
}

var getData = function() {
	return {
		ready: ready
	}
}

var _init = function() {
	dispatcher.subscribe('dom', _handleEvent);
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}
