import dispatcher from '../dispatcher.js';
import { datasetToOptions } from '../utils/component.utils.js';

const decorators = [];

const defaultOptions = {
	__namespace: "",
	mode: "exclude", // "include",
	container: "replaceable-filter",
	setAddress: true,
	setHistory: false,
	setStore: true,
	setRoute: true
};

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this._active = null;
	}

	connectedCallback() {
		this._options = datasetToOptions(this.dataset, defaultOptions);

		this._buttons = Array.prototype.slice.call(this.getElementsByClassName('button'));
		this._filters = Array.prototype.slice.call(this.getElementsByClassName('filters'));

		this._buttons.forEach((b) => {
			b.addEventListener('click', () => {
				let id = b.getAttribute('data-id');
				if (id === this._active) return;
				this._active = id;

				this._buttons.forEach((ib) => {
					if (ib.getAttribute('data-id') === id) {
						ib.classList.add('active');
					} else {
						ib.classList.remove('active');
					}
				});

				this._filters.forEach((f) => {
					if (f.getAttribute('data-id') === id) {
						f.classList.add('active');
					} else {
						f.classList.remove('active');
					}
				});
			});
		})

		// code goes here
		decorators.forEach((d) => d.attach(this, this._options));
	}

	disconnectedCallback() {
		// code goes here
		decorators.forEach((d) => d.detach(this, this._options));
	}
}

customElements.define('filters-switch', ElementClass);

export default ElementClass;
