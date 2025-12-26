import { attach, detach, update } from "../utils/decorator.utils.js";
import popupStore from "./popup.store.js";
import dispatcher from '../dispatcher.js';
import {datasetToOptions} from "../utils/component.utils";

const name = "popup-toggle"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    name: name,
    sliderTo: 0
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = datasetToOptions(this._parent.dataset, defaultOptions);

        this.handleClick = this.handleClick.bind(this);
        this.handleStore = this.handleStore.bind(this);
    }

    init() {
        this._id = this._parent.getAttribute("data-id");
        this._parent.setAttribute("aria-haspopup", "true");

        this._parent.addEventListener("click", this.handleClick);
        popupStore.subscribe(this.handleStore);
        this.handleStore();
    }

    destroy() {
        this._parent.removeEventListener("click", this.handleClick);
        popupStore.unsubscribe(this.handleStore);
    }

    handleStore() {
        var active = popupStore.getData().active;
        if (this._parent.classList.contains("close-all")) {
            if (active) {
                this._parent.setAttribute("aria-expanded", "true");
                if (active !== "showreel-popup") {
                    this._parent.classList.add("active");
                }
            } else {
                this._parent.setAttribute("aria-expanded", "false");
                this._parent.classList.remove("active");
            }
        } else {
            if (active === this._id) {
                this._parent.setAttribute("aria-expanded", "true");
                this._parent.classList.add("active");
            } else {
                this._parent.setAttribute("aria-expanded", "false");
                this._parent.classList.remove("active");
            }
        }
    }

    handleClick() {
        var active = popupStore.getData().active;
        var element;
        var target = this._parent.getAttribute("data-target");

        if (target) {
            element = this._parent.querySelector(target);
        } else {
            element = this._parent;
        }

        if (this._parent.classList.contains("close-all") && active) {
            dispatcher.dispatch({
                type: "popup:close",
                element: element,
            });
        } else {
            dispatcher.dispatch({
                type: "popup:toggle",
                id: this._id,
                element: element,
                sliderTo: this._options.sliderTo
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
