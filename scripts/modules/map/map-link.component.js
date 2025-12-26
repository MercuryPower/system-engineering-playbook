import dispatcher from 'dispatcher.js';

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
        return 'iOS';
    } else if (userAgent.match(/Android/i)) {
        return 'Android';
    } else {
        return 'unknown';
    }
}

class ElementClass extends HTMLAnchorElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
    }

    connectedCallback() {
        var lat = this.getAttribute('data-lat') || 0;
        var lng = this.getAttribute('data-lng') || 0;
        var operatingSystem = getMobileOperatingSystem();

        this._id = this.getAttribute('data-id');
        this._lat = lat;
        this._lng = lng;

        if (operatingSystem.toLowerCase() === 'android') {
            this.setAttribute('href', 'https://maps.google.com/?q=' + lat + ',' + lng);
        } else if (operatingSystem.toLowerCase() === 'ios') {
            this.setAttribute('href', 'https://maps.apple.com/?q=' + lat + ',' + lng);
        } else {
            this.setAttribute('href', 'https://maps.google.com/?q=' + lat + ',' + lng);
        }
    }

    disconnectedCallback() {

    }
}

customElements.define('map-link', ElementClass, {
    extends: 'a'
});

export default ElementClass;
