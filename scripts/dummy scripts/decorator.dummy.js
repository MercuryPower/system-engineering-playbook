import {attach, detach} from '../../utils/decorator.utils.js';

const name = null; // указать дефолтное имя декоратора

if (name === null) {
    console.error('decorator name is missing');
}

const defaultOptions = {
    name: name,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);
    }

    init() {}

    destroy() {}
}

export default {
    attach: (parent, options) => {
        return attach(Decorator, parent, Object.assign({}, defaultOptions, options));
    },
    detach: (parent, options) => {
        return detach(parent, Object.assign({}, defaultOptions, options));
    },
};