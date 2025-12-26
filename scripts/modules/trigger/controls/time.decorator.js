import { attach, detach, update } from "../../utils/decorator.utils.js";
import { datasetToOptions } from "../../utils/component.utils.js";
import resizeStore from "../../resize/resize.store.js";
import scrollStore from "../../scroll/scroll.store.js";
import pageLoadStore from "../../page-load/page-load.store.js";

const name = "time"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    __namespace: "trigger",
    name: name,
    type: "time",
    delay: 0,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);

        this.handlePageLoad = this.handlePageLoad.bind(this);
        this.handleContent = this.handleContent.bind(this);
    }

    init() {
        this.handleContent();
        this._parent._handleContentArray.push(this.handleContent);

        this.handlePageLoad();
        pageLoadStore.subscribe(this.handlePageLoad);
    }

    destroy() {
        this._parent._handleContentArray.remove(this.handleContent);
        pageLoadStore.unsubscribe(this.handlePageLoad);
    }

    handleContent() {
        this._parent._elements
            .filter((el) => {
                return el.type === this._options.type;
            })
            .forEach((el) => {
                el.timeOptions = datasetToOptions(
                    el.element.dataset,
                    defaultOptions
                );
            });
    }

    handlePageLoad() {
        let loaded = pageLoadStore.getData().loaded;

        let elements = this._parent._elements.filter((el) => {
            return el.type === this._options.type;
        });

        if (!loaded) {
            elements.forEach((el) => {
                if (!el.triggered) return;
                el.triggered = false;

                clearTimeout(el.timeOut);

                this._parent.getTargets(el).forEach((t) => {
                    t.classList.remove("triggered");
                });

                this._parent.untrigger(el);
            });
        } else {
            elements.forEach((el) => {
                if (el.triggered) return;
                el.triggered = true;

                el.timeOut = setTimeout(() => {
                    this._parent.getTargets(el).forEach((t) => {
                        t.classList.add("triggered-once");
                        t.classList.add("triggered");
                    });
                }, el.timeOptions.delay * 1000);

                this._parent.trigger(el);
            });
        }
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