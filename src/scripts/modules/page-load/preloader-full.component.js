import dispatcher from './dispatcher.js';
import config from './config.js';
import pageLoadStore from './page-load/page-load.store.js';

// бойлерплэйт большого прелоадера.
// главное в конце вызвать 
// dispatcher.dispatch({
//		type: 'page-load:load'
// });

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
	}
	connectedCallback() {
		var self = this;

		if (config.dev) {
			this.style.display = 'none';
			return;
		}

		setTimeout(function() {

			// собственно здесь можно делать что угодно

			setTimeout(function() {
				dispatcher.dispatch({
					type: 'page-load:load'
				});
			}, 3000);
		}, 20);
	}
	disconnectedCallback() {

	}
}

customElements.define('preloader-full', ElementClass);

export default ElementClass;