// просто подключить.
// ставит стиль * {outline:none} при взаимодействии с мышью
// и убирает при взаимодействии с клавы
// и добавляет класс .no-outline на .page-wrapper если он есть

var el;
var set = false;

var _set = function() {
	var pw;
	if (set) return;
	pw = document.getElementsByClassName('page-wrapper')[0];
	set = true;
	el.innerHTML = '* {outline:none}';
	if (pw) {
		pw.classList.add('no-outline');
		pw.classList.remove('outline');
	}
}
var _remove = function() {
	var pw;
	if (!set) return;
	pw = document.getElementsByClassName('page-wrapper')[0];
	set = false;
	el.innerHTML = '';
	if (pw) {
		pw.classList.remove('no-outline');
		pw.classList.add('outline');
	}
}

var _init = function() {
	el = document.createElement('style');
	document.head.appendChild(el);

	_set();

	document.addEventListener('mousedown', _set);
	document.addEventListener('touchstart', _set);
	document.addEventListener('keydown', _remove);
}

_init();

export default {};