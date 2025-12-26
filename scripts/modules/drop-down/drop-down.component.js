import dispatcher from '../dispatcher.js';
import scrollStore from '../scroll/scroll.store';
import {TweenMax} from 'gsap/TweenMax';

// <drop-down>
// 		<button class="dd-button">header</button>
//		<div class="dd-wrapper">
//			<div class="dd-inner">
//				.......
//				.......
//			</div>
//		</div>
// </drop-down>

let elementProto = Object.create(HTMLElement.prototype);

let _show = function(speed) {
	let self = this;
	let th = this._in.clientHeight;

	if (speed === undefined) {
		speed = 1;
	}

	this.classList.add('active');
	this._button.classList.add('active');
	this._button.setAttribute('aria-expanded', 'true');
	this._active = true;

	if (this.onChange) {
		this.onChange();
	}

	if (this._textChange) {
		this._buttonText.textContent = this._textChange.split(';')[0];
	}

	TweenMax.killTweensOf(this._wr);
	TweenMax.to(this._wr, 0.6 * speed, {
		height: th,
		ease: Power2.easeInOut,
		onComplete: function() {
			self._wr.style.height = 'auto';
		}
	});
}

let _hide = function(speed) {
	this.classList.remove('active');
	this._button.classList.remove('active');
	this._button.setAttribute('aria-expanded', 'false');
	this._active = false;

	if (speed === undefined) {
		speed = 1;
	}

	if (this.onChange) {
		this.onChange();
	}

	if (this._textChange) {
		this._buttonText.textContent = this._textChange.split(';')[1];
	}

	TweenMax.killTweensOf(this._wr);
	TweenMax.to(this._wr, 0.5 * speed, {
		height: 0,
		ease: Power2.easeInOut,
	});
}

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.show = _show.bind(this);
		this.hide = _hide.bind(this);
		this._active = false;

		this.handleDispatcher = this.handleDispatcher.bind(this);
	}
	connectedCallback() {
		let self = this;

		this._button = this.getElementsByClassName('dd-button')[0];

		this._buttonText = this.getElementsByClassName('dd-button__title')[0];
		this._textChange = this._buttonText.dataset.textChange || false;

		this._wr = this.getElementsByClassName('dd-wrapper')[0];
		this._in = this.getElementsByClassName('dd-inner')[0];

		this._button.setAttribute('aria-haspopup', 'true');
		this._button.setAttribute('aria-expanded', 'false');

		this._button.addEventListener('click', function(e) {
			if (self._active) {
				self.hide();
			} else {
				self.show();
			}
		});

		if (this.classList.contains('active')) {
			this.show(0);
		}

		dispatcher.subscribe(this.handleDispatcher);
	}

	disconnectedCallback() {
		dispatcher.unsubscribe(this.handleDispatcher);
	}

	handleDispatcher(e) {
		if (e.type === 'tab:to' && e.id === 'maps') {
			this.hide();
		}

		if (e.type === 'filter:set' && e.name === 'regions') {
			this.hide();
		}
	}
}

customElements.define('drop-down', ElementClass);

export default ElementClass;
