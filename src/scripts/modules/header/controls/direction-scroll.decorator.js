import { attach, detach, update } from "../../utils/decorator.utils.js";
import scrollStore from "../../scroll/scroll.store.js";

const name = "direction-scroll"; // указать дефолтное имя декоратора

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

        this.handleScroll = this.handleScroll.bind(this);
        this.checkFlag = this.checkFlag.bind(this);

        this._scrolled = 0;
        this._direction = "top";
    }

    init() {
        this._parent._showTopFlags.push(this.checkFlag);

        this.handleScroll();
        scrollStore.subscribe(this.handleScroll);
    }

    destroy() {
        this._parent._showTopFlags.remove(this.checkFlag);

        scrollStore.unsubscribe(this.handleScroll);
    }

    handleScroll() {
        let scrolled = scrollStore.getData().top;
        scrolled = scrolled < 0 ? 0 : scrolled;
        if (scrolled > this._scrolled) {
            if (this._direction === "top") {
                this._direction = "bottom";
                this._parent.checkFlags();
            }
        } else if (scrolled < this._scrolled) {
            if (this._direction === "bottom") {
                this._direction = "top";
                this._parent.checkFlags();
            }
        }

        this._scrolled = scrolled;
    }

    checkFlag() {
        return this._direction === "top";
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
