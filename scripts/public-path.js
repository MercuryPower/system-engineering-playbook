var src = document.querySelector('[src*="app"]').getAttribute("src");
__webpack_public_path__ = src.substr(0, src.lastIndexOf("/") + 1);

var modernBrowser = (
    'fetch' in window &&
    'assign' in Object
);

if ( !modernBrowser ) {
    var scriptElement = document.createElement('script');

    scriptElement.async = false;
    scriptElement.src = './polyfills.js';
    document.head.appendChild(scriptElement);
}