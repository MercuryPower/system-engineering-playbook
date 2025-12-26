import {attach, detach, update} from "../../utils/decorator.utils.js";
import dispatcher from "../../dispatcher.js";
import {datasetToOptions} from "../../utils/component.utils.js";
import addressbarStore from "../../addressbar/addressbar.store.js";
import pageLoadStore from "../../page-load/page-load.store.js";
import filterStore from "../filter.store.js";
import * as setUtils from "../../utils/set.utils.js";
import noUiSlider from "nouislider";


const name = "filter-range"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    __namespace: "",
    name: name,
    container: "replaceable-filter",
    setHistory: false,
    setRoute: true,
    thumbs: [],
    step: 10,
    href: '',

};

// ?filter[name]=_ for empty select

// <a is="filter-component" href="/html/news/news.html?filter[tag]=_">Все</a>
// <a is="filter-component" data-mode="include" href="/html/news/news.html?filter[tag]=events">События</a>

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = options;

        this.handleFilters = this.handleFilters.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onChangeRange = this.onChangeRange.bind(this);
        this.onUpdate = this.onUpdate.bind(this);

        this._active = false;
    }

    init() {
        const self = this;
        this._options = datasetToOptions(this._parent.dataset, this._options);

        this._parent.setAttribute("role", "slider");

        this._inputs = [...this._parent.querySelectorAll('.outputs .i')].map((input) => ([
            input
        ]));

        this._range = this._parent.querySelector('.input-range');

        noUiSlider.create(this._range, {
            start: this._options.thumbs,
            connect: true,
            step: this._options.step,
            range: {
                'min': this._options.thumbs[0],
                'max': this._options.thumbs[1],
            }
        });

        this._range.noUiSlider.on('update', this.onUpdate);
        this._range.noUiSlider.on('change', this.onChangeRange);

        this._inputs.forEach((input, handle) => {
            input[0].addEventListener('change', self.handleChange.bind(null, handle));
        });

        this.handleFilters();
        filterStore.subscribe(this.handleFilters);
    }

    destroy() {
        filterStore.unsubscribe(this.handleFilters);
    }

    onUpdate(values, handle) {
        this._inputs[handle][0].value = parseInt(values[handle]);
    }

    onChangeRange(values) {
        dispatcher.dispatch({type: "pagination:reset"});

        dispatcher.dispatch({
            type: "search:set",
            name: `filter.count`,
            value: values.join('~'),
            history: false,
        });

        let address = addressbarStore.getData().href;


        dispatcher.dispatch({
            type: "router:route",
            href: address,
            transitionData: {
                container: 'replaceable-filter'
            },
        });
    }

    handleChange(handle, event) {
        this._range.noUiSlider.setHandle(handle, event.target.value);


        let values = this._range.noUiSlider.get();
        dispatcher.dispatch({type: "pagination:reset"});

        dispatcher.dispatch({
            type: "search:set",
            name: `filter.count`,
            value: values.join('~'),
            history: false,
        });

        let address = addressbarStore.getData().href;

        dispatcher.dispatch({
            type: "router:route",
            href: address,
            transitionData: {
                container: 'replaceable-filter'
            },
        });
    }

    getFilterData() {
        let result = /filter\[(.+?)\]=([\d\w\/~\d\w]+)/gm.exec(this._options.href);


        if (result === null) {
            console.error(
                `cant retrieve filter data with regular expression for href="${this._options.href}"`
            );
            return;
        }

        return {
            name: result[1],
            value: result[2]
        };
    }

    setHtmlAttributes(active) {
        // if (active && !this._active) {
        //     this._active = true;
        //     this._parent.classList.add("active");
        //     this._parent.setAttribute("aria-checked", "true");
        //     this._parent.dispatchEvent(new Event("change"));
        // } else if (!active && this._active) {
        //     this._active = false;
        //     this._parent.classList.remove("active");
        //     this._parent.setAttribute("aria-checked", "false");
        //     this._parent.dispatchEvent(new Event("change"));
        // }
    }

    handleFilters() {
        let storeData = filterStore.getData().filter;


        let filterData = this.getFilterData();
        let name = filterData.name;
        let value = filterData.value;

        let storeValue = storeData[name];

        if (value.size === 0) {

            if (storeValue) {

            } else {

            }
        } else {
            if (storeValue) {
                for (let x of storeValue) {
                    this._range.noUiSlider.set([x.split("~")[0], x.split("~")[1]]);
                }
            } else {
                this._range.noUiSlider.set([this._options.thumbs[0], this._options.thumbs[1]]);
            }
        }
    }
}

export default {
    attach: (parent, options) => {
        return attach(
            Decorator,
            parent,
            Object.assign({}, defaultOptions, options)
        );
    },
    detach: (parent, options) => {
        return detach(parent, Object.assign({}, defaultOptions, options));
    },
    update: (parent, options) => {
        return update(parent, options);
    },
};
