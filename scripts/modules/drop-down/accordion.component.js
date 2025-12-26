// <accordion-component>
//		<drop-down></drop-down>
//		<drop-down></drop-down>
// </accordion-component>

// аккордеон, просто закрывает дроп-дауны внутри, когда открывается другой

import dispatcher from '../dispatcher.js';

let _handleChange = function(dd) {
	if (!dd._active) {
		document.removeEventListener('click', this.handleClick)
		this._active = false;
	} else {
		setTimeout(( ) => {
			document.addEventListener('click', this.handleClick)
		}, 300)

		if (this._active) {
			this._active.hide();
		}

		this._active = dd;
	}
}

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this._active = false;
		this.handleClick = this.handleClick.bind(this);
		this.handleChange = _handleChange.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
	}
	connectedCallback() {
		let self = this;
		this._dropDowns = this.getElementsByClassName('drop-down');

		Array.prototype.forEach.call(this._dropDowns, function(dd) {
			dd.onChange = function() {
				self.handleChange(dd);
			}
		});
	}
	disconnectedCallback() {

	}

	handleDispatcher(e) {
	}

	handleClick(e) {
		let target = e.target;
		if (
			target.classList.contains('drop-down') ||
			target.closest('.drop-down') ||
			target.closest('.dd-inner') ||
			target.closest("a") ||
			target.closest("button")
		) {
		} else {
			this._active.hide()
		}
	}
}

customElements.define('accordion-component', ElementClass);

export default ElementClass;
