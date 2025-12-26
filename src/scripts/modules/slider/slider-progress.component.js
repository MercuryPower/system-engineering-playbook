import dispatcher from '../dispatcher.js';
import {datasetToOptions} from '../utils/component.utils.js';
import sliderStore from "./slider.store";

const decorators = [];

const defaultOptions = {
	__namespace: '',
	id: "undefined",
};

const _handleStore = function () {
	let storeData = sliderStore.getData()[this._options.id];

	if (!storeData) return;
	if (storeData.index === null) return;
	if (storeData.index === this._index) return;

	if (this._items[this._index]) {
		this._items[this._index].classList.remove('active');
	}

	this._index = storeData.index;

	if (this._items[this._index]) {
		this._items[this._index].classList.add('active');
	}
};

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleStore = _handleStore.bind(this);
		this._options = datasetToOptions(this.dataset, defaultOptions);
	}
	connectedCallback() {
		// code goes here
		decorators.forEach((d) => d.attach(this, this._options));
		this._items = this.getElementsByClassName('item');

		this.handleStore();
		sliderStore.subscribe(this.handleStore);
	}
	disconnectedCallback() {
		// code goes here
		decorators.forEach((d) => d.detach(this, this._options));
	}
}

customElements.define('slider-progress', ElementClass);

export default ElementClass;
