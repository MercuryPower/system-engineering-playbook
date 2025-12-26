import dispatcher from '../dispatcher.js';

var to;
var touchStart = null;
var hold = false;
var checkswipe = false;

var _handleMousedown = function(e) {
	if (hold) return;

	touchStart = {
		x: e.clientX,
		y: e.clientY
	}

	to = setTimeout(function() {
		hold = true;
		dispatcher.dispatch({
			type: 'mouse:hold',
			position: {
				x: touchStart.x,
				y: touchStart.y
			}
		});
		touchStart = null;
	}, 300);
}

var _handleMouseup = function() {
	clearTimeout(to);
	touchStart = null;

	if (hold) {
		hold = false;
		dispatcher.dispatch({
			type: 'mouse:release'
		});
	}
}

var _handleMousemove = function(e) {
	var dist;
	if (hold) return;

	if (touchStart) {
		dist = Math.pow((Math.pow(e.clientX - touchStart.x, 2) 
			+ Math.pow(e.clientY - touchStart.y, 2)), 0.5);

		if (dist > 100) {
			_handleTouchend();
		}
	}
}

var _handleTouchstart = function(e) {
	if (e.touches.length > 1) {
		return;
	}
	if (hold) return;

	e.preventDefault();
	e.stopPropagation();

	to = setTimeout(function() {
		hold = true;
		dispatcher.dispatch({
			type: 'mouse:hold',
			position: {
				x: touchStart.x,
				y: touchStart.y
			}
		});
		touchStart = null;
	}, 300);

	touchStart = {
		x: e.touches[0].clientX,
		y: e.touches[0].clientY
	}
}

var _handleTouchmove = function(e) {
	var touch = e.touches[0];
	var dist;
	if (hold) return;

	if (touchStart) {
		e.preventDefault();
		e.stopPropagation();
		dist = Math.pow((Math.pow(touch.clientX - touchStart.x, 2) 
			+ Math.pow(touch.clientY - touchStart.y, 2)), 0.5);

		if (dist > 100) {
			_handleTouchend();
		}
	}
}

var _handleTouchend = function() {
	clearTimeout(to);
	touchStart = null;

	if (hold) {
		hold = false;
		dispatcher.dispatch({
			type: 'mouse:release'
		});
	}
}

var _init = function() {
	document.addEventListener('mousedown',_handleMousedown);
	document.addEventListener('mouseup', _handleMouseup);
	document.addEventListener('mousemove', _handleMousemove);

	document.addEventListener('touchstart', _handleTouchstart);
	document.addEventListener('touchmove', _handleTouchmove);
	document.addEventListener('touchend', _handleTouchend);
}

_init();

export default {};