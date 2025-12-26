import tooltipDecorator from './tooltip.decorator';

const decorators = [tooltipDecorator];

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

customElements.define('tooltip-component', ElementClass);

export default ElementClass;
