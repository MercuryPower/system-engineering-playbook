import dispatcher from "../dispatcher.js";
import popupToggleDecorator from "./popup-toggle.decorator.js";

// class close-all для кнопок, которые закрывают все попапы.

const decorators = [popupToggleDecorator];

class ElementClass extends HTMLButtonElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {}
	connectedCallback() {
		decorators.forEach((d) => d.attach(this));
	}
	disconnectedCallback() {
		decorators.forEach((d) => d.detach(this));
	}
}

customElements.define("popup-toggle", ElementClass, {
	extends: "button",
});

export default ElementClass;