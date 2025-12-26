import dispatcher from '../dispatcher';
import tabStore from './tab.store';
import resizeStore from '../resize/resize.store';

import Draggable from 'gsap/Draggable';


let _handleClick = function (el, index) {
    let self = this;
    el.addEventListener('click', function () {
        let storeData = tabStore.getData()[self._id];

        if (!storeData) return;
        if (storeData.index === index) return;

        dispatcher.dispatch({
            type: 'tab:to',
            id: self._id,
            index: index
        });
    });
};

let _handleStore = function () {
    let storeData = tabStore.getData()[this._id];

    if (!storeData) return;
    if (storeData.index === null) return;
    if (storeData.index === this._index) return;

    if (this._items[this._index]) {
        this._items[this._index].classList.remove('active');
        this._items[this._index].setAttribute('aria-selected', 'false');
    }

    this._index = storeData.index;

    if (this._items[this._index]) {
        this._items[this._index].classList.add('active');
        this._items[this._index].setAttribute('aria-selected', 'true');
    }
};

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this._index = 0;

        this.handleStore = _handleStore.bind(this);
        this.handleClick = _handleClick.bind(this);
    }

    connectedCallback() {
        let self = this;
        this._wr = this.querySelector('.tab-switch-wr') || false;

        this._items = this.getElementsByTagName('button');
        this._id = this.getAttribute('data-id');

        Array.prototype.forEach.call(this._items, this.handleClick);

        Array.prototype.forEach.call(this._items, function (item) {
            if (item.classList.contains('active')) {
                item.setAttribute('aria-selected', 'true');
            } else {
                item.setAttribute('aria-selected', 'false');
            }
        });

        if (this._wr) {
            this._draggable = Draggable.create(this._wr, {
                type: 'scroll',
            });
        }

        this.handleStore();
        tabStore.subscribe(this.handleStore);
    }

    disconnectedCallback() {
        tabStore.unsubscribe(this.handleStore);
    }
}

customElements.define('tab-switch', ElementClass);

export default ElementClass;
