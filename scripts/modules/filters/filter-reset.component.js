import dispatcher from "../dispatcher.js";
import { datasetToOptions } from "../utils/component.utils.js";
import filterStore from "./filter.store.js";
import addressbarStore from "../addressbar/addressbar.store";

const decorators = [];

const defaultOptions = {
    __namespace: "",
    names: [],
    container: ''
};

class ElementClass extends HTMLButtonElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this.handleClick = this.handleClick.bind(this);
    }

    connectedCallback() {
        this._options = datasetToOptions(this.dataset, defaultOptions);

        this.addEventListener("click", this.handleClick);
        // code goes here
        decorators.forEach((d) => d.attach(this, this._options));
    }

    disconnectedCallback() {
        // code goes here
        decorators.forEach((d) => d.detach(this, this._options));
    }

    handleClick() {
        this._options.names.forEach((name) => {
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

        dispatcher.dispatch({ type: "pagination:reset" });
        dispatcher.dispatch({ type: "search:reset" });

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

customElements.define("filters-reset", ElementClass, {
    extends: "button",
});

export default ElementClass;
