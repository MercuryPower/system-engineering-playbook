import { attach, detach, update } from "../../utils/decorator.utils.js";
import { offset } from "../../utils/dom.utils.js";
import dispatcher from "../../dispatcher.js";
import resizeStore from "../../resize/resize.store.js";
import scrollStore from "../../scroll/scroll.store.js";
import { simpleTween } from "../../utils/animation.utils.js";

const name = "scroll-to"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    name: name,
    dynamicDuration: false,
    duration: 0.6,
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

    getPropertyes(e) {
        let position;
        let scrolled = scrollStore.getData().top;
        let pw = document.getElementsByClassName("page-wrapper")[0];

        if (e.hasOwnProperty("position") && typeof e.position === "number") {
            position = e.position;
        } else if (e.position === "home") {
            position = 0;
        } else if (e.position === "end") {
            position = pw.clientHeight - resizeStore.getData().height;
        } else if (e.hasOwnProperty("element")) {
            position = offset(e.element).top;
        } else {
            console.error("no scroll position or element were specified");
            return;
        }

        if (position > pw.clientHeight - resizeStore.getData().height) {
            position = pw.clientHeight - resizeStore.getData().height;
        }

        if (position < 0) {
            position = 0;
        }

        let duration;

        if (e.duration === "dynamic") {
            duration = Math.abs(scrolled - position) / 4000 + 0.3;
        } else if (
            e.hasOwnProperty("duration") &&
            typeof e.duration === "number"
        ) {
            duration = e.duration;
        } else {
            duration = this._options.duration;
        }

        return {
            duration: duration,
            position: position,
        };
    }

    setScrollPosition(value) {
        let scrollLocked = scrollStore.getData().locked;

        dispatcher.dispatch({
            type: "scroll:synth-change",
            position: value,
        });

        if (scrollLocked) {
            dispatcher.dispatch({
                type: "scroll:lock-set",
                position: value,
            });
        } else {
            window.scrollTo(0, value);
        }
    }

    scroll(options) {
        let duration = options.duration || 0.6;
        let scrolled = scrollStore.getData().top;

        if (this.currentTween) {
            this.currentTween.kill();
        }

        if (duration === 0) {
            window.scrollTo(0, Math.floor(pos));
        } else {
            this.currentTween = simpleTween(
                {
                    from: scrolled,
                    to: options.position,
                    duration: duration,
                    ease: window._vars.ease.bezier.ease,
                },
                (animationData) => {
                    this.setScrollPosition(Math.floor(animationData.value));
                }
            );
        }
    }

    handleDispatcher(e) {
        if (e.type === "scroll:to") {
            this.scroll(this.getPropertyes(e));
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
