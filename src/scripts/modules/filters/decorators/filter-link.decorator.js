import { attach, detach, update } from "../../utils/decorator.utils.js";
import dispatcher from "../../dispatcher.js";
import { datasetToOptions } from "../../utils/component.utils.js";
import addressbarStore from "../../addressbar/addressbar.store.js";
import pageLoadStore from "../../page-load/page-load.store.js";
import filterStore from "../filter.store.js";
import * as setUtils from "../../utils/set.utils.js";


const name = "filter-link"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    __namespace: "",
    name: name,
    tab: [],
    mode: "exclude", // "include",
    container: "replaceable-filter",
    setHistory: false,
    setRoute: true,
};

// ?filter[name]=_ for empty select

// <a is="filter-component" href="/html/news/news.html?filter[tag]=_">Все</a>
// <a is="filter-component" data-mode="include" href="/html/news/news.html?filter[tag]=events">События</a>

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = options;

        this.handleClick = this.handleClick.bind(this);
        this.handleFilters = this.handleFilters.bind(this);

        this._active = false;
    }

    init() {
        this._options = datasetToOptions(this._parent.dataset, this._options);

        this._parent.setAttribute("role", "switch");

        this.handleFilters();

        this._parent.addEventListener("click", this.handleClick);
        filterStore.subscribe(this.handleFilters);
    }

    destroy() {
        filterStore.unsubscribe(this.handleFilters);
    }

    getFilterData() {
        let result = /filter\[(.+?)\]=([\D\w]+)/gm.exec(this._parent.href);

        if (result === null) {
            console.error(
                `cant retrieve filter data with regular expression for href="${this._parent.href}"`
            );
            return;
        }

        let value = result[2];

        if (value === "_" ||
            value === "") {
            value = new Set();
        } else if (value[0] === "[" && value[value.length - 1] === "]") {
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

    handleClick(e) {
        e.preventDefault();

        if (!pageLoadStore.getData().loaded) return;

        if (this._options.mode === "exclude" && this._active) {
            return;
        }

        let filterData = this.getFilterData();
        let name = filterData.name;
        let value = filterData.value;

        let newData = value;

        if (this._options.mode === "include") {
            let storeValue = filterStore.getData().filter[name];

            if (storeValue) {
                newData = setUtils.symmetricDifference(storeValue, newData);
            }
        }

        dispatcher.dispatch({
            type: "filter:set",
            name: name,
            value: newData,
        });

        if (this._options.tab.length > 0) {
            this._options.tab.forEach((name) => {
                dispatcher.dispatch({
                    type: "filter:set",
                    name: name,
                    value: null
                });

                dispatcher.dispatch({
                    type: "search:set",
                    name: `filter.${name}`,
                    value: null,
                    history: false,
                });
            });

        }

        if (this._options.setRoute) {

            dispatcher.dispatch({ type: "pagination:reset" });
            dispatcher.dispatch({ type: "search:reset" });

            dispatcher.dispatch({
                type: "search:set",
                name: `filter.${name}`,
                value: newData,
                history: false,
            });


            let address = addressbarStore.getData().href;


            dispatcher.dispatch({
                type: "router:route",
                href: address,
                transitionData: {
                    container: this._options.container,
                },
            });
        }
    }

    setHtmlAttributes(active) {
        if (active && !this._active) {
            this._active = true;
            this._parent.classList.add("active");
            this._parent.setAttribute("aria-checked", "true");
            this._parent.dispatchEvent(new Event("change"));
        } else if (!active && this._active) {
            this._active = false;
            this._parent.classList.remove("active");
            this._parent.setAttribute("aria-checked", "false");
            this._parent.dispatchEvent(new Event("change"));
        }
    }

    handleFilters() {
        let storeData = filterStore.getData().filter;

        let filterData = this.getFilterData();
        let name = filterData.name;
        let value = filterData.value;

        let storeValue = storeData[name];

        if (value.size === 0) {
            if (storeValue) {
                this.setHtmlAttributes(false);
            } else {
                this.setHtmlAttributes(true);
            }
        } else {
            if (storeValue) {
                if (this._options.mode === "include") {
                    if (setUtils.isSuperset(storeValue, value)) {
                        this.setHtmlAttributes(true);
                    } else {
                        this.setHtmlAttributes(false);
                    }
                } else {
                    if (setUtils.symmetricDifference(storeValue, value).size === 0) {
                        this.setHtmlAttributes(true);
                    } else {
                        this.setHtmlAttributes(false);
                    }
                }
            } else {
                this.setHtmlAttributes(false);
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
