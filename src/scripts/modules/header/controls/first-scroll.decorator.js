import { attach, detach, update } from "../../utils/decorator.utils.js";
import scrollStore from "../../scroll/scroll.store.js";

const name = "first-scroll"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    name: name,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = options;

        this._scrolled = false;

        this.handleScroll = this.handleScroll.bind(this);
        this.checkFlag = this.checkFlag.bind(this);
    }

    init() {
        scrollStore.subscribe(this.handleScroll);
    }

    destroy() {
        scrollStore.unsubscribe(this.handleScroll);
    }

    handleScroll() {
        if (scrollStore.getData().top > 0) {
            if (!this._scrolled) {
                this._scrolled = true;
                this._parent.checkFlags();
            }
        } else {
            if (this._scrolled) {
                this._scrolled = false;
                this._parent.checkFlags();
            }
        }
    }

    checkFlag() {
        return !this._scrolled;
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
