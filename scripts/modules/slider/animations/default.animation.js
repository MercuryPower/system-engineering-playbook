import { attach, detach } from "../../utils/decorator.utils.js";
import { transition } from '../../utils/animation.utils.js';

const name = "animation";

const defaultOptions = {
	name: name,
};

class Decorator {
	constructor(parent, options) {
		this._parent = parent;
		this._options = Object.assign({}, defaultOptions, options);
	}

	animate(options) {
		let prevSlide = options.prevSlide;
		let nextSlide = options.nextSlide;
		let durationMultiplyer = options.durationMultiplyer;
		let direction = options.direction;
		let width = this._parent.clientWidth;

		let ease;

		if (window._vars && window._vars.ease) {
			ease = window._vars.ease.css;
		} else {
			ease = {
				ease: "ease",
				easeOut: "ease-out",
				easeIn: "ease-in",
			}
		}

		// if (!nextSlide.classList.contains("moving")) {
			if (direction === "next") {
				transition(nextSlide, 0, {
					transform: `translateX(${width}px)`,
					opacity: 0,
				});
			}
			if (direction === "prev") {
				transition(nextSlide, 0, {
					transform: `translateX(${-width}px)`,
					opacity: 0,
				});
			}
		// }

		setTimeout(() => {
			if (direction === "next") {
				transition(
					prevSlide,
					(this._options.speed / 1.3) * durationMultiplyer,
					{
						transform: `translateX(${-width}px)`,
						opacity: 0,
					},
					{
						ease: ease.easeIn
					}
				);
			}

			if (direction === "prev") {
				transition(
					prevSlide,
					(this._options.speed / 1.3) * durationMultiplyer,
					{
						transform: `translateX(${width}px)`,
						opacity: 0,
					},
					{
						ease: ease.easeIn
					}
				);
			}

			transition(
				nextSlide,
				(this._options.speed) * durationMultiplyer,
				{
					transform: "translateX(0px)",
					opacity: 1,
				},
				{
					ease: ease.easeOut,
					delay: 0.3
				}
			);
		}, 20 * durationMultiplyer);
	}

	init() {}

	destroy() {}
}

export default {
	attach: (parent, options) => {
		return attach(
			Decorator,
			parent,
			Object.assign({}, defaultOptions, options)
		);
	},
	detach: (parent, options) => {
		return detach(parent, Object.assign({}, defaultOptions, options));
	},
};