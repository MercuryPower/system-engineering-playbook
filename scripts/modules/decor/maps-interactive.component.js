import dispatcher from '../dispatcher.js';
import {datasetToOptions} from '../utils/component.utils.js';
import addressbarStore from "../addressbar/addressbar.store";
//
// import scrollStore from '../scroll/scroll.store.js';
// import resizeStore from '../resize/resize.store.js';
// import pageLoadStore from '../page-load/page-load.store.js';
//
// import {offset} from '../utils/dom.utils.js';
// import onTouchEnd from "swiper/src/components/core/events/onTouchEnd";
// import routerStore from "../router/router.store";

const defaultOptions = {
    __namespace: ''
}

const decorators = [];

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this._options = datasetToOptions(this.dataset, defaultOptions);
        this._buttons = [...this.querySelectorAll('.maps__buttons.is-desktop .btn')].map((el) => ({
            button: el,
            region: el.getAttribute('data-map-region')
        }))
        this._mapsLocation = [...this.querySelectorAll('maps-geography svg g')].map((map) => ({
            map,
            region: map.getAttribute('data-region'),
            href: map.getAttribute('data-href'),
        }))
    }

    connectedCallback() {

        this._mapsLocation.forEach((itemMap) => {
            itemMap.map.addEventListener('mouseover', (e) => {
                this._buttons.filter((itemBtn) => {
                    if(itemBtn.region === itemMap.region) {
                        itemBtn.button.classList.add('active')
                    }
                })
            })

            itemMap.map.addEventListener('mouseout', (e) => {
                this._buttons.filter((itemBtn) => {
                    itemBtn.button.classList.remove('active')
                })
            })


            itemMap.map.addEventListener('click', (e) => {
                let filterData = this.getFilterData(itemMap.href);

                let name = filterData.name;
                let value = filterData.value;

                dispatcher.dispatch({
                    type: "search:set",
                    name: `filter.${name}`,
                    value: value,
                    history: false,
                });

                let address = addressbarStore.getData().href;

                dispatcher.dispatch({
                    type: "router:route",
                    href: address,
                    transitionData: {
                        container: 'replaceable-maps',
                    },
                });
            })
        })

        decorators.forEach((d) => d.attach(this, this._options));
    }

    disconnectedCallback() {
        decorators.forEach((d) => d.detach(this, this._options));
    }

    getFilterData(href) {
        let result = /filter\[(.+?)\]=([\d\w]+)/gm.exec(href);

        if(result === null) {
            console.error(
                `cant retrieve filter data with regular expression for href="${href}"`
            );
            return;
        }

        let value = result[2];

        if(value === "_" ||
            value === "") {
            value = new Set();
        } else if(value[0] === "[" && value[value.length - 1] === "]") {
            value = new Set(value
                .replace("[", "")
                .replace("]", "")
                .replace(", ", ",")
                .split(","));
        } else {
            value = new Set().add(value);
        }

        return {
            name: result[1],
            value: value
        };
    }
}

customElements.define('maps-interactive', ElementClass);

export default ElementClass;
