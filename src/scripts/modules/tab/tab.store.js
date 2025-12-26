import dispatcher from '../dispatcher'
import EventEmitter from '../utils/EventEmitter.js';

let eventEmitter = new EventEmitter();
let items = {};

let _handleEvent = function (e) {
    if (e.type === 'tab:add') {
        if (items[e.id]) return;
        items[e.id] = {
            id: e.id,
            total: e.total || 0,
            index: e.index || 0,
            continuous: e.continuous || true,
        }

        eventEmitter.dispatch();
    }
    if (e.type === 'tab:remove') {
        if (!items[e.id]) return;
        delete items[e.id];
    }
    if (e.type === 'tab:next') {
        if (!items.hasOwnProperty(e.id)) return;

        items[e.id].index++;

        if (items[e.id].continuous) {
            if (items[e.id].index > items[e.id].total - 1) items[e.id].index = 0;
        } else {
            if (items[e.id].index > items[e.id].total - 1) items[e.id].index = items[e.id].total - 1;
        }

        eventEmitter.dispatch();
    }
    if (e.type === 'tab:prev') {
        if (!items.hasOwnProperty(e.id)) return;

        items[e.id].index--;

        if (items[e.id].continuous) {
            if (items[e.id].index < 0) items[e.id].index = items[e.id].total - 1;
        } else {
            if (items[e.id].index < 0) items[e.id].index = 0;
        }

        eventEmitter.dispatch();
    }
    if (e.type === 'tab:to') {
        if (!items.hasOwnProperty(e.id)) return;

        if (items[e.id].index !== e.index) {
            items[e.id].index = e.index;
            eventEmitter.dispatch();
        }
    }
}

let _init = function () {
    dispatcher.subscribe(_handleEvent);
}

let getData = function () {
    return items;
}

_init();

export default {
    subscribe: eventEmitter.subscribe.bind(eventEmitter),
    unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
    getData: getData
}
