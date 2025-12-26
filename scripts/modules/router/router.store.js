import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

// просто ссылку хранит

var eventEmitter = new EventEmitter();

var page = {};

var _handleEvent = function(e) {
	if (e.type === 'router:page-change') {
		if (page.href === e.href) return;
		page.href = e.href;
		eventEmitter.dispatch();
	}
}

var getData = function() {
	return {
		page: page
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
