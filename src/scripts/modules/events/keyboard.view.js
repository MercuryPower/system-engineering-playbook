import dispatcher from '../dispatcher.js';

let ctrl = false;
let shift = false;
let initialized = false;

let _onKeyDown = function(e) {
	let keyCode = e.which;

	dispatcher.dispatch({
		type: 'keyboard:any'
	});

	if (keyCode === 9) {
		if (e.shiftKey) {
			dispatcher.dispatch({
				type: 'keyboard:shift-tab',
				event: e
			});
		} else {
			dispatcher.dispatch({
				type: 'keyboard:tab',
				event: e
			});
		}
	} else if (keyCode === 13) {
		dispatcher.dispatch({
			type: 'keyboard:enter',
			event: e
		});
	}  else if (keyCode === 16) {
		dispatcher.dispatch({
			type: 'keyboard:shift',
			event: e
		});
	} else if (keyCode === 17) {
		dispatcher.dispatch({
			type: 'keyboard:ctrl',
			event: e
		});
	} else if (keyCode === 27) {
		dispatcher.dispatch({
			type: 'keyboard:esc',
			event: e
		});
	} else if (keyCode === 32) {
		dispatcher.dispatch({
			type: 'keyboard:space',
			event: e
		});
	} else if (keyCode === 38 || keyCode === 33) {
		dispatcher.dispatch({
			type: 'keyboard:up',
			event: e
		});
	} else if (keyCode === 40 || keyCode === 34) {
		dispatcher.dispatch({
			type: 'keyboard:down',
			event: e
		});
	} else if (keyCode === 37) {
		dispatcher.dispatch({
			type: 'keyboard:left',
			event: e
		});
	} else if (keyCode === 39) {
		dispatcher.dispatch({
			type: 'keyboard:right',
			event: e
		});
	}
}

let _onKeyUp = function(e) {
	dispatcher.dispatch({
		type: 'keyboard:keyup'
	});
}

let init = function() {
	if (initialized) return;
	initialized = true;

	document.addEventListener('keydown', _onKeyDown);
	document.addEventListener('keyup', _onKeyUp);
}

export default {
	init: init
};