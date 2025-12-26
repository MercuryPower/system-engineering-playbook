import dispatcher from "../dispatcher.js";
import http from "../utils/HTTP.js";
import store from "./router.store.js";

// 	dispatcher.dispatch({
//		type: 'router:route',
//		href: {page-link},
//		transitionData: {  все свойства здесь не обязательны.
//			animation: {animation-name},
//			container: {class},
//			hash: {self.href.split('#')[1]}, // если нужен скролл полсе перехода
//			copyElement: copyElement // если нужно скопировать какой-то элемент
//		}
//	});

// animation - имя анимации. если не указано, будет basic-transition
// по нему будет выбран декоратор для перехода, чтобы можно было делать разные переходы
// class - если не указан, будет .replaceable
// класс контейнера, внутри которого меняется контент.
// может быть внутренний перехо например или точечная замена только пары секций
// удобно для всяких фильтров, каталог менять
// hash - если нужен скролл полсе перехода. работает как обычный яконый скролл.
// copyElement: если нужно скопировать какой-то элемент
// например какая-то картинка или текст должны остаться при переходе
// в page-transition.component есть функция для этого

// в transitionData помимо этих трех можно писать все, что угодно.
// все прийдет в transition.decorator для анимаций

// в _reset указаны шаги смены страниц и total - колличество событий,
// которые роутер ждет перед тем как перейти к следующему шагу.
// step-1 - исчезновение страницы
// step-2 - замена контента
// step-3 - появление страницы

// на step-1 роутер грузит контент, анимация исчезновения
// на step-2 роутер заменяет контент
// на step-3 анимация появления
// без анимаций чтобы работал роутер нужно указать total-ы 1, 1, 0; 1-е и 2-е генерит сам роутер
// с анимацией появления и исчезновения - 2, 1, 1
// в конце анимации исчезновения нужно вызвать событие 'page-transition:step-1-complete',
// в конце появления - 'page-transition:step-3-complete'

const defaultOptions = {
	steps: {
		1: {
			current: 0,
			total: 2,
		},
		2: {
			current: 0,
			total: 1,
		},
		3: {
			current: 0,
			total: 1,
		},
	},
};

let isTransitioning = false;
let tmpTransitionData = null;
let tmpDocument = null;
let tmpContainers = [];
let steps = {};
let setHistory = true;
let setStore = true;
let ie;

const defaultTransitionData = {
	container: "replaceable",
	mode: "replace",
	animation: "basic-transition",
	url: null,
	hash: null,
	element: null,
};

let _check = function (step) {
	steps[step].current++;
	if (steps[step].current === steps[step].total) {
		dispatcher.dispatch({
			type: "page-transition:step-" + step + "-complete",
		});
	}
};

let _fetch = function (href) {
	http(href)
		.get()
		.then(function (response) {
			let newTitle;

			tmpDocument = document.createElement("div");
			tmpDocument.innerHTML = response;

			dispatcher.dispatch({
				type: "page-transition:check",
				step: 1,
			});
		});
};

let _route = function (e) {
	if (ie > -1 && ie < 11) {
		window.location.href = e.href;
		return;
	}

	tmpContainers = Array.prototype.map.call(
		document.getElementsByClassName(tmpTransitionData.container),
		(c) => {
			return {
				element: c,
			};
		}
	);
	
	if (setStore) {
		dispatcher.dispatch({
			type: "router:page-change",
			href: e.href,
		});
	}

	dispatcher.dispatch({
		type: "page-transition:start",
		transitionData: tmpTransitionData,
		containers: tmpContainers.slice(),
	});

	_fetch(e.href);
};

