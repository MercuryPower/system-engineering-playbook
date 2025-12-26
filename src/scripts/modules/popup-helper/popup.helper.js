import dispatcher from "../dispatcher.js";
import popupStore from "../popup/popup.store.js";
import defaultAnimation from "./animations/default.animation.js";

import { getByDataId } from "../utils/dom.utils.js";
import { transition } from "../utils/animation.utils.js";
import { getFocusable } from "../utils/dom.utils.js";

// управление с клаывиатуры, таблок

let lastFocus = null;

let firstFocusable;
let lastFocusable;
let focusIndex = 0;
let focusable;
let wasActive = null;
let kbSubscribed = false;

const innerClass = "popup-inner";

let _lockFocus = function (e) {
	if (!focusable) return;

	if (e.type === "keyboard:tab") {
		e.event.preventDefault();
		focusIndex++;

		if (!focusable[focusIndex]) {
			focusIndex = 0;
		}

		focusable[focusIndex].focus({ preventScroll: true });
	}

	if (e.type === "keyboard:shift-tab") {
		e.event.preventDefault();
		focusIndex--;

		if (!focusable[focusIndex]) {
			focusIndex = focusable.length - 1;
		}

		focusable[focusIndex].focus({ preventScroll: true });
	}
};

let _tabLock = function () {
	let active = popupStore.getData().active;
	let popup = null;
	let first, last;
	let close;
	let popupFocusable = document.getElementsByClassName("popup-focusable");
	popupFocusable = Array.prototype.slice.call(popupFocusable, 0);

	popup = getByDataId("popup-component", active);

	if (!popup) {
		return;
	}

	lastFocus = document.activeElement;

	close =
		popup.querySelector("popup-close") ||
		document.querySelector("button.close-all");

	// if (!close) {
	// 	console.warn('check');
	// 	return;
	// }

	focusable = getFocusable(popup);

	// focusable = popup.querySelectorAll('button, a, input, select, textarea');
	// focusable = Array.prototype.slice.call(focusable, 0);

	focusable = focusable.concat(popupFocusable).filter((el) => {
		return !el.classList.contains("not-focusable")
	});

	if (close && Array.prototype.indexOf.call(popupFocusable, close) === -1) {
		focusable.push(close);
	}

	focusable.sort(function (a, b) {
		let ta, tb;
		ta = a.tabIndex || 0;
		tb = b.tabIndex || 0;

		if (
			(a.tagName.toLowerCase() === "input" ||
				a.tagName.toLowerCase() === "textarea") &&
			b.tagName.toLowerCase() !== "input" &&
			b.tagName.toLowerCase() !== "input"
		) {
			return -1;
		}

		return ta - tb;
	});

	if (!kbSubscribed) {
		kbSubscribed = true;
		dispatcher.subscribe("keyboard", _lockFocus);
	}

	focusable[0].focus({ preventScroll: true });
	focusIndex = 0;
};

let _tabUnlock = function () {
	if (kbSubscribed) {
		kbSubscribed = false;
		dispatcher.unsubscribe("keyboard", _lockFocus);
	}

	if (lastFocus) {
		lastFocus.focus({ preventScroll: true });
	}
	lastFocus = null;
};

let _handleKeyboard = function (e) {
	let active = popupStore.getData().active;

	if (!active) return;

	if (e.type === "keyboard:esc") {
		dispatcher.dispatch({
			type: "popup:close-all",
		});
	}
};

let _handleClick = function (e) {
	let target = e.target;
	let popupData = popupStore.getData();

	if (
		target.classList.contains(innerClass) ||
		target.closest("." + innerClass) ||
		target.closest("a") ||
		target.closest("button")
	) {
	} else {
		if (popupData.active === 'popup-post') {}

		dispatcher.dispatch({
			type: "popup:close-all",
		});
	}
};

let _handlePopup = function () {
	let popupData = popupStore.getData();
	let active = popupData.active;
	let pw = document.getElementsByClassName("page-wrapper")[0];
	let popup = getByDataId("popup-component", active);
	let previousPopup = null;

	if (wasActive) {
		previousPopup = getByDataId("popup-component", wasActive);
	}

	let animationObject = {
		activeId: active,
		previousId: wasActive,
		activePopup: popup,
		previousPopup: previousPopup,
	};

	let animations = {
		open: defaultAnimation,
		close: defaultAnimation,
		change: defaultAnimation,
	};

	if (active) {
		setTimeout(function () {
			document.addEventListener("click", _handleClick);
		}, 300);

		if (pw) {
			pw.classList.add("popup-active");
		}

		_tabLock();
		dispatcher.dispatch({
			type: "scroll:lock",
		});

		if (wasActive) {
			// change animation
			animations.change.change(animationObject);
		} else {
			// open animation
			animations.open.open(animationObject);
		}
	} else {
		document.removeEventListener("click", _handleClick);
		// close animation
		animations.close.close(animationObject);

		if (pw) {
			pw.classList.remove("popup-active");
		}

		setTimeout(function () {
			_tabUnlock();
		}, 300); // wierd bugfix..

		dispatcher.dispatch({
			type: "scroll:unlock",
		});
	}

	wasActive = active;
};

let init = function () {
	_handlePopup();
	popupStore.subscribe(_handlePopup);
	dispatcher.subscribe("keyboard", _handleKeyboard);

	// dispatcher.subscribe((e) => {
	// 	if (e.type === 'popup:close-all') {
	// 		document.querySelector('.replaceable-popup.popup-content').innerHTML = '';
	// 	}
	// });
};

export default {
	init: init,
};
