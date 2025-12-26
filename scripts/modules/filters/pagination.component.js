import dispatcher from '../dispatcher.js';
import addressStore from '../addressbar/addressbar.store'
import { offset as getOffset } from '../utils/dom.utils.js';

function deserialize(query) {
    let result = {};
    let eq, key, val, from, to, index;

    let pos = query.indexOf('?');
    query = query.substr(pos + 1);

    query.split('&').forEach(function (part) {
        if (!part) return;
        part = part.split('+').join(' ');
        eq = part.indexOf('=');
        key = eq > -1 ? part.substr(0, eq) : part;
        val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
        from = key.indexOf('[');
        if (from === -1) {
            result[decodeURIComponent(key)] = val;
        } else {
            to = key.indexOf(']', from);
            index = decodeURIComponent(key.substring(from + 1, to));
            key = decodeURIComponent(key.substring(0, from));
            if (!result[key]) result[key] = {};
            if (!index) {
                result[key].push(val);
            } else {
                result[key][index] = val;
            }
        }
    });
    return result;
}

let elementProto = Object.create(HTMLElement.prototype);

let _handleDispathcer = function (e) {
    let self = this;

    if (e.type === 'pagination:reset') {
        dispatcher.dispatch({
            type: 'search:set',
            name: self._property,
            history: false
        });
    }
}

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this.handleDispathcer = _handleDispathcer.bind(this);
    }

    connectedCallback() {
        let self = this;

        this._property = this.getAttribute('data-property') || 'p';
        this._container = this.getAttribute('data-container') || 'replaceable-filter';
        this._scrollTo = this.getAttribute('data-scrollTo');
        this._links = this.getElementsByTagName('a');

        if (!this._container) {
            console.warn('no data-container specified on pagination-component');
            return;
        }

        // this._container = document.getElementsByClassName(this._container)[0];

        if (this._scrollTo) {
            this._scrollTo = document.getElementsByClassName(this._scrollTo)[0];
        }

        Array.prototype.forEach.call(this._links, function (a) {
            a.addEventListener('click', function (e) {
                let offset;
                let href = a.href;
                let obj = deserialize(href);
                let value = obj[self._property];

                if (value === undefined) return;

                e.preventDefault();

                dispatcher.dispatch({
                    type: 'search:set',
                    name: self._property,
                    value: value,
                    history: false
                });

                if (self._scrollTo) {
                    offset = getOffset(self._scrollTo).top;
                    dispatcher.dispatch({
                        type: 'scroll:to',
                        position: offset - 120,
                        duration: 0
                    });
                }

                dispatcher.dispatch({
                    type: 'router:route',
                    href: addressStore.getData().href,
                    transitionData: {
                        container: self._container,
                        url: addressStore.getData().href,
                        noScroll: true,
                        noShift: true,
                        mode: "replace"
                    }
                });
            });
        });


        dispatcher.subscribe(this.handleDispathcer);

    }

    disconnectedCallback() {
        dispatcher.unsubscribe(this.handleDispathcer);

    }
}

customElements.define('pagination-component', ElementClass);

export default ElementClass;
