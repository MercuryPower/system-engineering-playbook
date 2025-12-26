import dispatcher from '../../dispatcher.js';
import {attach, detach} from '../../utils/decorator.utils.js';
import keyboardEvents from '../../events/keyboard.view.js';

keyboardEvents.init();

const name = 'tab';

const defaultOptions = {
    name: name,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);
        this.handleKeyboard = this.handleKeyboard.bind(this);
    }

    handleKeyboard(e) {
        var activeElement;

        if (e.type === 'keyboard:tab' ||
            e.type === 'keyboard:shift-tab') {

            setTimeout(() => {
                activeElement = document.activeElement;

                if (!this._parent.contains(activeElement)) {
                    return;
                }

                this._parent._slides.forEach((slide, index) => {
                    if (slide.element.contains(activeElement)) {
                        dispatcher.dispatch({
                            type: 'slider:to',
                            id: this._parent._id,
                            index: index
                        });
                    }
                });
            }, 0);
        }
    }

    init() {
        dispatcher.subscribe('keyboard', this.handleKeyboard);
    }

    destroy() {
        dispatcher.unsubscribe('keyboard', this.handleKeyboard);
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