import {attach, detach, update} from "../../utils/decorator.utils.js";
import dispatcher from "../../dispatcher.js";
import {datasetToOptions} from "../../utils/component.utils.js";

import addressbarStore from "../../addressbar/addressbar.store.js";
import pageLoadStore from "../../page-load/page-load.store.js";

import filterStore from "../filter.store.js";
import * as setUtils from "../../utils/set.utils.js";

import Lightpick from 'Lightpick'

const name = "filter-date"; // указать дефолтное имя декоратора

if (name === null) {
    console.error("decorator name is missing");
}

let lang = {
    ru: {
        months: ['Января', 'Февраля', 'Марта', 'Апреля', 'Майя', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
        customMonths: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        customDays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    },
    en: {
        months: ['Января', 'Февраля', 'Марта', 'Апреля', 'Майя', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
        customMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        customDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
};

const defaultOptions = {
    __namespace: "",
    name: name,
    mode: "exclude", // "include",
    container: "replaceable-filter",
    setHistory: false,
    setRoute: true,
    href: ''
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = options;
        this.handleFilters = this.handleFilters.bind(this);

        this._active = false;
    }

    init() {
        this._options = datasetToOptions(this._parent.dataset, this._options);
        this._input = this._parent.querySelector('input');

        const self = this;

        this._date = new Lightpick({
            field: this._input,
            singleDate: false,
            selectForward: true,
            firstDay: 1,
            lang: 'ru',
            hoveringTooltip: false,
            locale: {
                buttons: {
                    prev: '<svg width="8" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                        '  <path d="M7 14L1 7.5 7 1" stroke="#B9CAAD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
                        '</svg>',
                    next: '<svg width="9" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                        '  <path d="M1.5 14l6-6.5-6-6.5" stroke="#B9CAAD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
                        '</svg>'
                }
            },
            onSelect: function (start, end) {
                if (!pageLoadStore.getData().loaded) return;

                // var str = '';
                // str += start ? start.format('Do MMMM YYYY') + ' to ' : '';
                // str += end ? end.format('Do MMMM YYYY') : '...';

                if (start && (end && typeof end._i === "number")) {
                    let value = [
                        new Date(start._d).toLocaleDateString(),
                        new Date(end._d).toLocaleDateString()
                    ];

                    dispatcher.dispatch({
                        type: "search:set",
                        name: `filter.date`,
                        value: `${value[0]}~${value[1]}`,
                        history: false,
                    });


                    let address = addressbarStore.getData().href;


                    dispatcher.dispatch({
                        type: "router:route",
                        href: address,
                        transitionData: {
                            container: self._options.container,
                        },
                    });
                }
            }
        });

        this.handleFilters();

        filterStore.subscribe(this.handleFilters);
    }

    destroy() {
        filterStore.unsubscribe(this.handleFilters);
    }

    getFilterData() {
        let result = /filter\[(.+?)\]=([\d\w\/~\d\w]+)/gm.exec(this._options.href);


        if (result === null) {
            console.error(
                `cant retrieve filter data with regular expression for href="${this._options.href}"`
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
                    this._date.setDateRange(
                        x.split("~")[0], x.split("~")[1]
                    )
                }
            } else {
                this._date.setDateRange('', '');
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
