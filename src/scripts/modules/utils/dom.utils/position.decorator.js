import { attach, detach, update } from "../decorator.utils.js";
import { ValueArray } from "../array.utils.js";
import offset from "./offset.js";
import resizeStore from "../../resize/resize.store.js";
import EventEmitter from "../../utils/EventEmitter.js";

const name = "position";

const defaultOptions = {
	name: name,
};

class Decorator {
	constructor(parent, options) {
		this._parent = parent;
		this._options = Object.assign({}, defaultOptions, options);

		this.handleResize = this.handleResize.bind(this);
		this.setTransforms = this.setTransforms.bind(this);

		this._eventEmitter = new EventEmitter();

		this._position = new ValueArray();
		this._position.push({
			name: "general",
			value: {
				top: 0,
				left: 0,
				width: 0,
				height: 0,
			},
		});

		this._transforms = {x: 0, y: 0}

		this._parent._position = {
			push: (v) => {
				this._position.push(v);
				this.setTransforms();
			},
			set: (v) => {
				this._position.set(v);
				this.setTransforms();
			},
			get: this._position.get.bind(this._position),
			getExcept: this._position.getExcept.bind(this._position),
			sum: this._position.sum.bind(this._position),
			remove: (v) => {
				this._position.remove(v);
				this.setTransforms();
			},
			setTransforms: this.setTransforms,
			subscribe: this._eventEmitter.subscribe,
			unsubscribe: this._eventEmitter.unsubscribe
		};
	}

	init() {
		this.handleResize();
		resizeStore.subscribe(this.handleResize);
	}

	destroy() {
		this._parent._position = undefined;
	}

	handleResize() {
		let of = offset(this._parent);
		this._position.set({
			name: "general",
			value: {
				top: of.top,
				left: of.left,
				width: this._parent.clientWidth,
				height: this._parent.clientHeight,
			},
		});
	}

	setTransforms() {
		let pos = this._parent._position.getExcept({ name: "general" }, { includeIgnored: true });

		if (pos.left !== this._transforms.x || pos.top !== this._transforms.y) {
			this._transforms.x = pos.left;
			this._transforms.y = pos.top;
			this._parent.style.transform = `translateX(${pos.left}px) translateY(${pos.top}px)`;
			this._eventEmitter.dispatch();
		}
	}
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

	update: (parent, options) => {
		return update(parent, options);
	},
};
