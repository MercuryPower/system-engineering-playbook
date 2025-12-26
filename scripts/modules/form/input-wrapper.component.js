import dispatcher from '../dispatcher.js';
import Inputmask from "inputmask";


let idNum = 1;
let idName = 'input-wrapper-';

let _showError = function(type) {
	let text;
	let self = this;

	this.classList.add('error');
	this._input.setAttribute('aria-invalid', true);
}

let _checkValidity = function(submitted) {
	let errorType = null;
	let val1, val2;
	let group, groupInputs, groupCheckboxes;
	let groupCheck = false;

	let basicValidation = this._input.checkValidity();

	if (!basicValidation) {
		this.classList.add('error');
		errorType = 'required';
	} else {
		group = this._input.getAttribute('data-required-group');

		if (this._input.type === 'checkbox') {
			if (this._input.getAttribute('required') !== null) {
				if (!this._input.checked) {
					this._input.value = '0';
					this.classList.add('error');

					errorType = 'required';
				} else {
					this._input.value = '1';
				}
			}
			if (group) {
				groupCheckboxes = Array.from(document.querySelectorAll('input[data-required-group="' + group + '"]'));
				groupCheckboxes.filter((checkbox) => {
					if (checkbox.checked) {
						groupCheck = true;
					}
				});

				if (!groupCheck) {
					errorType = 'required';
				}
			}
		} else {
			if (this._input.getAttribute('required') !== null) {
				if (!this._input.value) {
					this.classList.add('error');

					errorType = 'required';
				}
			}
			if (group) {
				groupInputs = document.querySelectorAll('input[data-required-group="' + group + '"]');
				groupInputs.forEach(function(input) {
					if (input.value) {
						groupCheck = true;
					}
				});
				if (!groupCheck) {
					errorType = 'required';
				}
			}
		}
	}

	if (errorType) {
		if (submitted) {
			this._form.invalidate();
		}
		this.showError(errorType);
	} else {
		this.classList.remove('error');
	}
}

let _handleInput = function() {
	let self = this;

	if (this._input.value !== '') {
		this.classList.add('not-empty');
	} else {
		this.classList.remove('not-empty');
	}

	if (this._validateBy === 'input') {
		this.checkValidity();
	} else {
		this.classList.remove('error');
		this._input.removeAttribute('aria-invalid');
	}

}


let _handleChange = function() {
	let self = this;
	if (this._validateBy !== 'input') {
		this.classList.remove('error');
	}
}

let _handleFocus = function() {
	let self = this;
	// this.classList.remove('error');
	this.classList.add('focus');
}

let _handleBlur = function() {
	this.classList.remove('focus');
	if (this._validateBy === 'blur' ||
		this._validateBy === 'input') {
		this.checkValidity();
		this._validateBy = 'input';
	}
}

let _handleDispatcher = function(e) {
	if (e.type === 'form:validate') {
		if (e.id !== this._id) return;
		this.checkValidity(true);
	}

	if (e.type === 'form:reset') {
		if (this._input.type === 'checkbox') {
			this._input.checked = false;
		} else {
			this._input.value = '';
		}
		this.classList.remove('not-empty');
	}
}

class ElementClass extends HTMLLabelElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleDispatcher = _handleDispatcher.bind(this);
		this.handleInput = _handleInput.bind(this);
		this.handleFocus = _handleFocus.bind(this);
		this.handleBlur = _handleBlur.bind(this);
		this.handleChange = _handleChange.bind(this);
		this.checkValidity = _checkValidity.bind(this);
		this.showError = _showError.bind(this);
	}

	connectedCallback() {
		let form, mask;
		this._validateBy = this.getAttribute('data-validate');

		this._form = this.closest('form');

		this._input = this.getElementsByTagName('input')[0];
		if (!this._input) {
			this._input = this.getElementsByTagName('textarea')[0];
		}
		if (!this._input) {
			this._input = this.parentNode.getElementsByTagName('input')[0];
		}
		if (!this._input) { // just give up already
			return;
		}

        this._type = this._input.type;
		this._requiredError = this._input.getAttribute('data-required-error');
		this._invalidError = this._input.getAttribute('data-invalid-error');

		if (this._input.type === 'checkbox') {
			this._input.addEventListener('change', this.handleChange);
		} else {
			this._input.addEventListener('input', this.handleInput);
			this._input.addEventListener('focus', this.handleFocus);
			this._input.addEventListener('blur', this.handleBlur);
		}

		this._id = this.getAttribute('data-id');
		if (!this._id) {
			form = this.closest('form');
			this._id = form.getAttribute('data-id');
		}


        if (this._input.type === 'tel') {

			mask = Inputmask({
				regex: "^((\\+7|7|8)+([0-9]){10})$",
				mask: ["+7 (999) 999 99 99", "8 (999) 999 99 99"],
				showMaskOnHover: true,
				showMaskOnFocus: true,
				// clearMaskOnLostFocus: false,
				autoUnmask: true,
				onincomplete: function () {
					this.classList.add('error', 'incorrect');
				},
				oncomplete: function () {
					this.classList.remove('error', 'incorrect');
				}
			}).mask(this._input)
		}

		dispatcher.subscribe(this.handleDispatcher);
	}

	disconnectedCallback() {
		if (this._input.type === 'checkbox') {
			this._input.removeEventListener('change', this.handleChange);
		} else {
			this._input.removeEventListener('input', this.handleInput);
			this._input.removeEventListener('focus', this.handleFocus);
			this._input.removeEventListener('blur', this.handleBlur);
		}

		dispatcher.unsubscribe(this.handleDispatcher);
	}
}

customElements.define('input-wrapper', ElementClass, {extends: 'label'});

export default ElementClass;
