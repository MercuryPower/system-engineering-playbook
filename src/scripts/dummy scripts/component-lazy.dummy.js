import dispatcher from '../modules/dispatcher.js';
import {datasetToOptions} from '../modules/utils/component.utils.js';

import scrollStore from '../scroll/scroll.store.js';
import resizeStore from '../resize/resize.store.js';
import pageLoadStore from '../page-load/page-load.store.js';

import {offset} from '../modules/utils/dom.utils.js';

const defaultOptions = {
	__namespace: ''
}

let _handleScroll = function() {
	let scrolled = scrollStore.getData().top;
	let wh = resizeStore.getData().height;

	if (scrolled + wh > this._offset &&
		scrolled < this._offset + this._h) {


	}
}

let _handleResize = function() {
	let w = this.clientWidth;
	let h = this.clientHeight;

	this._offset = offset(this).top;

	if (w !== this._w ||
		h !== this._h) {
		this._w = this.clientWidth;
		this._h = this.clientHeight;


	}
}

let _loop = function() {
	if (this._destruct) return;

	requestAnimationFrame(this.loop);
}

let _handleLoad = function() {
	if (this._loaded) return;

	if (pageLoadStore.getData().loaded) {
		this._loaded = true;

		this.handleResize();
		this.handleScroll();
		resizeStore.subscribe(this.handleResize);
		scrollStore.subscribe(this.handleScroll);

		this.loop();
	}
}

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this._options = datasetToOptions(this.dataset, defaultOptions);
		this._loaded = false;

		this.handleScroll = _handleScroll.bind(this);
		this.handleResize = _handleResize.bind(this);
		this.handleLoad = _handleLoad.bind(this);
		this.loop = _loop.bind(this);
	}
	connectedCallback() {
		pageLoadStore.subscribe(this.handleLoad);
		decorators.forEach((d) => d.attach(this, this._options));
	}
	disconnectedCallback() {
		this._destruct = true;
		pageLoadStore.unsubscribe(this.handleLoad);

		if (this._loaded) {
			scrollStore.unsubscribe(this.handleScroll);
			resizeStore.unsubscribe(this.handleResize);
		}
		decorators.forEach((d) => d.detach(this, this._options));
	}
}

customElements.define('lazy-component', ElementClass);

export default ElementClass;
