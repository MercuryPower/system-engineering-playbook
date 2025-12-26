import dispatcher from "../dispatcher.js";
import {datasetToOptions} from "../utils/component.utils.js";
import addressbarStore from "../addressbar/addressbar.store";
import filterStore from "../filters/filter.store.js";

const decorators = [];

const defaultOptions = {
    __namespace: "",
    container: '',
    property: 'search'
};


class ElementClass extends HTMLFormElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDispatcher = this.handleDispatcher.bind(this);
    }

    connectedCallback() {
        this._options = datasetToOptions(this.dataset, defaultOptions);

        // code goes here
        decorators.forEach((d) => d.attach(this, this._options));

        this._input = this.getElementsByTagName("input")[0];

        this.addEventListener("submit", this.handleSubmit);
        dispatcher.subscribe(this.handleDispatcher);
    }

    disconnectedCallback() {
        // code goes here
        decorators.forEach((d) => d.detach(this, this._options));
        dispatcher.unsubscribe(this.handleDispatcher);
    }

    handleDispatcher(e) {
        if (e.type === 'search:reset') {
            dispatcher.dispatch({
                type: 'search:set',
                name: this._options.property,
                history: false
            });

            this._input.value = '';
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        if (!this._input.value) return;

        let filterData = filterStore.getData().filter;

        for (let name in filterData) {
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
        }

        dispatcher.dispatch({
            type: "search:set",
            name: `search`,
            value: this._input.value,
            history: false,
        });

        dispatcher.dispatch({ type: "pagination:reset" });

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

customElements.define("search-form", ElementClass, {
    extends: "form",
});

export default ElementClass;
