import dispatcher from "../dispatcher.js";
import { datasetToOptions } from "../utils/component.utils.js";
import { getFocusable } from "../utils/dom.utils.js";

const decorators = [];

const defaultOptions = {
    __namespace: "",
    id: 0,
};

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this.handleMouseenter = this.handleMouseenter.bind(this);
        this.handleMouseleave = this.handleMouseleave.bind(this);
        this.handleDispatcher = this.handleDispatcher.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

        this._active = false;
        this._linkFocus = false;
    }

    connectedCallback() {
        this._options = datasetToOptions(this.dataset, defaultOptions);

        // this._link = this.getElementsByClassName("inner")[0];
        // this._link.setAttribute("aria-haspopup", "true");
        // this._link.setAttribute("aria-expanded", "false");
        //
        // this.addEventListener("focus", this.handleFocus);
        // this.addEventListener("blur", this.handleBlur);

        this._map = document.querySelector('.maps_history')

        this.addEventListener("mouseenter", this.handleMouseenter);
        this.addEventListener("mouseleave", () => {
            this.handleMouseleave({delay: 100});
        });

        dispatcher.subscribe(this.handleDispatcher);
        decorators.forEach((d) => d.attach(this, this._options));
    }

    disconnectedCallback() {
        decorators.forEach((d) => d.detach(this, this._options));
    }

    handleMouseenter() {
        if (this._active) return;
        this._active = true;

        clearTimeout(this._closeTO);

        this._map.classList.add(`active-${this._options.id}`);

        dispatcher.dispatch({
            type: "card-map:mouseenter",
            element: this,
        });
    }

    handleMouseleave(options) {
        options = Object.assign({
            delay: 0
        }, options);

        if (!this._active) return;
        this._active = false;

        clearTimeout(this._closeTO);

        this._closeTO = setTimeout(() => {
            this._map.classList.remove(`active-${this._options.id}`);
        }, options.delay);
    }

    handleFocus() {
        this._linkFocus = true;
    }

    handleBlur() {
        this._linkFocus = false;
    }

    handleDispatcher(e) {
        if (e.type === "keyboard:tab" || e.type === "keyboard:shift-tab") {
            if (!this._active) return;

            setTimeout(() => {
                let activeElement = document.activeElement;
                if (!this.contains(activeElement)) {
                    this.handleMouseleave();
                }
            }, 0);
        }

        if (e.type === "keyboard:enter" && this._linkFocus) {
            e.event.preventDefault();

            if (!this._active) {
                this.handleMouseenter();
            } else {
                this.handleMouseleave();
            }
        }

        if (e.type === "card-map" && e.element !== this) {
            this.handleMouseleave();
        }
    }
}

customElements.define("card-map", ElementClass);

export default ElementClass;
