import dispatcher from '../dispatcher.js';

import basicTransition from './transitions/basic-transition.decorator.js';
import popupTransition from './transitions/popup-transition.decorator.js';
import popupMapTransition from './transitions/popup-map-transition.decorator.js';

const animations = [
	basicTransition,
	popupTransition,
	popupMapTransition,
];

let _clear = function () {
	let container = this._inner ? this._inner : this;
	container.innerHTML = ''
};

//.....

// для копирования элемента.
// если при анимации какой-то элемент должен остаться на экране.

let _copyElement = function(el) {
	var fake = el.cloneNode(true);
	// var rect = el.getBoundingClientRect();
	var styles = getComputedStyle(el);
	var container = this._inner ? this._inner : this;

	var offset, t, l;

	container.style.transform = 'none';
	offset = el.getBoundingClientRect();
	t = offset.top;
	l = offset.left;

	fake.style.position = 'fixed';
	fake.style.left = l + 'px';
	fake.style.top = t + 'px';
	fake.classList.add('fake');

	fake.style.fontFamily = styles.fontFamily;
	fake.style.fontSize = styles.fontSize;
	fake.style.fontWeight = styles.fontWeight;
	fake.style.color = styles.color;
	fake.style.textTransform = styles.textTransform;
	fake.style.letterSpacing = styles.letterSpacing;
	fake.style.lineHeight = styles.lineHeight;

	// для затухающей анимации

	// setTimeout(function() {
	// 	fake.classList.add('fake-animate');
	// 	setTimeout(function() {
	// 		fake.parentNode.removeChild(fake);
	// 	}, 1000);
	// }, 20);

	container.appendChild(fake);

	this._fake = fake;
};

let _handleDispatcher = function(e) {
	if (e.type === 'page-transition:start') {
		this._transitions[e.transitionData.animation].start(e.transitionData, e.containers);
	}

	if (e.type === 'page-transition:end') {
		this._transitions[e.transitionData.animation].end(e.transitionData, e.containers);
	}

	// if (e.type === 'page-transition:copy-element') {
	// 	_copyElement.call(this, e.copyElement);
	// }

	// if (e.type === 'page-transition:clear-container') {
	// 	_clear.call(this);
	// }
};

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleDispatcher = _handleDispatcher.bind(this);
		this.copyElement = _copyElement.bind(this);
		this._transitions = {};
		this._inner = this.getElementsByClassName('inner')[0];
	}

	connectedCallback() {
		animations.forEach((a) => a.attach(this));

		dispatcher.subscribe(this.handleDispatcher);
	}

	disconnectedCallback() {
		animations.forEach((a) => a.detach(this));

		dispatcher.unsubscribe(this.handleDispatcher);
	}
}

customElements.define('page-transition', ElementClass);

export default ElementClass;
