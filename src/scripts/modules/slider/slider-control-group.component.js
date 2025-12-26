import dispatcher from '../dispatcher.js';
import sliderStore from './slider.store.js';

let _handleClick = function(el, index) {
	let self = this;

	el.addEventListener('click', function(e) {
		let storeData = sliderStore.getData()[self._id];

		if (!storeData) return;
		if (storeData.index === index) return;

		dispatcher.dispatch({
			type: 'slider:to',
			id: self._id,
			index: index
		});
	});
}

let _handleStore = function() {
	let storeData = sliderStore.getData()[this._id];
	let index;

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
		this._index = 0;

		this.handleStore = _handleStore.bind(this);
		this.handleClick = _handleClick.bind(this);
	}

	connectedCallback() {
		let self = this;

		this._items = this.getElementsByClassName('item');
		this._id = this.getAttribute('data-id');

		Array.prototype.forEach.call(this._items, this.handleClick);

		this.handleStore();
		sliderStore.subscribe(this.handleStore);
	}
	disconnectedCallback() {
		sliderStore.unsubscribe(this.handleStore);
	}
}

customElements.define('slider-control-group', ElementClass);

export default ElementClass;
