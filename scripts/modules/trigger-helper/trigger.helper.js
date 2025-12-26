import dispatcher from "../dispatcher.js";
import triggerDefaultDecorator from "./animations/trigger-default.decorator.js"
import triggerSectionDecorator from "./animations/trigger-section.decorator.js"


const decorators = [triggerDefaultDecorator, triggerSectionDecorator];

class scrollHelper {
	constructor() {
		this.handleContent = this.handleContent.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
	}

	init() {
		decorators.forEach((d) => d.attach(this));

		this.handleContent();
		dispatcher.subscribe(this.handleDispatcher);
	}

	destroy() {
		decorators.forEach((d) => d.detach(this));
	}

	handleContent() {
		this._elements = Array.prototype.slice.call(document.getElementsByClassName('trigger'));
		for (let id in this._decorators) {
			if (this._decorators[id].update) {
				this._decorators[id].update({});
			}
		}
	}

	handleDispatcher(e) {
		if (e.type === "content:replaced") {
			this.handleContent();
		}

		if (e.type === "trigger:show") {
			for (let id in this._decorators) {
				if (this._decorators[id].show) {
					this._decorators[id].show({
						item: e.element,
						options: e.options
					});
				}
			}
		}

		if (e.type === "trigger:hide") {
			for (let id in this._decorators) {
				if (this._decorators[id].hide) {
					this._decorators[id].hide({
						item: e.element,
						options: e.options
					});
				}
			}		
		}
	}
}

const instance = new scrollHelper();

export default {
	init: instance.init.bind(instance),
	destroy: instance.destroy.bind(instance),
};