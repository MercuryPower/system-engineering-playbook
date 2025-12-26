import dispatcher from "../dispatcher.js";
import scrollStore from "../scroll/scroll.store.js";

import scrollToDecorator from "./decorators/scroll-to.decorator.js";
import scrollLockDecorator from "./decorators/scroll-lock.decorator.js";

const decorators = [scrollToDecorator, scrollLockDecorator];

class scrollHelper {
	constructor() {}

	init() {
		decorators.forEach((d) => d.attach(this));
	}

	destroy() {
		decorators.forEach((d) => d.detach(this));
	}
}

const instance = new scrollHelper();

export default {
	init: instance.init,
	destroy: instance.destroy,
};