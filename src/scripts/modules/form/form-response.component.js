import dispatcher from '../dispatcher';

// ответ формы. пример стилей и разметка в соответствующих файлах

let _handleForm = function(e) {
	if (e.type === 'form:response') {
		if (e.id !== this._id) return;

		if (e.response.hasOwnProperty('response') && e.response.response !== '') {
			let p = document.createElement('p');
			p.classList.add('text_md');
			p.innerHTML = e.response.response;

			this._inner.appendChild(p);

			if (e.response.status === 'success') {
				this.classList.remove('status-error');
				this.classList.add('status-success');
				this.classList.add('active');

				let form = e.form;
				let id = e.id;
				setTimeout(() => {
					form.classList.remove('hidden');
					this.classList.remove('status-success');
					this.classList.remove('active');

					dispatcher.dispatch({
						type: 'form:reset',
						id: id
					});
				}, 5000)
			} else if (e.response.status === 'error') {
				this._inner.innerHTML = e.response.response;
				this.classList.add('status-error');
				this.classList.remove('status-success');
				this.classList.add('active');
			}
		} else {
			this._inner.innerHTML = '';
			this.classList.remove('active');
		}
	}
	if (e.type === 'form:reset') {
		if (e.id !== this._id) return;
		this._inner.innerHTML = '';
		this.classList.remove('active');
	}
}

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleForm = _handleForm.bind(this);
	}
	connectedCallback() {
		this._id = this.getAttribute('data-id');
		this._inner = this.getElementsByClassName('response-inner')[0];

		if (!this._inner) {
			this._inner = this;
		}

		if (!this._id) {
			console.warn('data-id attribute is missing on form-response');
			return;
		}
		dispatcher.subscribe(this.handleForm);
	}
	disconnectedCallback() {
		dispatcher.unsubscribe(this.handleForm);
	}
}

customElements.define('form-response', ElementClass);

export default ElementClass;