let _replace = function () {
	let title;
	let titleValue;
	let containers;
	let url = store.getData().page.href;

	function removeChildren(container) {
		let children = Array.prototype.slice.call(container.element.children);

		children.forEach((ch) => {
			ch.parentNode.removeChild(ch);
		});
	}

	function appendChildren(container, newContainer) {
		let children = Array.prototype.slice.call(newContainer.children);
		container.newChildren = [];

		children.forEach((ch) => {
			container.element.appendChild(ch);
			container.newChildren.push(ch);
		});
	}

	function replaceConteiner(container) {
		let id = container.element.getAttribute("data-id");
		let newContainer;

		if (!id) {
			console.warn("data-id attribute is missing");
			return;
		}

		newContainer = tmpDocument.querySelector(
			"." + tmpTransitionData.container + '[data-id="' + id + '"]'
		);

		if (!newContainer) {
			console.warn(
				`unable to find container with data-id ${id} on fetched document`
			);
			return;
		}

		if (tmpTransitionData.mode === "replace") {
			removeChildren(container);
			appendChildren(container, newContainer);
		} else if (tmpTransitionData.mode === "append") {
			appendChildren(container, newContainer);
		}
	}

	if (!tmpDocument) return;

	title = tmpDocument.getElementsByTagName("title")[0];
	titleValue = title.innerHTML;

	document.title = titleValue;

	if (setHistory && window.history) {
		window.history.pushState({ url: url }, titleValue, url);
	}

	dispatcher.dispatch({
		type: "content:before-replaced",
		newDocument: tmpDocument,
	});

	dispatcher.dispatch({
		type: "dom:not-ready",
	});

	tmpContainers.forEach((container) => {
		replaceConteiner(container);
	});

	dispatcher.dispatch({
		type: "content:replaced",
	});

	dispatcher.dispatch({
		type: "page-transition:check",
		step: 2,
	});

	dispatcher.dispatch({
		type: "dom:ready",
	});
};

let _handleDispatcher = function (e) {
	let data;

	if (e.type === "router:route") {
		let transitionData;

		if (isTransitioning) return;

		if (e.setHistory === false) {
			setHistory = false;
		} else {
			setHistory = true;
		}

		if (e.setStore === false) {
			setStore = false;
		} else {
			setStore = true;
		}

		tmpTransitionData = Object.assign(
			{},
			defaultTransitionData,
			e.transitionData || {}
		);

		isTransitioning = true;
		_route(e);
	}

	if (e.type === "page-transition:check") {
		_check(e.step);
	}

	if (e.type === "page-transition:step-1-complete") {
		_replace();
	}

	if (e.type === "page-transition:step-2-complete") {
		dispatcher.dispatch({
			type: "page-transition:end",
			transitionData: tmpTransitionData,
			containers: tmpContainers.slice(),
		});

		tmpContainers = [];
	}

	if (e.type === "page-transition:step-3-complete") {
		isTransitioning = false;
		_reset();
	}
};

let _handleHistory = function (e) {
	let url;

	if (!e || !e.state) return;

	url = e.state.url;
	e.preventDefault();

	if (!url) return;

	if ("scrollRestoration" in history) {
		history.scrollRestoration = "manual";
	}

	// setTimeout(function () {
	// 	if ("scrollRestoration" in history) {
	// 		history.scrollRestoration = "auto";
	// 	}
	// }, 1000);

	dispatcher.dispatch({
		type: "router:route",
		href: url,
		setHistory: false,
	});
};

let _reset = function () {
	Object.keys(defaultOptions.steps).forEach((key) => {
		steps[key] = Object.assign({}, defaultOptions.steps[key]);
	});
};

let init = function () {
	function getIEVersion() {
		let rv = -1;
		if (navigator.appName == "Microsoft Internet Explorer") {
			let ua = navigator.userAgent;
			let re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
			if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
		}
		return rv;
	}

	let url = location.origin + location.pathname;
	let fullUrl = url + location.search;

	ie = getIEVersion();

	if (ie > -1 && ie < 11) {
		return;
	}

	if (window.history) {
		window.history.replaceState(
			{ url: fullUrl + location.hash },
			false,
			fullUrl + location.hash
		);
	}

	dispatcher.dispatch({
		type: "router:page-change",
		href: fullUrl,
	});

	window.onpopstate = _handleHistory;
	dispatcher.subscribe(_handleDispatcher);

	_reset();
};

export default {
	init: init,
};