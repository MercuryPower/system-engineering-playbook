import dispatcher from './modules/dispatcher.js';
import domReady from './domReady.js';

import {bezier, css} from './config/ease.config.js';
import {time} from './config/time.config.js';
import outliner from "modules/accessibility/outliner.view.js";

import preloaderSimple from 'modules/page-load/preloader-simple.view.js';

//form
import 'modules/form/form.component.js';
import 'modules/form/form-response.component.js';
import 'modules/form/input-wrapper.component.js';
import 'modules/form/select.component.js';
import 'modules/form/form-helper.view';

import 'modules/inputs/file-input.component.js';
import 'modules/filters/date-input.component.js';

//popup
import 'modules/popup/popup.component.js';
import 'modules/popup/popup-close.component.js';
import 'modules/popup/popup-toggle.component.js';
import popupHelper from 'modules/popup-helper/popup.helper'

//slider
import 'modules/slider/slider.component';
import 'modules/slider/slider-progress.component';
import 'modules/slider/slider-control.component';

//dd
import 'modules/drop-down/drop-down.component';
import 'modules/drop-down/accordion.component';

//router
import router from 'modules/router/router.view';
import 'modules/router/page-transition.component';
import 'modules/router/inner-link.component';
import 'modules/router/load-more.component';

// filters
// import 'modules/filters/filter-link.component';
// import 'modules/filters/filter-reset.component';
// import 'modules/filters/filter-search.component';

import 'modules/filters/filter-link.component';
import 'modules/filters/filter-reset.component';
import 'modules/filters/filter-range.component';
import 'modules/filters/pagination.component';

//search
import 'modules/search/search-form.component';

//decor-maps
import 'modules/decor/maps-history.component';
import 'modules/decor/maps-geography.component';
import 'modules/decor/maps-interactive.component';


//maps
import 'modules/map/yandex-map.component';

//tabs
import 'modules/tab/tab-switch.component';
import 'modules/tab/tab-wrapper.component';

//menu
import 'modules/menu/navigation-group.component';
import 'modules/menu/navigation-group-mobile.component'
import 'modules/header/header.component';


import video from 'modules/video/video.view';

import scrollHelper from "modules/scroll-helper/scroll.helper.js";
import triggerView from "modules/trigger/trigger.view.js";
import triggerHelper from "modules/trigger-helper/trigger.helper.js";

import slider from 'modules/slider/slider.view';
import scrollShow from 'modules/scroll/scroll-show.view';

import dropdown from 'modules/drop-down/drop-down.view';

import cookie from 'modules/cookie/dislaimer.view';


domReady(function () {
    dispatcher.dispatch({
        type: 'dom:ready'
    });

    preloaderSimple.init();
    router.init();
    scrollHelper.init();
    popupHelper.init();

    slider.init();
    scrollShow.init();
    video.init();

    triggerHelper.init();
    triggerView.init();

    dropdown.init();
    cookie.init();
});
