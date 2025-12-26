import { attach, detach, update } from "../../utils/decorator.utils.js";
import dispatcher from "../../dispatcher.js";
import scrollStore from "../../scroll/scroll.store.js";
import resizeStore from "../../resize/resize.store.js";

const name = "scroll-lock"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    name: name,
    fixedClass: "fx",
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);

        this.handleDispatcher = this.handleDispatcher.bind(this);
    }

    init() {
        dispatcher.subscribe(this.handleDispatcher);
    }

    destroy() {
        dispatcher.unsubscribe(this.handleDispatcher);
    }

    setIndents(diff) {
        let fixedElements = document.getElementsByClassName(this._options.fixedClass);

        Array.prototype.forEach.call(fixedElements, function (el) {
            let indent = el.getAttribute("data-indent") || "margin";
            diff = Math.max(diff, 0);

            if (indent === "padding") {
                el.style.paddingRight = diff + "px";
            } else if (indent === "margin") {
                el.style.marginRight = diff + "px";
            } else if (indent === "right") {
                el.style.right = diff + "px";
            }
        });
    }

    lock() {
        let pw = document.getElementsByClassName("page-wrapper")[0];
        let body = document.body;

        let dw1 = pw.clientWidth;
        body.classList.add("prevent-scroll");

        let diff = pw.clientWidth - dw1;

        if (diff !== 0) {
            this.setIndents(diff);

            dispatcher.dispatch({
                type: "resize:soft-resize",
            });
        }

        if (!scrollStore.getData().smooth) {
            this.setBodyFixed();
        }

        dispatcher.dispatch({
            type: "scroll:prevent",
        });
    }

    unlock() {
        let pw = document.getElementsByClassName("page-wrapper")[0];
        let body = document.body;

        this.setIndents(0);

        let dw1 = pw.clientWidth;
        body.classList.remove("prevent-scroll");

        let diff = pw.clientWidth - dw1;

        if (diff !== 0) {
            dispatcher.dispatch({
                type: "resize:soft-resize",
            });
        }

        this.removeBodyFixed();

        dispatcher.dispatch({
            type: "scroll:release",
        });
    }

    setBodyFixed() {
        let scrolled = scrollStore.getData().top;
        let body = document.body;

        this._bodyShift = scrolled;
        body.style.top = -this._bodyShift + "px";

        window.scrollTo(0, 0);
    }

    removeBodyFixed() {
        let body = document.body;

        body.style.top = "";
        window.scrollTo(0, this._bodyShift);
    }

    handleDispatcher(e) {
        if (e.type === "scroll:set-indents") {
            this.setIndents(e.diff);
        }

        if (e.type === "scroll:lock-lock") {
            this._lockLocked = true;
        }

        if (e.type === "scroll:unlock-lock") {
            this._lockLocked = false;
        }

        if (e.type === "scroll:lock-set") {
            this._bodyShift = e.position;

            let body = document.body;

            requestAnimationFrame(() => {
                body.style.top = -this._bodyShift + "px";
            });
        }

        if (this._lockLocked) return;

        if (e.type === "scroll:lock") {
            this.lock();
        }

        if (e.type === "scroll:unlock") {
            this.unlock();
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