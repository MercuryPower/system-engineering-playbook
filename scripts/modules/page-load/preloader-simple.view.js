import dispatcher from '../dispatcher.js';
// import config from '../config.js';
import pageLoadStore from './page-load.store.js';

// заглушка прелоадера. нужна все равно, даже если прелоадер есть
// minTimeout - минимальное время
// потом ставит классы .load-complete и .load-complete-once
// через afterTimeout ставит класс .load-complete-temedout и удаляет инлайновый прелоадер, если он был
// load-complete будет удаляться и добавляться динамически при переходах между страницами
// остальные 2 класса остаются навсегда

var loaded = false;
var minTimeout = 300;
var afterTimeout = 1000;
var complete = false;
var completeOnce = false;

var _handleStore = function() {
	var storeData = pageLoadStore.getData();
	var initPreloader;
	var pageWrapper;

	if (complete === storeData.loaded) return;
	complete = storeData.loaded;

	pageWrapper = document.getElementsByClassName('page-wrapper')[0];

	if (!completeOnce && complete) {
		initPreloader = document.getElementById('init-preloader');

		completeOnce = true;

		if (initPreloader) {
			initPreloader.classList.remove('start');
			initPreloader.classList.add('end');
			setTimeout(function() {
				initPreloader.parentNode.removeChild(initPreloader);
			}, afterTimeout);
		}

		pageWrapper.classList.add('load-complete-once');

		setTimeout(function() {
			pageWrapper.classList.add('load-complete-temedout');
		}, afterTimeout);
		setTimeout(function() {
			// show content ?
			dispatcher.dispatch({
				type: 'page-load:interactive'
			});
		}, 1000);
	}

	if (complete) {
		pageWrapper.classList.add('load-complete');
	} else {
		pageWrapper.classList.remove('load-complete');
	}
}

var init = function() {
	pageLoadStore.subscribe(_handleStore);

	setTimeout(function() {
		var preloader = document.getElementsByClassName('preloader-full')[0];
		var initPreloader = document.getElementById('init-preloader');
		// if (preloader && !config.dev) return;
		if (preloader) return;

		dispatcher.dispatch({
			type: 'page-load:load'
		});
	}, minTimeout);
}

export default {
	init: init
}
