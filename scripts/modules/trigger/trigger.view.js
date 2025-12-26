import dispatcher from "../dispatcher.js";
import { datasetToOptions } from "../utils/component.utils.js";
import { positionDecorator } from "../utils/dom.utils.js";
import { FunctionArray } from "../utils/array.utils.js";

import scrollDecorator from "./controls/scroll.decorator.js";
import timeDecorator from "./controls/time.decorator.js";

const defaultOptions = {
	className: "trigger",
	containerClassName: "trigger-container",
};

const elementOptions = {
	__namespace: "trigger",
	type: "scroll",
	target: "", // класс элементов, на которые это все тоже будет срабатывать
	dispatch: "", // id который будет отправляться в событиях
	triggered: false
};

// дополнительные свойства для конкретного типа в декораторах /controls

const decorators = [scrollDecorator, timeDecorator];

class Trigger {
	constructor() {
		this._options = Object.assign({}, defaultOptions);

		this.handleContent = this.handleContent.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);

		this._elements = [];
		this._wasInitial = false;
		this._handleContentArray = new FunctionArray();
	}

	init() {
		this.handleContent();
		dispatcher.subscribe(this.handleDispatcher);

		decorators.forEach((d) => d.attach(this, this._options));
	}

	destroy() {
		decorators.forEach((d) => d.detach(this, this._options));
	}

	trigger(el, options) {
		dispatcher.dispatch({
			type: "trigger:show",
			element: el,
			options: options || {}
		});
	}

	untrigger(el, options) {
		dispatcher.dispatch({
			type: "trigger:hide",
			element: el,
			options: options || {}
		});
	}

	getTargets(el) {
		let targets = [el.element];

		if (el.target) {
			targets = targets.concat([el.element.closest(el.target)]);
		}

		return targets;
	}

	handleContent() {
		let elements = Array.prototype.map.call(
			document.getElementsByClassName(this._options.className),
			(el) => {
				let found = this._elements.find((currentElement) => {
					return currentElement.element === el;
				});

				if (found) {
					return found;
				} else {
					return Object.assign(
						{
							element: el,
						},
						datasetToOptions(el.dataset, elementOptions)
					);
				}
			}
		);

		Array.prototype.forEach.call(
			document.getElementsByClassName(this._options.containerClassName),
			(el) => {
				Array.prototype.forEach.call(el.children, (innerEl) => {
					let found = this._elements.find((currentElement) => {
						return currentElement.element === innerEl;
					});

					if (found) {
						elements.push(found);
					} else {
						elements.push(
							Object.assign(
								{
									element: innerEl,
								},
								datasetToOptions(innerEl.dataset, elementOptions)
							)
						);
					}
				});
			}
		);

		this._elements = elements;

		this._elements.forEach((el) => {
			this.getTargets(el).forEach((t) => {
				positionDecorator.attach(t);
			});
		});

		this._handleContentArray.forEach((f) => f());
	}

	handleDispatcher(e) {
		if (e.type === "content:replaced") {
			this.handleContent();
		}
	}
}

const trigger = new Trigger();

export default {
	init: trigger.init.bind(trigger),
	destroy: trigger.destroy.bind(trigger),
};
