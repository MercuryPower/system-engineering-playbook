import dispatcher from '../dispatcher.js';

var start = {};
var delta = {};
var vertical = undefined;

var _ontouchstart = function(e) {
	var touches;

	if (e.touches) {
		touches = e.touches[0];

		start = {
			x: touches.pageX,
			y: touches.pageY,
			time: +new Date
		}
	} else {
		start = {
			x: e.clientX,
			y: e.clientY,
			time: +new Date
		}
	}

	delta = {}
	vertical = undefined;

	document.addEventListener('mousemove', _ontouchmove);
	document.addEventListener('mouseup',  _ontouchend);
	document.addEventListener('mouseleave',  _ontouchend);
	document.addEventListener('touchmove', _ontouchmove);
	document.addEventListener('touchend',  _ontouchend);
}

var _ontouchmove = function(e) {
	var touches;
	var move = 0;
	var dirDelta;

	if (e.touches) {
		if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
		touches = event.touches[0];
		delta = {
			x: touches.pageX - start.x,
			y: touches.pageY - start.y
		}
	} else {
		delta = {
			x: e.clientX - start.x,
			y: e.clientY - start.y
		}
	}

	if (vertical === undefined) {
		vertical = Math.abs(delta.x) < Math.abs(delta.y);
	}

	dirDelta = delta.x;
	if (vertical) return;
}

var _ontouchend =  function(e) {
	var dirDelta;
	var duration, check, check2;
	var returnSpeed = 250;
	var touchEndEvent;

	check2 = true;

	document.removeEventListener('mousemove', _ontouchmove);
	document.removeEventListener('mouseup',  _ontouchend);
	document.removeEventListener('mouseleave',  _ontouchend);

	document.removeEventListener('touchmove', _ontouchmove);
	document.removeEventListener('touchend',  _ontouchend);

	dirDelta = delta.x;
	if (vertical) check2 = false;

	duration = +new Date - start.time;

	check = parseInt(duration) < 250 && Math.abs(dirDelta) > 20
		 || Math.abs(dirDelta) > 300;
	check = check && check2;
	if (check) {
		if (dirDelta > 0) {
			dispatcher.dispatch({
				type: 'swipe:right'
			});
		} else {
			dispatcher.dispatch({
				type: 'swipe:left'
			});
		}
	}
}

var _init = function() {
	document.addEventListener('mousedown', _ontouchstart);
	document.addEventListener('touchstart', _ontouchstart);
}

_init()

export default {};