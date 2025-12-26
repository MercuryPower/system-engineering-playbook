import dispatcher from "../dispatcher.js";
import { datasetToOptions } from "../utils/component.utils.js";
import { getFocusable } from "../utils/dom.utils.js";

const decorators = [];

const defaultOptions = {
    __namespace: "",
};

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        // this.handleMouseenter = this.handleMouseenter.bind(this);
        // this.handleMouseleave = this.handleMouseleave.bind(this);
        this.handleDispatcher = this.handleDispatcher.bind(this);
        // this.handleFocus = this.handleFocus.bind(this);
        // this.handleBlur = this.handleBlur.bind(this);
        this.navHandleClick = this.navHandleClick.bind(this);
        this.linkBackHandleClick = this.linkBackHandleClick.bind(this);

        this._active = false;
        this._linkFocus = false;
    }

    connectedCallback() {
        this._options = datasetToOptions(this.dataset, defaultOptions);

        this._arr = this.getElementsByClassName('nav-group__array')[0];
        this._parent = this.parentElement;

        this._linkBack = document.getElementsByClassName('popup-menu__back')[0];

        this._arr.addEventListener('click', this.navHandleClick);
        this._linkBack.addEventListener('click', this.linkBackHandleClick);

        dispatcher.subscribe(this.handleDispatcher);
        decorators.forEach((d) => d.attach(this, this._options));
    }

    disconnectedCallback() {
        decorators.forEach((d) => d.detach(this, this._options));
    }

    navHandleClick(e) {
        if (this._active) return;
        this._active = this;

        this.classList.add('active');
        this._parent.classList.add('active');
        this._linkBack.classList.add('active');
    }

    linkBackHandleClick() {
        if (!this._active) return;

        this._active.classList.remove('active');
        this._active._parent.classList.remove('active');
        this._linkBack.classList.remove('active');

        this._active = false;
    }

    handleFocus() {
        this._linkFocus = true;
    }

    handleBlur() {
        this._linkFocus = false;
    }

    handleDispatcher(e) {
        if (e.type === 'popup:close-all') {
            this.linkBackHandleClick();
        }
    }
}

customElements.define("m-nav-group", ElementClass);

export default ElementClass;
