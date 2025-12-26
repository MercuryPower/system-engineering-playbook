import dispatcher from '../dispatcher.js';
import resizeStore from '../resize/resize.store.js';
// import slideStore from '../slide-scroll/slide-scroll.store.js';

var vhHeightCollection;
var vhMinHeightCollection;
var halfCellTopCollection;

var _resizeHandler = function() {
	var wh = window.innerHeight;
	var styles;
	var bt, bb, pt, pb, summ;
	var prev;
	// var slideData = slideStore.getData().items['main-slides'];

	var changed = false;

	if (vhHeightCollection && vhHeightCollection.length !== 0) {
		Array.prototype.forEach.call(vhHeightCollection, function(element) {
			let additionalMargin = element.getAttribute('data-margin');
			additionalMargin = additionalMargin ? parseInt(additionalMargin) : 0;

			styles = getComputedStyle(element);
			bt = parseInt(styles['border-top-width']);
			bb = parseInt(styles['border-bottom-width']);
			pt = parseInt(styles['padding-top']);
			pb = parseInt(styles['padding-bottom']);
			summ = bt + bb + pt + pb + additionalMargin;

			if (element.style.height === (wh - summ) + 'px') return;

			element.style.height = (wh - summ) + 'px';
			changed = true;
		});
	}
	if (vhMinHeightCollection && vhMinHeightCollection.length !== 0) {
		Array.prototype.forEach.call(vhMinHeightCollection, function(element) {
			let additionalMargin = element.getAttribute('data-margin');
			additionalMargin = additionalMargin ? parseInt(additionalMargin) : 0;

			styles = getComputedStyle(element);
			bt = parseInt(styles['border-top-width']);
			bb = parseInt(styles['border-bottom-width']);
			pt = parseInt(styles['padding-top']);
			pb = parseInt(styles['padding-bottom']);
			summ = bt + bb + pt + pb  + additionalMargin;

			if (element.style.minHeight === (wh - summ) + 'px') return;

			element.style.minHeight = (wh - summ) + 'px';
			changed = true;
		});
	}

	if (changed) {
		setTimeout(function() {
			dispatcher.dispatch({
				type: 'resize:store-fire'
			});
		}, 20);
	}
}

var _dispatcherHandler = function() {}

var init = function() {
	vhHeightCollection = document.getElementsByClassName('vh-height');
	vhMinHeightCollection = document.getElementsByClassName('vh-min-height');
	// halfCellTopCollection = document.getElementsByClassName('half-cell-top');

	_resizeHandler();

	window.addEventListener('resize', _resizeHandler, {passive: true});
	window.addEventListener('orientationchange', _resizeHandler, {passive: true});
	window.addEventListener('load', _resizeHandler, {passive: true});
}

export default {
	init: init
}