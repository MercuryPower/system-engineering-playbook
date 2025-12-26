import dispatcher from "../dispatcher.js";
import EventEmitter from "../utils/EventEmitter.js";
import qs from "./qs.js";

let eventEmitter = new EventEmitter();

const format = "comma"; // "index", "bracket"

let search = {};
let hash = "";
let string = "";

function deserialize(query) {
	if (query.indexOf("?") === 0) {
		query = query.substr(1);
	}

	let comma = format === "comma";

	return qs.parse(query, { encode: false, comma: comma });
}

function serialize(obj) {
	let result = qs.stringify(obj, { encode: false, arrayFormat: format });

	if (result.indexOf("?") === 0) {
		result = result.substr(1);
	}

	return result;
}

function arrayFromSet(set) {
	let ar = [];
	set.forEach((el) => {
		ar.push(el);
	});

	return ar;
}

function cleanObject(object) {
	if (typeof object !== "object") {
		return;
	}

	Object.keys(object).forEach((key) => {
		var localObj = object[key];

		if (typeof localObj === "object") {
			if (Object.keys(localObj).length === 0) {
				delete object[key];
				return;
			}

			cleanObject(localObj);

			if (Object.keys(localObj).length === 0) {
				delete object[key];
				return;
			}
		}
	});
}

let _handleEvent = function (e) {
	let parts;
	let obj;

	if (e.type === "search:set") {
		let value = e.value;

		if (value instanceof Set) {
			value = arrayFromSet(value);
		}

		parts = e.name.split(".");
		if (parts.length === 1) {
			if (!value || Array.isArray(value) && value.length === 0) {
				delete search[e.name];
			} else {
				search[e.name] = value;
			}
		} else {
			obj = search;

			let wasSet = false;
			parts.forEach(function (part, index) {
				if (wasSet) return;

				if (!obj[part]) {
					obj[part] = {};
				}

				if (index === parts.length - 1) {
					if (!value || Array.isArray(value) && value.length === 0) {
						delete obj[part];
						wasSet = true;
					} else {
						obj[part] = value;
					}
				}

				obj = obj[part];
			});
		}

		cleanObject(search);

		string = serialize(search);

		let url = location.origin + location.pathname;
		let fullUrl = url + (string ? "?" + string : "") + (hash ? "#" + hash : "");

		if (e.hasOwnProperty("history") && e.history === true) {
			history.replaceState(
				{ url: fullUrl },
				"",
				fullUrl
			);
		}

		eventEmitter.dispatch();
	}

	if (e.type === "hash:set") {
		if (hash === e.hash) return;
		hash = e.hash;
		if (hash.indexOf("#") === 0) {
			hash = hash.substr(1);
		}

		let url = location.origin + location.pathname;
		let fullUrl = url + (string ? "?" + string : "") + (hash ? "#" + hash : "");

		if (e.hasOwnProperty("history") && e.history === true) {
			history.replaceState(
				{ url: fullUrl },
				"",
				fullUrl
			);
		}
		eventEmitter.dispatch();
	}

	if (e.type === "content:before-replaced") {
		string = location.search;
		hash = location.hash.substr(1);
		search = deserialize(location.search);
		eventEmitter.dispatch();
	}
};

let getData = function () {
	let href = `${location.protocol}//${location.host}${location.pathname}${
		string ? "?" + string : ""
	}`;
	let full = href + hash ? "#" + hash : "";

	return {
		search: search,
		hash: hash,
		string: string,
		href: href,
		full: full,
	};
};

let _init = function () {
	dispatcher.subscribe(_handleEvent);
	string = location.search;
	hash = location.hash.substr(1);
	search = deserialize(location.search);

	eventEmitter.dispatch();
};

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData,
};
