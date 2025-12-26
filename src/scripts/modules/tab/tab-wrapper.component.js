import dispatcher from '../dispatcher';
import tabStore from './tab.store';
import resizeStore from '../resize/resize.store';
import addressStore from '../addressbar/addressbar.store';

function translateTo(el, speed, data) {
    let scale = null;
    let opacity = null;

    let ease = data.easing || 'ease';
    let delay = data.delay || 0;
    let translate = data.translate || [0, 0, 0];
    scale = data.hasOwnProperty('scale') ? scale : 1;
    opacity = data.hasOwnProperty('opacity') ? data.opacity : 1;

    let transition = 'transform ' + speed + 's ' + ease + ' ' + delay + 's,' +
        'opacity ' + speed + 's ' + ease + ' ' + delay + 's';

    if (!el || !el.style) return; // hi microsoft edge

    el.style.transition =
        el.style.webkitTransition = transition;

    el.style.transform =
        el.style.webkitTransform = 'translateX(' + translate[0] + 'px)' +
            'translateY(' + translate[1] + 'px)' +
            'translateZ(' + translate[2] + 'px)' +
            'scaleX(' + data.scale + ')';

    el.style.opacity = opacity;
}

let _handleTabs = function (speedIndex) {
    let storeData = tabStore.getData()[this._id];
    let index = storeData.index;
    let self = this;
    let maxH = 0;
    let distance = -50;

    if (speedIndex === undefined) {
        speedIndex = 1;
    }

    if (index === this._index) return;

    if (this._tabs[this._index] && this._tabs[index]) {
        if (this._index > index) {
            distance *= -1;
        }
    }

    this._tabs[this._index].style.pointerEvents = 'none';

    if (this._tabs[this._index]) {
        translateTo(this._tabs[this._index], 0.6 * speedIndex, {
            translate: [distance, 0, 0],
            scale: 1.02,
            opacity: 0,
            ease: 'ease-in',
            delay: 0
        });

        this._tabs[this._index].style.position = 'absolute';
        this._tabs[this._index].setAttribute('aria-hidden', 'true');

        maxH = this._tabs[this._index].clientHeight;
    }

    this._index = index;
    this._tabs[this._index].style.pointerEvents = 'all';
    this._tabs[this._index].setAttribute('aria-hidden', 'false');

    if (this._tabs[this._index]) {
        translateTo(this._tabs[this._index], 0, {
            translate: [-distance, 0, 0],
            scale: 1.02,
            opacity: 0,
            ease: 'ease-in'
        });
        setTimeout(function () {
            translateTo(self._tabs[self._index], 0.6 * speedIndex, {
                translate: [0, 0, 0],
                scale: 1,
                opacity: 1,
                delay: 0.2,
                ease: 'ease-out'
            });
        }, 20);
        this._tabs[this._index].style.position = 'relative';
        maxH = Math.max(maxH, this._tabs[this._index].clientHeight);
    }

    if (!this._maxSize) {
        this.style.height = maxH + 'px';
        setTimeout(function () {
            self.style.height = 'auto';
        }, 700);
    }
}

let _handleResize = function () {
    let maxH = 0;

    if (this._maxSize) {
        this._tabs.forEach(function (slide) {
            let h;
            let img = slide.getElementsByTagName('img')[0];

            if (img) {
                h = img.clientHeight;
            } else {
                h = slide.clientHeight;
            }
            maxH = Math.max(maxH, h);
        });

        this.style.height = maxH + 'px';
    }
}

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this._index = 0;
        this.handleResize = _handleResize.bind(this);
        this.handletab = _handleTabs.bind(this);
    }

    connectedCallback() {
        let self = this;
        let addressData;
        this._id = this.getAttribute('data-id');
        this._maxSize = this.getAttribute('data-maxSize');
        this._tabs = this.getElementsByClassName('tab');
        this._tabs = Array.prototype.slice.call(this._tabs);
        this.classList.add('initialized');

        addressData = addressStore.getData().search[this._id];

        // if (addressData) {
        // 	this._index = parseInt(addressData);
        // }

        dispatcher.dispatch({
            type: 'tab:add',
            id: this._id,
            index: this._index,
            total: this._tabs.length,
        });

        this._tabs.forEach(function (tab, index) {
            let tabId = tab.getAttribute('data-id');
            let active = false;

            if (addressData) {
                if (tabId && tabId === addressData ||
                    !tabId && index === parseInt(addressData)) {
                    active = true;
                }
            } else if (index === 0) {
                active = true;
            }

            if (active) {
                self._index = index;
                tab.setAttribute('aria-hidden', 'false');

                dispatcher.dispatch({
                    type: 'tab:to',
                    id: self._id,
                    index: index
                });
            } else {
                tab.style.position = 'absolute';
                tab.style.opacity = 0;
                tab.style.pointerEvents = 'none';
                tab.setAttribute('aria-hidden', 'true');
            }
        });

        this.handleResize();
        this.handletab(0);
        resizeStore.subscribe(this.handleResize);
        tabStore.subscribe(this.handletab);
    }

    disconnectedCallback() {
        resizeStore.unsubscribe(this.handleResize);
        tabStore.unsubscribe(this.handletab);
    }
}


customElements.define('tab-wrapper', ElementClass);

export default ElementClass;

