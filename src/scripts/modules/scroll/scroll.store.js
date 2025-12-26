import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';
import pageLoadStore from '../page-load/page-load.store.js';
import popupStore from '../popup/popup.store.js';
import touchStore from '../touch/touch.store.js';

const defaultOptions = {
    containerQuery: 'popup-component .overflow'
}

class ScrollStore {
    constructor(options) {
        this._options = Object.assign({}, defaultOptions, options);

        this.eventEmitter = new EventEmitter();

        this.getData = this.getData.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleDispatcher = this.handleDispatcher.bind(this);
        this.handleContent = this.handleContent.bind(this);

        this._containers = {};
        this._locked = false;
    }

    init() {
        this.handleContent();

        dispatcher.subscribe(this.handleDispatcher);
    }

    handleContent() {
        this._containers = {};

        let containers = document.querySelectorAll(this._options.containerQuery);
        containers = Array.prototype.slice.call(containers);
        containers.push(window);

        containers.forEach((c) => {
            let id;
            if (c === window) {
                id = null;
            } else {
                id = c.getAttribute('data-id');

                if (!id) {
                    let popup = c.closest('popup-component');
                    if (popup) {
                        id = popup.getAttribute('data-id');
                    } else {
                        console.error('no scroll container id');
                        return;
                    }
                }
            }

            let smoothScroll;
            if (c === window) {
                smoothScroll = document.getElementsByTagName('smooth-scroll')[0];
            } else {
                smoothScroll = c.getElementsByTagName('smooth-scroll')[0];
            }

            let mode = 'default';
            if (smoothScroll && smoothScroll._active) {
                mode = 'smooth';
            }

            let data = {
                element: c,
                smoothScrollComponent: smoothScroll,
                id: id,
                mode: mode
            }

            data.scroll = this.getScrollPosition(data, null, true);
            data.raw = this.getRawPosition(data, true);

            if (id) {
                this._containers[id] = data;
            } else if (c === window) {
                this._containers['window'] = data;
            } else {
                console.error('no scroll container id');
                return;
            }

            c.addEventListener('scroll', () => {
                this.handleScroll(data);
            });

            if (smoothScroll) {
                smoothScroll.addEventListener('smooth-scroll', (e) => {
                    this.handleScroll(data, e);
                });
            }
        });
    }

    getScrollPosition(container, event, forced) {
        if (!forced) {
            if (this._locked && container.element === window) return container.scroll;
            if (popupStore.getData().active && container.element === window) return container.scroll;
            // scroll is locked after popup, so bug is possible
        }

        if (container.smoothScrollComponent && container.smoothScrollComponent._active) {
            container.mode = 'smooth';

            let top;
            if (event && event.detail) {
                top = event.detail.top;
            } else {
                top = container.smoothScrollComponent._currentScroll;
            }

            if (top < 1) {
                top = 0;
            }

            return {
                top: top,
                left: 0
            }
        } else {
            container.mode = 'default'
            return this.getRawPosition(container, forced);
        }
    }

    getRawPosition(container, forced) {
        if (!forced) {
            if (this._locked && container.element === window) return container.raw;
            if (popupStore.getData().active && container.element === window) return container.raw;
            // scroll is locked after popup, so bug is possible
        }

        let positionTop = container.element.scrollY;
        if (isNaN(positionTop) || positionTop === undefined) positionTop = 0;

        let positionLeft = container.element.scrollX;
        if (isNaN(positionLeft) || positionLeft === undefined) positionLeft = 0;

        return {
            top: positionTop,
            left: positionLeft
        }
    }

    handleScroll(container, event) {
        let loaded = pageLoadStore.getData().loaded;
        let changed = false;

        //Object.keys(this._containers).forEach((key) => {
        let c = container;
        let originalScroll = Object.assign({}, c.scroll);
        let originalRaw = Object.assign({}, c.raw);

        c.scroll = this.getScrollPosition(c, event);
        c.raw = this.getRawPosition(c);

        if (Math.abs(c.scroll.left - originalScroll.left) >= 0.5 ||
            Math.abs(c.scroll.top - originalScroll.top) >= 0.5 ||
            Math.abs(c.raw.left - originalRaw.left) >= 0.5 ||
            Math.abs(c.raw.top - originalRaw.top) >= 0.5) {
            changed = true;
        }
        //});

        // console.log(Date.now(), this._containers['window'].scroll.top);

        if (changed) {
            this.eventEmitter.dispatch();
        }
    }

    handleDispatcher(e) {
        if (e.type === 'content:replaced') {
            this.handleContent();
        }

        if (e.type === 'scroll:lock') {
            this._locked = true;
        }

        if (e.type === 'scroll:unlock') {
            this._locked = false;
        }

        if (e.type === 'scroll:synth-change') {
            if (!this._locked) return;
            let container;

            if (e.container) {
                container = this._containers.find((c) => {
                    return c.element === e.container
                }).scroll.top = e.position;
            }

            if (container && container.mode !== 'smooth') {
                container.scroll.top = e.position;
            } else {
                this._containers['window'].scroll.top = e.position;
            }

            this.eventEmitter.dispatch();
        }
    }

    getData() {
        let data = Object.assign({}, {
            containers: this._containers,
            locked: this._locked,
            mode: this._containers['window'].mode,
            top: this._containers['window'].scroll.top,
            left: this._containers['window'].scroll.left,
            raw: this._containers['window'].raw
        });

        return data;
    }
}

let scrollStore = new ScrollStore();
scrollStore.init();

export default {
    subscribe: scrollStore.eventEmitter.subscribe.bind(scrollStore),
    unsubscribe: scrollStore.eventEmitter.unsubscribe.bind(scrollStore),
    getData: scrollStore.getData,
};
