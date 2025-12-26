import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

class Store {
    constructor() {
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.subscribe = this.eventEmitter.subscribe.bind(this.eventEmitter);
        this.eventEmitter.unsubscribe = this.eventEmitter.unsubscribe.bind(this.eventEmitter);

        this.handleEvent = this.handleEvent.bind(this);
        this.getData = this.getData.bind(this);

        this.apiLoaded = false;
        this.mode = "satellite";
    }

    init() {
        dispatcher.subscribe(this.handleEvent);
    }

    handleEvent(e) {
        if (e.type === "map:apiLoaded") {
            if (this.apiLoaded) return;

            this.apiLoaded = true;

            this.eventEmitter.dispatch();
        }

        if (e.type === "map:set-mode") {
            if (e.mode === this.mode) return;

            this.mode = e.mode;

            this.eventEmitter.dispatch();
        }
    }

    getData() {
        return {
            mode: this.mode,
            apiLoaded: this.apiLoaded
        };
    }
}

let store = new Store();
store.init();

export default {
    subscribe: store.eventEmitter.subscribe,
    unsubscribe: store.eventEmitter.unsubscribe,
    getData: store.getData,
};
