import dispatcher from '../dispatcher.js';
import {datasetToOptions} from '../utils/component.utils.js';

import scrollStore from '../scroll/scroll.store.js';
import resizeStore from '../resize/resize.store.js';
import pageLoadStore from '../page-load/page-load.store.js';

import {offset} from '../utils/dom.utils.js';
import onTouchEnd from "swiper/src/components/core/events/onTouchEnd";
import routerStore from "../router/router.store";

const defaultOptions = {
    __namespace: ''
}

const decorators = [];

let _handleScroll = function () {
    let scrolled = scrollStore.getData().top;
    let wh = resizeStore.getData().height;

    if(scrolled + wh > this._offset &&
        scrolled < this._offset + this._h) {


    }
}

let _handleResize = function () {
    let w = this.clientWidth;
    let h = this.clientHeight;

    this._offset = offset(this).top;

    if(w !== this._w ||
        h !== this._h) {
        this._w = this.clientWidth;
        this._h = this.clientHeight;
    }

    this._scale = this._w / 685;
};

let _handleLoad = function () {
    if(this._loaded) return;

    if(pageLoadStore.getData().loaded) {
        this._loaded = true;

        this.handleResize();
        this.handleScroll();
        resizeStore.subscribe(this.handleResize);
        scrollStore.subscribe(this.handleScroll);
    }
};

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this._options = datasetToOptions(this.dataset, defaultOptions);
        this._loaded = false;

        this.handleScroll = _handleScroll.bind(this);
        this.handleResize = _handleResize.bind(this);
        this.handleLoad = _handleLoad.bind(this);

        this._active = false;
        this._activeHref = false;
        this._activeEl = false;
        this._scale = 0;

        this.handleClose = this.handleClose.bind(this);
        this.handleCloseHTML = this.handleCloseHTML.bind(this);
        this.handleMouseenter = this.handleMouseenter.bind(this);
        this.handleMouseleave = this.handleMouseleave.bind(this);
        this.handleDispatcher = this.handleDispatcher.bind(this);
    }

    connectedCallback() {
        pageLoadStore.subscribe(this.handleLoad);

        this._points = [...this.querySelectorAll('g')].map((point, index) => ({
            point,
            index,
            href: point.getAttribute('data-href'),
            box: point.getBBox()
        }));

        this._popupForPoints = this.getElementsByClassName('cardMap-popup')[0];

        if(this._popupForPoints) {
            this._btnClose = this._popupForPoints.getElementsByClassName('button-close')[0] || false;
            if (this._btnClose) this._btnClose.addEventListener('click', this.handleClose);

            document.documentElement.addEventListener('click', this.handleCloseHTML)
        }

        for (let item of this._points.values()) {
            item.point.addEventListener('mouseenter', this.handleMouseenter.bind(null, item));
            item.point.addEventListener('mouseleave', (event) => {
                this.handleMouseleave({delay: 3000}, event);
            });
        }

        decorators.forEach((d) => d.attach(this, this._options));
        dispatcher.subscribe(this.handleDispatcher);
    }

    disconnectedCallback() {
        this._destruct = true;
        pageLoadStore.unsubscribe(this.handleLoad);

        if(this._loaded) {
            scrollStore.unsubscribe(this.handleScroll);
            resizeStore.unsubscribe(this.handleResize);
        }

        decorators.forEach((d) => d.detach(this, this._options));
        dispatcher.unsubscribe(this.handleDispatcher);
    }

    handleMouseenter(item, event) {
        if(this._active) return;
        this._active = true;
        this._activeEl = item;

        clearTimeout(this._closeTO);

        if(!this._popupForPoints) return;

        this._popupForPoints.style.zIndex = 5;

        let href = routerStore.getData().page.href;

        if(this._activeHref === item.href) return;

        dispatcher.dispatch({
            type: "router:route",
            href: item.href,
            setHistory: false,
            setStore: false,
            transitionData: {
                animation: 'popup-map-transition',
                url: href,
                container: 'replaceable-maps-popup',
            },
        });

        this._popupForPoints.classList.add('active');
        this._popupForPoints.style.transform = `translateY(${item.box.y * this._scale + item.box.height + 20}px)`;
        this._activeHref = item.href;

        dispatcher.dispatch({
            type: "maps-geography:mouseenter",
            element: item,
        });
    }

    handleMouseleave(options, event) {
        options = Object.assign({
            delay: 0
        }, options);

        clearTimeout(this._closeTO);

        this._closeTO = setTimeout(() => {

        }, options.delay);
    }

    handleClose() {
        if(!this._active) return;

        this._popupForPoints.classList.remove('active');
        this._active = false;
        this._activeHref = false;
    }

    handleCloseHTML(e) {
        let target = e.target;

        if(
            target.classList.contains('cardMap-popup') ||
            target.closest("." + 'cardMap-popup__wr') ||
            target.closest("a") ||
            target.closest("button")
        ) {
        } else {
            this._popupForPoints.classList.remove('active');
            this._active = false;
            this._activeHref = false;
        }
    }

    handleDispatcher(e) {
        if(e.type === 'maps-geography:mouseenter' && e.element !== this._activeEl) {
            this.handleMouseleave();
        }
    }
}

customElements.define('maps-geography', ElementClass);

export default ElementClass;
