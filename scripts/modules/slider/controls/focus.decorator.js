import dispatcher from '../../dispatcher.js';
import {attach, detach} from '../../utils/decorator.utils.js';
import keyboardEvents from '../../events/keyboard.view.js';

keyboardEvents.init();

const name = 'focus';

const defaultOptions = {
    name: name,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);
        this.handleKeyboard = this.handleKeyboard.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

        this._subscribed = false;
    }

    handleKeyboard(e) {
        if (e.type === 'keyboard:left') {
            dispatcher.dispatch({
                type: 'slider:prev',
                id: this._parent._id,
                userData: {
                    direction: 'prev'
                }
            });
        }
        if (e.type === 'keyboard:right') {
            dispatcher.dispatch({
                type: 'slider:next',
                id: this._parent._id,
                userData: {
                    direction: 'next'
                }
            });
        }
    }

    handleFocus() {
        this._subscribed = true;
        dispatcher.subscribe('keyboard', this.handleKeyboard);
    }

    handleBlur() {
        this._subscribed = false;
        dispatcher.unsubscribe('keyboard', this.handleKeyboard);
    }

    init() {
        if (!this._options.focusable) return;

        this._parent.setAttribute('tabindex', 0);
        this._parent.addEventListener('focus', this.handleFocus);
        this._parent.addEventListener('blur', this.handleBlur);
    }

    destroy() {
        if (!this._options.focusable) return;

        this._parent.removeAttribute('tabindex', 0);
        this._parent.removeEventListener('focus', this.handleFocus);
        this._parent.removeEventListener('blur', this.handleBlur);
        if (this._subscribed) {
            dispatcher.unsubscribe('keyboard', this._handleKeyboard);
        }
    }
}

export default {
    attach: (parent, options) => {
        return attach(Decorator, parent, Object.assign({}, defaultOptions, options));
    },
    detach: (parent, options) => {
        return detach(parent, Object.assign({}, defaultOptions, options));
    },
};