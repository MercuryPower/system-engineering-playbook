import dispatcher from '../dispatcher.js';
import popupStore from './popup.store.js';

var _handleClick = function () {
	dispatcher.dispatch({
		type: 'popup:close-all',
	});
};

class ElementClass extends HTMLButtonElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleClick = _handleClick.bind(this);
	}
	connectedCallback() {
		this.addEventListener('click', this.handleClick);
	}
	disconnectedCallback() {}
}

customElements.define('popup-close', ElementClass, { extends: 'button' });

export default ElementClass;