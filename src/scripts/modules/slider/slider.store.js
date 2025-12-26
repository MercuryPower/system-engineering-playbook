import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

var eventEmitter = new EventEmitter();
var items = {};

var _handleEvent = function(e) {
	if (e.type === 'slider:add') {
		if (items[e.id]) return;
		items[e.id] = {
			id: e.id,
			total: e.total || 0,
			index: e.index || 0,
			continuous: e.continuous || false,
			userData: {}
		}

		eventEmitter.dispatch();
	}

	if (e.type === 'slider:update') {
		if (!items[e.id]) return;
		items[e.id].total = e.total;
		items[e.id].index = e.index || 0;
		items[e.id].continuous = e.continuous || false;
		items[e.id].userData = {};

		eventEmitter.dispatch();
	}

	if (e.type === 'slider:remove') {
		if (!items[e.id]) return;
		delete items[e.id];
	}

	if (e.type === 'slider:next') {
		if (!items.hasOwnProperty(e.id)) return;

		items[e.id].index++;
		if (items[e.id].continuous) {
			if (items[e.id].index > items[e.id].total - 1) items[e.id].index = 0;
		} else {
			if (items[e.id].index > items[e.id].total - 1) items[e.id].index = items[e.id].total - 1;
		}

		if (e.userData) {
			items[e.id].userData = e.userData;
		}
		eventEmitter.dispatch();
		items[e.id].userData = {};
	}

	if (e.type === 'slider:prev') {
		if (!items.hasOwnProperty(e.id)) return;

		items[e.id].index--;
		if (items[e.id].continuous) {
			if (items[e.id].index < 0) items[e.id].index = items[e.id].total - 1;
		} else {
			if (items[e.id].index < 0) items[e.id].index = 0;
		}

		if (e.userData) {
			items[e.id].userData = e.userData;
		}
		eventEmitter.dispatch();
		items[e.id].userData = {};
	}

	if (e.type === 'slider:to') {
		if (!items.hasOwnProperty(e.id)) return;

		if (items[e.id].index !== e.index) {
			if (e.index > items[e.id].total - 1 || e.index < 0) {
				console.warn('no slide width index ' + e.index + ' for slider width id ' + e.id);
				return
			}
			items[e.id].index = e.index;

			if (e.userData) {
				items[e.id].userData = e.userData;
			}
			eventEmitter.dispatch();
			items[e.id].userData = {};
		}
	}
}

var _init = function() {
	dispatcher.subscribe(_handleEvent);
}

var getData = function() {
	return items;
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}