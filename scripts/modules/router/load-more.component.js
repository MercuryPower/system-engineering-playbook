import innerLinkDecorator from "./inner-link.decorator.js";
import routerStore from "../router/router.store.js";
import addressStore from "../addressbar/addressbar.store.js";
import dispatcher from "../dispatcher.js";
import { datasetToOptions } from "../utils/component.utils.js";


const decorators = [innerLinkDecorator];

const defaultOptions = {
	setHistory: false, // true если надо проставлять страницу в адресную строку
	setStore: false, // true если надо проставлять страницу в адресную строку
	setClasses: false, // true если надо проставлять обычные классы ссылке, а не классы указанные здесь
};

class ElementClass extends HTMLAnchorElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this.handleAddress = this.handleAddress.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
	}

	connectedCallback() {
		this._options = datasetToOptions(this.dataset, defaultOptions);

		decorators.forEach((d) =>
			d.attach(this, {
				mode: "append",
				setHistory: this._options.setHistory,
				setStore: this._options.setStore,
				setClasses: this._options.setClasses
			})
		);

		dispatcher.subscribe(this.handleDispatcher);

		if (!this._options.setClasses) {
			this.handleAddress();
			routerStore.subscribe(this.handleAddress);
			addressStore.subscribe(this.handleAddress);
		}
	}

	disconnectedCallback() {
		decorators.forEach((d) => d.detach(this));
		dispatcher.unsubscribe(this.handleDispatcher);

		if (!this._options.setClasses) {
			routerStore.unsubscribe(this.handleAddress);
			addressStore.unsubscribe(this.handleAddress);
		}
	}

	handleDispatcher(e) {
		if (e.type === "content:before-replaced") {
			if (this.id) {
				let newLink = e.newDocument.querySelector("#" + this.id);
				if (!newLink || newLink.classList.contains("hidden")) {
					this.classList.add("hidden");
					return;
				} else {
					this.classList.remove("hidden");
				}

				this.href = newLink.href;

				dispatcher.dispatch({
					type: "inner-link:force-check",
					element: this,
				});
			}
		}
	}

	handleAddress() {
		if (this.href === location.href) {
			this.classList.add("disabled");
			this.setAttribute("aria-current", "page");
		} else {
			this.classList.remove("disabled");
			this.removeAttribute("aria-current");
		}
	}
}

customElements.define("load-more", ElementClass, { extends: "a" });

export default ElementClass;
