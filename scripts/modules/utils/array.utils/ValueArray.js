// push({name: 'name', value: 1})
// remove({name: 'name'})
// set({name: 'name', value: 1})

import addArrays from "./addArrays.js";
import { addObjects } from "../object.utils.js";

class ValuesArray {
	constructor() {
		this.elements = [];
	}

	forEach(func) {
		return this.elements.forEach(func);
	}

	push(val) {
		if (
			this.elements.find(function (el) {
				return el.name === val.name;
			})
		) {
			console.error(
				'element with name "' + val.name + '" already exists'
			);
			return;
		}

		this.elements.push(val);
	}

	remove(val) {
		this.elements = this.elements.filter(function (el) {
			return el.name !== val.name;
		});
	}

	set(val) {
		this.elements.find(function (el) {
			return el.name === val.name;
		}).value = val.value;
	}

	get(val) {
		if (!val) {
			return this.sum();
		} else {
			let element = this.elements.find((el) => {
				return el.name === val.name;
			});

			if (element) {
				return element.value;
			} else {
				return null;
			}
		}
	}

	sum(options) {
		options = Object.assign({
			includeIgnored: false
		}, options);

		return this.elements
			.filter((el) => {
				return options.includeIgnored || !el.ignored
			})
			.map((el) => {
				return el.value;
			})
			.reduce((total, value) => {
				if (Array.isArray(value)) {
					return addArrays(total, value);
				} else if (typeof value === "object") {
					return addObjects(total, value);
				} else {
					return total + value;
				}
			});
	}

	sumExcept(val, options) {
		options = Object.assign({
			includeIgnored: false
		}, options);

		let filtered = this.elements.filter((el) => {
			return (options.includeIgnored || !el.ignored) && (el.name !== val.name);
		});

		if (filtered.length === 0) {
			let value = this.elements[0].value;

			if (Array.isArray(value)) {
				return new Array(value.length);
			} else if (typeof value === "object") {
				let result = {};
				Object.keys(value).forEach((key) => {
					result[key] = 0;
				});

				return result;
			} else {
				return 0;
			}
		} else {
			return filtered
				.filter((el) => {
					return options.includeIgnored || !el.ignored
				})
				.map(function (el) {
					return el.value;
				})
				.reduce(function (total, value) {
					if (Array.isArray(value)) {
						return addArrays(total, value);
					} else if (typeof value === "object") {
						return addObjects(total, value);
					} else {
						return total + value;
					}
				});
		}
	}

	getExcept(val, options) {
		options = Object.assign({
			includeIgnored: false
		}, options);

		return this.sumExcept(val, options);
	}

	multiply(options) {
		options = Object.assign({
			includeIgnored: false
		}, options);

		return this.elements
			.filter((el) => {
				return options.includeIgnored || !el.ignored
			})
			.map(function (val) {
				return val.value;
			})
			.reduce(function (total, value) {
				return total * value;
			});
	}
}

export default ValuesArray;
