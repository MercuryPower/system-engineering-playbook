import dispatcher from "../dispatcher.js";
import sliderStore from "./slider.store.js";
import resizeStore from "../resize/resize.store.js";

import { transition } from "../utils/animation.utils.js";
import { datasetToOptions } from "../utils/component.utils.js";

import dragDecorator from "./controls/drag.decorator.js";
import tabDecorator from "./controls/tab.decorator.js";
import focusDecorator from "./controls/focus.decorator.js";

import defaultAnimation from './animations/default.animation.js';

const defaultOptions = {
	__namespace: "",
	id: "undefined",
	speed: 0.6,
	continuous: true,
	focusable: true,
	touch: true,
	draggable: true,
	resize: false,
	animation: "default",
};

const animations = {
	'default': defaultAnimation
};

const decorators = [
	dragDecorator,
	tabDecorator,
	focusDecorator
];

// <slider-component data-id="id"
//		data-speed="300"
//		data-continuous="true"
//		data-focusable="true"
//		data-touch="true">
//		data-draggable="true"
//		data-resize="true"
// 		<div class="slide">
//			<div class="slide-inner">Some text</div>
//		</div>
// 		<div class="slide">
//			<div class="img slide-inner" style="background-image:url(..)"></div>
//		</div>
// 		<div class="slide">
//			<img src="..." class="slide-inner"/>
//		</div>
// </slier-component>

let _animate = function (options) {
	this._decorators.animation.animate(options);
};

let _handlerStore = function () {
	let sliderData = sliderStore.getData()[this._id];

	if (!sliderData) return;
	if (!this._slides.length) return;

	let prevIndex = this._index;
	let nextIndex = sliderData.index;

	if (this._index === sliderData.index) return;

	let prevSlide = this._slides[this._index];
	let direction =
		sliderData.userData.direction || this.detectDirection(sliderData.index);

	this._index = sliderData.index;

	let nextSlide = this._slides[this._index];

	this._z++;
	if (nextSlide) {
		nextSlide.element.style.zIndex = this._z;
	}

	this.animate({
		prevSlide: prevSlide.element,
		nextSlide: nextSlide.element,
		prevIndex: prevIndex,
		nextIndex: nextIndex,
		direction: direction,
		durationMultiplyer: 1,
	});

	nextSlide.element.classList.remove("moving");
	prevSlide.element.classList.remove("lower-moving");

	this.setClasses();

	this._animating = true;
	setTimeout(function () {
		self._animating = false;
	}, this._options.speed * 1000);
};

let _detectDirection = function (next) {
	let direction;
	if (next < this._index) {
		if (this._options.continuous) {
			if (this._index - next <= this._total - (this._index - next)) {
				direction = "prev";
			} else {
				direction = "next";
			}
		} else {
			direction = "prev";
		}
	} else {
		if (this._options.continuous) {
			if (next - this._index <= this._total - (next - this._index)) {
				direction = "next";
			} else {
				direction = "prev";
			}
		} else {
			direction = "next";
		}
	}
	return direction;
};

let _setClasses = function () {
	let storeData = sliderStore.getData()[this._id];
	let index;
	if (!storeData) {
		return;
	}

	index = storeData.index;

	Array.prototype.forEach.call(this._slides, function (slide, i) {
		if (i < index) {
			slide.element.classList.remove("to-right");
			slide.element.classList.remove("to-center");
			slide.element.classList.add("to-left");
		}
		if (i === index) {
			slide.element.classList.remove("to-right");
			slide.element.classList.add("to-center");
			slide.element.classList.remove("to-left");
		}
		if (i > index) {
			slide.element.classList.add("to-right");
			slide.element.classList.remove("to-center");
			slide.element.classList.remove("to-left");
		}
	});

	if (index === 0 && this._slides[this._total - 1].element) {
		this._slides[this._total - 1].element.classList.remove("to-right");
		this._slides[this._total - 1].element.classList.add("to-left");
	}
	if (index === this._total && this._slides[0]) {
		this._slides[0].element.classList.remove("to-left");
		this._slides[0].element.classList.add("to-right");
	}
};

