import innerLinkDecorator from './inner-link.decorator.js';

const decorators = [innerLinkDecorator];

class ElementClass extends HTMLAnchorElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {}

	connectedCallback() {
		decorators.forEach((d) => d.attach(this));
	}

	disconnectedCallback() {
		decorators.forEach((d) => d.detach(this));
	}
}

customElements.define('inner-link', ElementClass, {extends: 'a'});

export default ElementClass;