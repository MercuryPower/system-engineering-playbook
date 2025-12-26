import dispatcher from '../dispatcher.js';
import {datasetToOptions} from '../utils/component.utils.js';
import mapStore from "./map.store.js";

const decorators = [];

const defaultOptions = {
    __namespace: '',
    lat: 0,
    lng: 0,
    zoom: 12,
    key: "AIzaSyCIuYnYUScrpSJwCMtCUKM-9yVn8wT_QoM",
    containerClass: "container",
    markerClass: "marker",
    type: "roadmap",
    background: "#dfdfdf",
    markerIco: "/static/map/marker.svg",
    markerSize: [41, 58]
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

        this._container = this.getElementsByClassName(this._options.containerClass)[0];

        this._markerElements = Array.prototype.slice.call(this.getElementsByClassName(this._options.markerClass));

        this._mode = this._options.mode;

        if (!window._googleLoaderReady) {
            window._googleLoaderReady = () => {
                window.google.load("maps", "3", {
                    callback: () => {
                        dispatcher.dispatch({
                            type: "map:apiLoaded"
                        })
                    },
                    other_params: `key=${this._options.key}&language=${lang}`
                });
            }
        }

        if (window.google && window.google.maps) {
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

            this._map.setMapTypeId(this._mode);
        }
    }

    loadAPI() {
        if (loadApi) return;

        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://www.google.com/jsapi?key=${this._options.key}&callback=_googleLoaderReady`;
        script.setAttribute('async', '');
        document.body.appendChild(script);

        loadApi = true;
    }

    buildMap() {
        if (this._laoded) return;
        this._laoded = true;

        let config = {
            zoom: this._options.zoom,
            scrollwheel: false,
            disableDefaultUI: true,
            center: new google.maps.LatLng(this._options.lat, this._options.lng),
            mapTypeId: this._options.mode
        }

        this._map = new google.maps.Map(this._container, config);
        if (styles) {
            this._map.setOptions({styles: styles});
        }

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

        let ico = {
            url: this._options.markerIco,
            size: new google.maps.Size(markerSize[0], markerSize[1]),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(markerSize[0] / 2, markerSize[1]),
            scaledSize: new google.maps.Size(markerSize[0], markerSize[1]),
            // labelOrigin: new google.maps.Point(100, 100),
        };

        let latLng = new google.maps.LatLng(lat, lng);

        let marker = new google.maps.Marker({
            position: latLng,
            map: this._map,
            icon: ico,
            title: title,
        });

        let element = this._container;

        this._markers.push(marker);
    }
}

customElements.define('map-component', ElementClass);

export default ElementClass;
