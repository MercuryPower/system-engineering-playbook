import dispatcher from '../dispatcher.js';
import sliderStore from './slider.store.js';

let _handleSliderClick = function() {
	if (this._mode === 'arrow') {
		dispatcher.dispatch({
			type: 'slider:' + this._to,
			id: this._id,
			userData: {
				direction: this._to
			}
		});
	} else if (this._mode === 'goto') {
		dispatcher.dispatch({
			type: 'slider:to',
			index: this._to,
			id: this._id
		});
	}
}
let _handleSliderStore = function() {
	let slider = sliderStore.getData()[this._id];
	if (!slider) return;

	if (this._mode === 'arrow' && !slider.continuous) {
		if (slider.index === 0 && this._to === 'prev') {
			this.classList.add('disabled');
			this.setAttribute('aria-disabled', true);
		} else if (slider.index === slider.total - 1  && this._to === 'next') {
			this.classList.add('disabled');
			this.setAttribute('aria-disabled', true);
		} else {
			this.classList.remove('disabled');
			this.removeAttribute('aria-disabled');
		}
	} else if (this._mode === 'goto') {
		if (slider.index === this._to) {
			this.classList.add('disabled');
			this.setAttribute('aria-current', true);
		} else {
			this.classList.remove('disabled');
			this.removeAttribute('aria-current');
		}
	}
}

class ElementClass extends HTMLButtonElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleSliderClick = _handleSliderClick.bind(this);
		this.handleSliderStore = _handleSliderStore.bind(this);
	}

	connectedCallback() {
		let validValues = ['next', 'prev'];

		this._id = this.getAttribute('data-id');
		this._to = this.getAttribute('data-to');

		if (validValues.indexOf(this._to) === -1) {
			this._to = parseInt(this._to);
			this._mode = 'goto';
		} else {
			this._mode = 'arrow';
		}

		this.handleSliderStore();
		sliderStore.subscribe(this.handleSliderStore);
		this.addEventListener('click', this.handleSliderClick);
	}
	disconnectedCallback() {
		sliderStore.unsubscribe(this.handleSliderStore);
		this.removeEventListener('click', this.handleSliderClick);
	}
}

customElements.define('slider-control', ElementClass, {extends: 'button'});

export default ElementClass;
