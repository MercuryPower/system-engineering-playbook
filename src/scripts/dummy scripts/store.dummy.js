import dispatcher from '../modules/dispatcher.js';
import EventEmitter from '../modules/utils/EventEmitter.js';

let eventEmitter = new EventEmitter();

let _handleEvent = function(e) {

}

let getData = function() {
	return {}
}

let _init = function() {
	dispatcher.subscribe(_handleEvent);
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}
