import { transition } from '../../utils/animation.utils.js';
import dispatcher from '../../dispatcher.js';

const time = window._vars.time;
const ease = window._vars.ease.css;

let open = function ({ activeId, activePopup }) {
};

let close = function ({ previousId, previousPopup }) {
};

let change = function ({ activeId, activePopup, previousId, previousPopup }) {};

export default {
	open: open,
	close: close,
	change: change,
};
