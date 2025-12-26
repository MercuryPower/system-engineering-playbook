import dispatcher from '../dispatcher.js';
import scrollStore from '../scroll/scroll.store.js';
import resizeStore from '../resize/resize.store.js';
import {offset} from '../utils/dom.utils.js';
import {datasetToOptions} from '../utils/component.utils.js';

let handleScroll = function() {
	let scrolled = scrollStore.getData().top;
	let wh = resizeStore.getData().height;
	
	if (scrolled > this._offset + this._height) {
		if (this._state !== 1) {
			this._state = 1;
			dispatcher.dispatch({
				type: 'trigger:hide',
				id: this._id,
				from: 'bottom'
			});
		}
	} else if (scrolled + wh >= this._offset) {
		if (this._state === 1) {
			this._state = 0;
			dispatcher.dispatch({
				type: 'trigger:show',
				id: this._id,
				from: 'top'
			});
		} else if (this._state === -1) {
			this._state = 0;
			dispatcher.dispatch({
				type: 'trigger:show',
				id: this._id,
				from: 'bottom'
			});
		}
	} else {
		if (this._state !== -1) {
			this._state = -1;
			dispatcher.dispatch({
				type: 'trigger:hide',
				id: this._id,
				from: 'top'
			});
		}
	}
}

let handleResize = function() {
	let top = offset(this).top;
	this._offset = top;
	this._height = this.clientHeight;
}

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleScroll = handleScroll.bind(this);
		this.handleResize = handleResize.bind(this);
	}
	connectedCallback() {
		this._state = -1;
		this._id = this.getAttribute('data-id');
		resizeStore.subscribe(this.handleResize);
		scrollStore.subscribe(this.handleScroll);
	}
	disconnectedCallback() {
		resizeStore.unsubscribe(this.handleResize);
		scrollStore.unsubscribe(this.handleScroll);
	}
}

customElements.define('scroll-trigger', ElementClass);

export default ElementClass;