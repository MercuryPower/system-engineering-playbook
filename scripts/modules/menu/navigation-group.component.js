import dispatcher from "../dispatcher.js";
import { datasetToOptions } from "../utils/component.utils.js";
import { getFocusable } from "../utils/dom.utils.js";

const decorators = [];

const defaultOptions = {
    __namespace: "",
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

        this._dd = this.getElementsByClassName("dd")[0];
        if (!this._dd) return;

        let focusable = getFocusable(this._dd);
        focusable.forEach((f) => {
            f.setAttribute("tabindex", -1);
        });

        this._link = this.getElementsByClassName("inner")[0];
        this._link.setAttribute("aria-haspopup", "true");
        this._link.setAttribute("aria-expanded", "false");

        this._link.addEventListener("focus", this.handleFocus);
        this._link.addEventListener("blur", this.handleBlur);

        this.addEventListener("mouseenter", this.handleMouseenter);
        this.addEventListener("mouseleave", () => {
            this.handleMouseleave({delay: 300});
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

        this.style.zIndex = 1;

        this._dd.classList.add("visible");
        this._link.setAttribute("aria-expanded", "true");

        let focusable = getFocusable(this._dd);
        focusable.forEach((f) => {
            f.setAttribute("tabindex", 0);
        });

        dispatcher.dispatch({
            type: "navigation-group:mouseenter",
            element: this,
        });
    }

    handleMouseleave(options) {
        options = Object.assign({
            delay: 0
        }, options);

        if (!this._active) return;
        this._active = false;

        this.style.zIndex = 0;

        clearTimeout(this._closeTO);

        this._closeTO = setTimeout(() => {
            this.style.zIndex = 0;

            this._dd.classList.remove("visible");
            this._link.setAttribute("aria-expanded", "false");

            let focusable = getFocusable(this._dd);
            focusable.forEach((f) => {
                f.setAttribute("tabindex", -1);
            });
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

        if (e.type === "navigation-group:mouseenter" && e.element !== this) {
            this.handleMouseleave();
        }
    }
}

customElements.define("navigation-group", ElementClass);

export default ElementClass;
