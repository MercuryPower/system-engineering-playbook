import dispatcher from '../dispatcher.js';
import filterDateDecorator from "./decorators/filter-date.decorator.js";

const decorators = [filterDateDecorator];

const defaultOptions = {
    __namespace: ''
}


class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
    }

    connectedCallback() {
        decorators.forEach((d) => d.attach(this, this._options));
    }

    disconnectedCallback() {
        decorators.forEach((d) => d.detach(this, this._options));
    }

    handleClick() {

    }
}

customElements.define('date-component', ElementClass);

export default ElementClass;
