import dispatcher from '../dispatcher.js';
import EventEmitter from '../utils/EventEmitter.js';

var eventEmitter = new EventEmitter();

var breakpointsData = [
	{
		size: 0,
		name: 'mobile'
	}, {
		size: 640,
		name: 'tablet'
	}, {
		size: 1024,
		name: 'desktop'
	}, {
		size: 1400,
		name: 'wide-desktop'
	}
];

var breakpoint = null;

var size = {
	width: 0,
	height: 0
}

var _windowSize = function() {
	return {
		width: document.body.clientWidth,
		height: document.body.clientHeight
	}
}

var _onResize = function() {
	size = _windowSize();

	var _getBreakPoint = function() {
		for (var i = breakpointsData.length - 1; i >= 0; i--) {
			if (size.width >= breakpointsData[i].size) {
				if (breakpoint === breakpointsData[i]) return;
				breakpoint = breakpointsData[i];
				
				eventEmitter.dispatch();
				return;
			}
		}
	}

	_getBreakPoint();
}

var _init = function() {

	size = _windowSize();
	_onResize();
	window.addEventListener('resize', _onResize, {passive: true});
	window.addEventListener('orientationchange', _onResize, {passive: true});
	window.addEventListener('load', _onResize, {passive: true});
}

var getData = function() {
	return breakpoint;
}

_init();

export default {
	subscribe: eventEmitter.subscribe.bind(eventEmitter),
	unsubscribe: eventEmitter.unsubscribe.bind(eventEmitter),
	getData: getData
}