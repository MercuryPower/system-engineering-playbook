import dispatcher from "../dispatcher.js";
import filterSelectDecorator from "./decorators/filter-select.decorator.js";

// check decorator for options

const decorators = [filterSelectDecorator];

const defaultOptions = {
	__namespace: "",
};

class ElementClass extends HTMLSelectElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {}

	connectedCallback() {
		decorators.forEach((d) => d.attach(this, this._options));
	}

	disconnectedCallback() {
		decorators.forEach((d) => d.detach(this, this._options));
	}
}

customElements.define("filter-select", ElementClass, {
	extends: "select",
});

export default ElementClass;