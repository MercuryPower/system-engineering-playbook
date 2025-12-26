import filterLinkDecorator from "./decorators/filter-link.decorator.js";

// check decorator for options

const decorators = [filterLinkDecorator];

const defaultOptions = {
	__namespace: "",
};

class ElementClass extends HTMLAnchorElement {
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

customElements.define("filter-link", ElementClass, {
	extends: "a",
});

export default ElementClass;