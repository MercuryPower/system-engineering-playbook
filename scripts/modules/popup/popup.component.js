import dispatcher from '../dispatcher.js';
import popupStore from './popup.store.js';

var _preventTouchScroll = function (e) {
	e.stopPropagation();
};

var _openAnimation = function () {
	this.classList.add('active');
};

var _closeAnimation = function () {
	this.classList.remove('active');
};

var _closest = function (el, cl) {
	if (!el || !el.parentNode) return null;
	if (el.classList.contains(cl)) {
		return el;
	}
	return closest(el.parentNode, cl);
};

var _open = function () {
	var overflow;
	var focusable;

	focusable = this.querySelectorAll('button, a, input, select, textarea, .focusable');

	Array.prototype.forEach.call(focusable, function (el) {
		if (el.classList.contains('non-focusable')) return;
		el.setAttribute('tabindex', '0');
	});

	if (typeof this.onOpen === 'function') {
		this.onOpen();
	}

	this._active = true;

	this.openAnimation();

	this.removeAttribute('inert');

	overflow = this.getElementsByClassName('overflow')[0];

	if (overflow) {
		overflow.addEventListener('touchmove', _preventTouchScroll);
	}
};

var _close = function () {
	var overflow;
	var inner;
	var focusable;

	focusable = this.querySelectorAll('button, a, input, select, textarea, .focusable');

	Array.prototype.forEach.call(focusable, function (el) {
		if (el.classList.contains('non-focusable')) return;
		el.setAttribute('tabindex', '-1');
	});

	if (typeof this.onClose === 'function') {
		this.onClose();
	}

	this._active = false;

	this.closeAnimation();

	this.setAttribute('inert', '');

	overflow = this.getElementsByClassName('overflow')[0];

	if (overflow) {
		overflow.removeEventListener('touchmove', _preventTouchScroll);
	}
};
var _handleStore = function () {
	var active = popupStore.getData().active;
	var body = document.getElementsByTagName('body')[0];
	var self = this;

	if (!this._active && active === this._id) {
		self.open();
	} else if (this._active && active !== this._id) {
		this.close();
	}
};

var _closeAll = function () {
	dispatcher.dispatch({
		type: 'popup:close-all',
	});
};

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.open = _open.bind(this);
		this.close = _close.bind(this);
		this.handleStore = _handleStore.bind(this);
		this.closeAll = _closeAll.bind(this);
		this.openAnimation = _openAnimation.bind(this);
		this.closeAnimation = _closeAnimation.bind(this);
	}
	connectedCallback() {
		this._id = this.getAttribute('data-id');
		this._active = false;

		this.setAttribute('role', 'dialog');
		this.setAttribute('aria-modal', 'true');

		this.close();
		popupStore.subscribe(this.handleStore);
	}
	disconnectedCallback() {
		popupStore.unsubscribe(this.handleStore);
	}
}

customElements.define('popup-component', ElementClass);

export default ElementClass;
