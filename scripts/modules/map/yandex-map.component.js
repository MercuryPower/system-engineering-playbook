import dispatcher from '../dispatcher.js';
import {datasetToOptions} from '../utils/component.utils.js';
import mapStore from "./map.store.js";

const decorators = [];

const defaultOptions = {
    __namespace: '',
    lat: 0,
    lng: 0,
    zoom: 12,
    key: "1e25cbec-8d7e-4aff-9951-8321c5747b0c",
    containerClass: "container",
    markerClass: "marker",
    type: "roadmap",
    background: "#dfdfdf",
    markerIco: "/static/map/pin.svg",
    markerSize: [40, 60]
};

const styles = null;
let loadApi = false;

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this.buildMap = this.buildMap.bind(this);
        this.handleMapStore = this.handleMapStore.bind(this);
        this.addMarker = this.addMarker.bind(this);

        this._laoded = false;
        this._markers = [];
    }

    connectedCallback() {
        this._options = datasetToOptions(this.dataset, defaultOptions);

        const lang = document.documentElement.getAttribute('lang');

        this._lang = lang;

        this._container = this.getElementsByClassName(this._options.containerClass)[0];

        this._markerElements = Array.prototype.slice.call(this.getElementsByClassName(this._options.markerClass));

        this._mode = this._options.mode;

        if (!window._yandexLoaderReady) {
            window._yandexLoaderReady = () => {

                window.ymaps.ready(() => {
                    dispatcher.dispatch({
                        type: "map:apiLoaded"
                    });
                })

            }
        }

        if (window.ymaps && window.ymaps.map) {
            this.buildMap();
        } else {
            this.loadAPI();
        }


        if (!this._container) {
            console.error(`element with class ${this._options.containerClass} was not found in map container`);
            return;
        }

        mapStore.subscribe(this.handleMapStore);

        decorators.forEach((d) => d.attach(this, this._options));
    }

    disconnectedCallback() {
        mapStore.unsubscribe(this.handleMapStore);
    }

    handleGoogleStore() {
    }

    handleMapStore() {
        let loaded = mapStore.getData().apiLoaded;
        if (loaded && !this._laoded) {
            this.buildMap();
        }

        if (mapStore.getData().mode !== this._mode) {
            this._mode = mapStore.getData().mode;
        }
    }

    loadAPI() {
        if (loadApi) return;

        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://api-maps.yandex.ru/2.1/?lang=${this._lang}&${this._options.key}&onload=_yandexLoaderReady&mode=debug`;
        script.setAttribute('async', '');
        document.body.appendChild(script);

        loadApi = true;
    }

    buildMap() {
        if (this._laoded) return;
        this._laoded = true;

        let config = {
            center: [this._options.lat, this._options.lng],
            zoom: this._options.zoom,
            controls: ['zoomControl', 'fullscreenControl']
        };

        this._map = new ymaps.Map(this._container, config);

        this._container.style.background = this._options.background;

        if (this._markerElements) {
            this._markerElements.forEach((m, i) => {
                this.addMarker(m, i);
            });
        }
    }

    addMarker(m, i) {
        let lat = m.getAttribute('data-lat');
        let lng = m.getAttribute('data-lng');
        let title = m.getAttribute('data-title');

        if (!lat || !lng) {
            console.warn('marker lat or/and lng is missing');
        }

        let markerSize = this._options.markerSize;

        console.log();

        let marker = new ymaps.Placemark([lat, lng], null, {
            iconLayout: 'default#image',
            iconImageHref: this._options.markerIco,
            iconImageSize: [markerSize[0], markerSize[1]],
        });

        this._map.geoObjects.add(marker);

        this._markers.push(marker);
    }
}

customElements.define('map-component', ElementClass);

export default ElementClass;
