import { attach, detach, update } from "../../utils/decorator.utils.js";
import dispatcher from "../../dispatcher.js";
import { datasetToOptions } from "../../utils/component.utils.js";
import addressbarStore from "../../addressbar/addressbar.store.js";
import filterStore from "../filter.store.js";
import * as setUtils from "../../utils/set.utils.js";

const name = "filter-select"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

const defaultOptions = {
    __namespace: "",
    name: name,
    container: "replaceable-filter",
    icoClass: "i",
    setHistory: false,
    setRoute: true,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = options;

        this.handleChange = this.handleChange.bind(this);
        this.handleFilters = this.handleFilters.bind(this);

        this._active = false;
    }

    init() {
        this._options = datasetToOptions(this._parent.dataset, this._options);
        this._multi = this._parent.multiple;

        this._ico = this._parent.getElementsByClassName("i");

        this.handleFilters();
        filterStore.subscribe(this.handleFilters);
        this._parent.addEventListener("change", this.handleChange);
    }

    destroy() {}

    getFilterData(element) {
        if (!element) {
            element = this._parent;
        }

        let name = element.name;
        let value = new Set();

        if (element.options) {
            Array.prototype.forEach.call(element.options, (op) => {
                if (op.selected) {
                    let val = op.value;

                    if (val === "_" || val === "") {
                        return;
                    } else if (val[0] === "[" && val[val.length - 1] === "]") {
                        val = new Set(
                            val
                                .replace("[", "")
                                .replace("]", "")
                                .split(", ")
                                .join(",")
                                .split(",")
                        );
                    }

                    value.add(val);
                }
            });
        } else {
            value = element.value;

            if (value === "_" || value === "") {
                value = "";
            } else if (value[0] === "[" && value[value.length - 1] === "]") {
                value = value
                    .replace("[", "")
                    .replace("]", "")
                    .split(", ")
                    .join(",")
                    .split(",");
            }
        }

        return {
            name: name,
            value: value,
        };
    }

    handleChange() {
        let filterData = this.getFilterData();
        let name = filterData.name;
        let value = filterData.value;

        dispatcher.dispatch({
            type: "filter:set",
            name: name,
            value: value,
        });

        if (this._options.setHistory && !this._options.setRoute) {
            dispatcher.dispatch({
                type: "search:set",
                name: `filter.${name}`,
                value: value,
                history: true,
            });
        } else if (this._options.setRoute) {
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
                    container: this._options.container,
                },
            });
        }
    }

    setOption(value) {
        let changed = false;

        if (value.size === 0) {
            value.add("");
        }

        let lastOption = null;

        Array.prototype.forEach.call(this._parent.options, (op, i) => {
            let itemValue = op.value;

            if (value.has(itemValue)) {
                if (!op.selected) {
                    op.setAttribute("selected", "selected");
                    changed = true;

                    lastOption = op;
                }
            } else {
                if (op.selected) {
                    op.removeAttribute("selected");
                    changed = true;
                }
            }
        });

        if (lastOption && !this._multi) {
            this._parent.value = lastOption.value;
        }

        if (changed) {
            this._parent.dispatchEvent(new Event("change"));
        }
    }

    handleFilters() {
        let storeData = filterStore.getData().filter;

        let filterData = this.getFilterData();
        let name = filterData.name;
        let value = filterData.value;

        let storeValue = storeData[name];

        if (storeValue) {
            if (!setUtils.equals(storeValue, value)) {
                this.setOption(storeValue);
            }
        } else {
            this.setOption(new Set());
        }

        let parent = this._parent.closest(".filter-select");

        if (this.getFilterData().value.size !== 0) {
            this._parent.classList.add("not-empty");
            if (parent) {
                parent.classList.add("not-empty");
            }
        } else {
            this._parent.classList.remove("not-empty");
            if (parent) {
                parent.classList.remove("not-empty");
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
