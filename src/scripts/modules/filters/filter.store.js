import dispatcher from "../dispatcher.js";
import EventEmitter from "../utils/EventEmitter.js";
import addressStore from "../addressbar/addressbar.store.js";
import * as setUtils from "../utils/set.utils.js";

// TODO: write compare function so store is not called when nothing changes

function checkFalsy(val) {
    if (
        !val ||
        (Array.isArray(val) && val.length === 0) ||
        (val instanceof Set && val.size === 0) ||
        (typeof val === Object && Object.keys(val).length === 0)
    ) {
        return true;
    } else {
        return false;
    }
}

class Store {
    constructor() {
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.subscribe = this.eventEmitter.subscribe.bind(
            this.eventEmitter
        );
        this.eventEmitter.unsubscribe = this.eventEmitter.unsubscribe.bind(
            this.eventEmitter
        );

        this.handleEvent = this.handleEvent.bind(this);
        this.handleAddress = this.handleAddress.bind(this);
        this.getData = this.getData.bind(this);

        this.filter = {};
    }

    init() {
        this.handleAddress();

        dispatcher.subscribe(this.handleEvent);
    }

    handleEvent(e) {
        if (e.type === "filter:set") {

            if (checkFalsy(e.value)) {
                if (this.filter[e.name]) {
                    delete this.filter[e.name];

                    this.eventEmitter.dispatch();
                } else {
                    return;
                }
            } else {
                let newVal;
                if (Array.isArray(e.value) ||
                    e.value instanceof Set) {
                    newVal = new Set(e.value);
                } else {
                    newVal = new Set().add(e.value);
                }

                if (!this.filter[e.name] || this.filter[e.name].size === 0) {
                    if (newVal.size > 0) {
                        this.filter[e.name] = newVal;
                        this.eventEmitter.dispatch();
                    }
                } else {
                    if (!setUtils.equals(newVal, this.filter[e.name])) {
                        this.filter[e.name] = newVal;
                        this.eventEmitter.dispatch();
                    }
                }
            }
        }

        if (e.type === "content:replaced") {
            this.handleAddress();
        }
    }

    handleAddress() {
        let search = addressStore.getData().search;
        let changed = false;

        let newVal;

        if (search.filter) {
            newVal = Object.assign({}, search.filter);

            Object.keys(newVal).forEach((key) => {
                if (!(newVal[key] instanceof Set)) {
                    if (Array.isArray(newVal[key])) {
                        newVal[key] = new Set(newVal[key]);
                    } else {
                        newVal[key] = new Set().add(newVal[key]);
                    }
                }
            });
        } else {
            newVal = {};
        }

        if (Object.keys(this.filter).length !== Object.keys(newVal).length) {
            changed = true;
        } else {
            Object.keys(this.filter).forEach((key) => {
                if (changed) return;

                if (!setUtils.equals(this.filter[key], newVal[key])) {
                    changed = true;
                }
            });
        }

        if (changed) {
            this.filter = newVal;
            this.eventEmitter.dispatch();
        }

    }

    getData() {
        return {
            filter: this.filter,
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
