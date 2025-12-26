import dispatcher from '../modules/dispatcher.js';
import {datasetToOptions} from '../modules/utils/component.utils.js';

const decorators = [];

const defaultOptions = {
	__namespace: ''
}

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this._options = datasetToOptions(this.dataset, defaultOptions);
	}
	connectedCallback() {
		// code goes here
		decorators.forEach((d) => d.attach(this, this._options));
	}
	disconnectedCallback() {
		// code goes here
		decorators.forEach((d) => d.detach(this, this._options));
	}
}

customElements.define('component-name', ElementClass);

export default ElementClass;
