import filterRangeDecorator from "./decorators/filter-range.decorator";

// check decorator for options

const decorators = [filterRangeDecorator];

const defaultOptions = {
    __namespace: "",
};

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
}

customElements.define("filter-range", ElementClass);

export default ElementClass;