let _handleResize = function () {
	let maxH = 0;

	if (this._options.resize) {
		this._slides.forEach(function (slide) {
			let h;
			if (slide.inner) {
				h = slide.inner.clientHeight;
			} else {
				h = slide.element.clientHeight;
			}
			maxH = Math.max(maxH, h);
		});

		this.style.height = maxH + "px";
	}
};

let _initialize = function () {
	let slides;
	let self = this;

	this._id = this._options.id;

	slides = this.getElementsByClassName("slide");

	this._slideElements = Array.prototype.slice.call(slides);
	this._slides = [];

	Array.prototype.forEach.call(slides, function (slide, index) {
		let inner = slide.getElementsByClassName("slide-inner")[0];
		let img = slide.getElementsByTagName("img")[0];

		if (slide.classList.contains("disabled")) {
			slide.style.opacity = 0;
			return;
		} else {
			slide.style.opacity = 1;
		}

		if (!img) {
			img = slide.getElementsByClassName("img")[0];
		}

		if (index !== 0) {
			slide.style.opacity = 0;
		}

		self._slides.push({
			element: slide,
			inner: inner,
			img: img,
		});
	});

	this._total = this._slides.length;
	this._direction =
		this.getAttribute("data-ditection") === "vertical"
			? "vertical"
			: "horizontal";

	if (this._slides[0]) {
		this._slides[0].element.style.zIndex = this._z + 1;
	}

	this.classList.add("initialized");

	if (this._total === 1) {
		this.classList.add("notActive");
	}

	this.setClasses();
	this.handlerStore();

	dispatcher.dispatch({
		type: "slider:update",
		id: this._id,
		continuous: this._options.continuous,
		total: this._total,
		index: 0,
	});
};

let _handleDispatcher = function (e) {
	if (e.type === "slider:reinitialize" && e.id === this._id) {
		this.initialize();
	}
};

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
		this._options = datasetToOptions(this.dataset, defaultOptions);

		this._index = 0;
		this._z = 1;

		this.handlerStore = _handlerStore.bind(this);
		this.setClasses = _setClasses.bind(this);
		this.detectDirection = _detectDirection.bind(this);
		this.handleResize = _handleResize.bind(this);
		this.animate = _animate.bind(this);
		this.initialize = _initialize.bind(this);
		this.handleDispatcher = _handleDispatcher.bind(this);
	}

	connectedCallback() {
		let self = this;
		let imgCounter = 0;

		this.style.height = '460px'

		function incrementCounter() {
			imgCounter++;
			if (imgCounter === self._total) {
				self.handleResize();
			}
		}

		this.initialize();

		dispatcher.dispatch({
			type: "slider:add",
			id: this._id,
			continuous: this._options.continuous,
			total: this._total,
			index: this._index,
		});

		this._slides.forEach(function (slide) {
			if (!slide.img) {
				incrementCounter();
				return;
			}
			if (slide.img.complete) {
				incrementCounter();
			} else {
				slide.img.addEventListener("load", incrementCounter);
			}
		});

		if (this._total !== 1) {
			decorators.forEach((d) => d.attach(this, this._options));
			animations[this._options.animation].attach(this, this._options);
		}

		resizeStore.subscribe(this.handleResize);
		sliderStore.subscribe(this.handlerStore);
		dispatcher.subscribe(this.handleDispatcher);
	}

	disconnectedCallback() {
		dispatcher.dispatch({
			type: "slider:remove",
			id: this._id,
		});

		if (this._total !== 1) {
			animations[this._options.animation].detach(this, this._options);
			decorators.forEach((d) => d.detach(this, this._options));
		}

		resizeStore.unsubscribe(this.handleResize);
		sliderStore.unsubscribe(this.handlerStore);
		dispatcher.unsubscribe(this.handleDispatcher);
	}
}

customElements.define("slider-component", ElementClass);

export default ElementClass;
