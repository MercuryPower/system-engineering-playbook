import dispatcher from '../../dispatcher.js';
import { transition } from '../../utils/animation.utils.js';
import { offset as getOffset } from '../../utils/dom.utils.js';

// в attach указать название анимации
// component._transitions.basic <- здесь название - basic
// start - начало анимации
// end - конец
// в data приходит вся transitionData

let name = 'basic-transition';

let Decorator = function (component, options) {
	this._component = component;
	this._options = {};

	this.start = function(data, containers) {
		let pw = document.getElementsByClassName('page-wrapper')[0];
		let main = document.getElementsByTagName('main')[0];

		let containerElements = containers.map((c) => {
			return c.element;
		});

		dispatcher.dispatch({
			type: 'page-load:reset',
		});

		setTimeout(() => {
			dispatcher.dispatch({
				type: "popup:close-all",
			});
		}, 200);

		// dispatcher.dispatch({
		// 	type: 'popup:close-all',
		// });

		dispatcher.dispatch({
			type: 'scroll:lock',
		});

		if (pw) {
			pw.classList.add('transition-active');
		}

		if (data.mode === "replace") {
			if (data.container === "replaceable") {
				transition([main], 0.2, {
					opacity: 0,
				});

				setTimeout(() => {
					dispatcher.dispatch({
						type: "scroll:to",
						position: 0,
						duration: 0
					});

				}, 200);
			} else {
				containerElements.forEach((c) => {
					c.style.height = c.clientHeight + "px";
				});

				transition(containerElements, 0.2, {
					opacity: 0,
				});
			}
		} else {
			containerElements.forEach((c) => {
				transition(c, 0, {
					height: c.clientHeight + "px"
				});
			});
		}

		setTimeout(() => {
			dispatcher.dispatch({
				type: 'page-transition:check',
				step: 1,
			});
		}, 220);
	}.bind(this);

	this.end = function(data, containers) {
		let pw = document.getElementsByClassName('page-wrapper')[0];
		let scrollElement, scrollPosition;
		let main = document.getElementsByTagName('main')[0];

		let containerElements = containers.map((c) => {
			return c.element;
		});

		// скролл
		if (data.hash) {
			scrollElement = document.getElementById(data.hash);
		}

		if (scrollElement) {
			scrollPosition = getOffset(scrollElement).top;

			dispatcher.dispatch({
				type: "scroll:to",
				position: scrollPosition,
				duration: 0
			});
		} else if (data.container === "replaceable") {
			dispatcher.dispatch({
				type: "scroll:to",
				position: 0,
				duration: 0
			});
		}

		if (data.mode !== "replace") {
			containers.forEach((c) => {
				Array.prototype.forEach.call(c.newChildren, (nc) => {
					transition(nc, 0, {
						opacity: 0
					});
				});
			});
		}

		// какие-то анимации могут быть здесь

		setTimeout(function () {
			if (pw) {
				pw.classList.remove('transition-active');
			}

			// и здесь
			if (data.mode === "replace") {
				if (data.container === "replaceable") {
					transition([main], 0.4, {
						opacity: 1,
					});
				} else {
					transition(containerElements, 0.4, {
						opacity: 1,
					});

					containerElements.forEach((c) => {
						c.style.height = "auto";
					});
				}
			} else {
				containers.forEach((c) => {
					let ph = c.element.clientHeight;

					c.element.style.height = "auto";
					let h = c.element.clientHeight;

					transition(c.element, 0, {
						height: ph + "px"
					});

					setTimeout(() => {
						transition(c.element, 0.6, {
							height: h + "px"
						}, {
							ease: window._vars.ease.css.ease
						});

						setTimeout(() => {
							Array.prototype.forEach.call(c.newChildren, (nc) => {
								transition(nc, 0.3, {
									opacity: 1
								});
							});
						}, 500);
					}, 20);
				});
			}

			setTimeout(() => {
				dispatcher.dispatch({
					type: 'page-load:load',
				});

				dispatcher.dispatch({
					type: 'scroll:unlock',
				});

				dispatcher.dispatch({
					type: 'page-transition:check',
					step: 3,
				});
			}, 400)
		}, 20);
	}.bind(this);
};

let attach = function (component, options) {
	let decorator;

	if (!component._decorators) {
		component._decorators = {};
	}

	if (!component._decorators[name]) {
		component._decorators[name] = new Decorator(component, options);
	}

	decorator = component._decorators[name];

	component._transitions[name] = {
		start: decorator.start,
		end: decorator.end,
	};

	return decorator;
};

let detach = function (component, options) {};

export default {
	attach: attach,
	detach: detach,
};
