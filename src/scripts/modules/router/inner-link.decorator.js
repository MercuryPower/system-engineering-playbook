import { attach, detach } from "../utils/decorator.utils.js";
import dispatcher from "../dispatcher.js";
import routerStore from "../router/router.store.js";
import addressStore from "../addressbar/addressbar.store.js";
import { datasetToOptions } from "../utils/component.utils.js";

const name = "link"; // указать дефолтное имя декоратора

const defaultOptions = {
    __namespace: "link",
    name: name,
    container: "replaceable",
    outer: false,
    setStore: true,
    setHistory: true,
    setClasses: true,
    mode: "replace",
    target: "",
    type: "",
    animation: "basic-transition"
};

function parts(href) {
    let url = href
        ? href.split("#")[0]
            ? href.split("#")[0].split("?")[0]
            : ""
        : undefined;
    let hash = href
        ? href.split("#")[1]
            ? href.split("#")[1].split("?")[0]
            : ""
        : undefined;
    let query = href
        ? href.split("?")[1]
            ? href.split("?")[1].split("#")[0]
            : ""
        : undefined;

    return {
        url: url,
        hash: hash,
        query: query,
    };
}

let getIEVersion = function () {
    let rv = -1;
    if (navigator.appName == "Microsoft Internet Explorer") {
        let ua = navigator.userAgent;
        let re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
        if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
    }
    return rv;
};

const ie = getIEVersion();

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);

        this.handleClick = this.handleClick.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
        this.handleRouterStore = this.handleRouterStore.bind(this);
        this.handleDispatcher = this.handleDispatcher.bind(this);
    }

    init() {
        this._options = datasetToOptions(this._parent.dataset, this._options);

        if (!this._options.outer) {
            this._parent.addEventListener("click", this.handleClick);
        }

        dispatcher.subscribe(this.handleDispatcher);

        if (this._options.setClasses) {
            this.handleRouterStore();
            this.handleHashChange();

            addressStore.subscribe(this.handleHashChange);
            routerStore.subscribe(this.handleRouterStore);
        }
    }

    destroy() {
        if (this._options.setClasses) {
            addressStore.unsubscribe(this.handleHashChange);
            routerStore.unsubscribe(this.handleRouterStore);
        }

        dispatcher.unsubscribe(this.handleDispatcher);
    }

    handleClick(e) {
        let href = routerStore.getData().page.href;
        let target = this._parent.getAttribute("data-target");

        if (target) {
            target = this._parent.querySelector(target);
            if (!target) target = this;
        } else {
            target = this._parent;
        }

        if (ie > -1 && ie < 11) {
            return;
        }

        e.preventDefault();


        if (
            parts(href).url === parts(this._parent.href).url &&
            parts(href).query === parts(this._parent.href).query
        ) {
            if (addressStore.getData().hash !== parts(this._parent.href).hash) {
                // hash scroll
                dispatcher.dispatch({
                    type: "scroll:to",
                    hash: parts(this._parent.href).hash,
                });
            }
        } else {
            // routing

            dispatcher.dispatch({
                type: "router:route",
                href: this._parent.href,
                setHistory: this._options.setHistory,
                setStore: this._options.setStore,
                transitionData: {
                    animation: this._options.animation,
                    url: href,
                    container: this._options.container,
                    hash: parts(this._parent.href).hash || null,
                    element: target,
                    originalElement: this._parent,
                    mode: this._options.mode
                },
            });
        }
    }

    handleHashChange() {
        let url = parts(this._parent.href).url;
        let baseUrl = this._parent.getAttribute("data-root")
            ? location.origin + this._parent.getAttribute("data-root")
            : url.lastIndexOf(".html") !== -1
            ? url.substring(0, url.lastIndexOf(".html"))
            : url.lastIndexOf(".php") !== -1
            ? url.substring(0, url.lastIndexOf(".php"))
            : url;

        if (parts(location.href).url.indexOf(baseUrl) === 0) {
            this._parent.classList.add("child-active");
        } else {
            this._parent.classList.remove("child-active");
        }

        if (this._parent.href === location.href) {
            this._parent.classList.add("exact-active");
        } else {
            this._parent.classList.remove("exact-active");
        }

        this._parent.dispatchEvent(new Event("change"));
    }

    handleRouterStore() {
        let href = routerStore.getData().page.href;
        let hash = addressStore.getData().hash;

        if (parts(href).url === parts(this._parent.href).url) {
            this._parent.setAttribute("aria-current", "page");
            this._active = true;

            this._parent.classList.add("active");
        } else {
            this._parent.removeAttribute("aria-current");
            this._active = false;

            this._parent.classList.remove("active");
        }

        this._parent.dispatchEvent(new Event("change"));

        // dispatcher.dispatch({ type: "inner-link:active-changed" });
    }

    handleDispatcher(e) {
        if (e.type === "hash:change" && this._options.setClasses) {
            this.handleHashChange();
        }

        if (e.type === "inner-link:force-check" && this._options.setClasses) {
            if (e.element) {
                if (e.element === this._parent) {
                    this.handleRouterStore();
                    this.handleHashChange();
                }
            } else {
                this.handleRouterStore();
                this.handleHashChange();
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
};
