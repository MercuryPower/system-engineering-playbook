import { attach, detach, update } from "../../utils/decorator.utils.js";
import { positionDecorator } from "../../utils/dom.utils.js";
import { simpleTween } from "../../utils/animation.utils.js";

const name = "trigger-default"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    name: name,
    className: "trigger-default",
    shift: 100,
    duration: 0.6,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);
    }

    init() {}

    destroy() {}

    update(triggerData) {
        let triggerOptions = Object.assign(
            {},
            this._options,
            triggerData.options
        );

        this._parent._elements.forEach((el) => {
            if (!el.classList.contains(this._options.className)) return;

            if (
                !el._position ||
                !el._position.get({ name: "trigger-animation" })
            ) {
                positionDecorator.attach(el);
                el._position.push({
                    name: "trigger-animation",
                    value: {
                        top: this._options.shift,
                        left: 0,
                        width: 0,
                        height: 0,
                    },
                });
            }
        });
    }

    show(triggerData) {
        let element = triggerData.item.element;

        if (triggerData.item.helperTriggered) return;

        if (!element.classList.contains(this._options.className)) return;

        triggerData.item.helperTriggered = true;

        let triggerOptions = Object.assign(
            {},
            this._options,
            triggerData.options
        );

        simpleTween(
            {
                from: 0,
                to: triggerOptions.shift,
                duration: triggerOptions.duration,
                ease: window._vars.ease.bezier.easeOut,
            },
            (animationData) => {
                element._position.set({
                    name: "trigger-animation",
                    value: {
                        top: triggerOptions.shift - animationData.value,
                        left: 0,
                        width: 0,
                        height: 0,
                    },
                });
            }
        );
    }

    hide(triggerData) {
        let element = triggerData.item.element;

        if (!element.classList.contains(this._options.className)) return;
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