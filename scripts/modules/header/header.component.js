import dispatcher from "../dispatcher.js";
import { datasetToOptions } from "../utils/component.utils.js";

import firstScrollDecorator from "./controls/first-scroll.decorator.js";
import directionScrollDecorator from "./controls/direction-scroll.decorator.js";
import popupDecorator from "./controls/popup.decorator.js";

import { FunctionArray } from "../utils/array.utils.js";

const decorators = [firstScrollDecorator, directionScrollDecorator, popupDecorator];

const defaultOptions = {
    __namespace: "",
};

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this.checkFlags = this.checkFlags.bind(this);

        this._showTopFlags = new FunctionArray();

        this._showTopFlags.push(() => {
            return true;
        });

        this._topHidden = false;
    }

    checkFlags() {
        if (this._showTopFlags.boolReduce()) {
            if (this._topHidden) {
                this._topHidden = false;
                this.classList.remove("hidden");
            }
        } else {
            if (!this._topHidden) {
                this._topHidden = true;
                this.classList.add("hidden");
            }
        }
    }

    connectedCallback() {
        this._options = datasetToOptions(this.dataset, defaultOptions);
        // code goes here
        decorators.forEach((d) => d.attach(this, this._options));
    }

    disconnectedCallback() {
        // code goes here
        decorators.forEach((d) => d.detach(this, this._options));
    }
}

customElements.define("header-component", ElementClass, {
    extends: "header"
});

export default ElementClass;
