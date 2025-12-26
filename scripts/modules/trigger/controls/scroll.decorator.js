import { attach, detach, update } from "../../utils/decorator.utils.js";
import { datasetToOptions } from "../../utils/component.utils.js";
import resizeStore from "../../resize/resize.store.js";
import scrollStore from "../../scroll/scroll.store.js";
import pageLoadStore from "../../page-load/page-load.store.js";

const name = "scroll"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    __namespace: "trigger",
    name: name,
    type: "scroll",
    scrollShift: -50,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);

        this.handleScroll = this.handleScroll.bind(this);
        this.handleContent = this.handleContent.bind(this);

        this._wasInitial = false;
    }

    init() {
        this.handleContent();
        this._parent._handleContentArray.push(this.handleContent);

        this.handleScroll({
            initial: true,
        });

        scrollStore.subscribe(this.handleScroll);
    }

    destroy() {
        this._parent._handleContentArray.remove(this.handleContent);
        scrollStore.subscribe(this.handleScroll);
    }

    handleContent() {
        this._parent._elements.forEach((el) => {
            if (el.type !== this._options.type) return;
            el = Object.assign({}, defaultOptions, el);
            el = datasetToOptions(el.element.dataset, el);
        });

        this.handleScroll({
            initial: true,
        });
    }

    handleScroll(options) {
        options = Object.assign(
            {
                initial: false,
            },
            options
        );

        if (options.initial) {
            options.duration = 0;
        }

        let loaded = pageLoadStore.getData().loaded;

        let scrollShift = this._options.scrollShift;

        if (options.initial || this._wasInitial) {
            this._wasInitial = true;
            scrollShift = 0; // scrollShift is 0 if page just loaded
        }

        // if (!loaded) {
        //     return;
        // } else {
        //  this._wasInitial = false;
        // }

        let elements = this._parent._elements.filter((el) => {
            return el.type === this._options.type;
        });

        let scrolled = scrollStore.getData().top;
        let wh = resizeStore.getData().height;

        elements.forEach((el) => {
            let element = el.element;
            let position = element._position.getExcept({
                name: "trigger-animation",
            });

            if (scrolled > position.top + position.height - scrollShift) {
                // element is higher then screen
                if (el._scrollTriggerState === 1) return;

                this._parent.getTargets(el).forEach((t) => {
                    t.classList.add("triggered-once");
                    t.classList.remove("triggered");
                    t.classList.remove("triggered-from-top");
                    t.classList.remove("triggered-from-bottom");
                });

                this._parent.trigger(el, options);
                this._parent.untrigger(el, options);

                el._scrollTriggerState = 1;
            } else if (scrolled + wh >= position.top - scrollShift) {
                // element is on screen
                if (el._scrollTriggerState === 0) return;

                if (
                    el._scrollTriggerState === undefined ||
                    el._scrollTriggerState === -1
                ) {
                    this._parent.getTargets(el).forEach((t) => {
                        t.classList.remove("triggered-from-bottom");
                        t.classList.add("triggered");
                        t.classList.add("triggered-once");
                        t.classList.add("triggered-from-top");
                    });
                } else {
                    this._parent.getTargets(el).forEach((t) => {
                        t.classList.remove("triggered-from-top");
                        t.classList.add("triggered");
                        t.classList.add("triggered-once");
                        t.classList.add("triggered-from-bottom");
                    });
                }

                this._parent.trigger(el, options);

                el._scrollTriggerState = 0;
            } else {
                // element is lower then screen
                if (el._scrollTriggerState === -1) return;

                this._parent.getTargets(el).forEach((t) => {
                    t.classList.remove("triggered");
                    t.classList.remove("triggered-from-top");
                    t.classList.remove("triggered-from-bottom");
                });

                this._parent.untrigger(el, options);

                el._scrollTriggerState = -1;
            }
        });
    }
}

export default {
    attach: (parent, options) => {
        return attach(
            Decorator,
            parent,
            Object.assign({}, defaultOptions, options)
        );
    },
    detach: (parent, options) => {
        return detach(parent, Object.assign({}, defaultOptions, options));
    },
    update: (parent, options) => {
        return update(parent, options);
    },
};