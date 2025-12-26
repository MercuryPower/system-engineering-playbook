import dispatcher from '../dispatcher';
import Swiper from 'swiper';
import {TweenMax, TimelineMax} from 'gsap';

const items = new Map();
let idName = 'slider-id-';
let idNum = 1;

const interleaveOffset = 0.5;

const settings = {
    speed: 700,
    slidesPerView: 'auto',
    grabCursor: true,
    mousewheel: false,

    slideActiveClass: 'active'
};


const _handleChange = () => {
    for (const item of items.values()) {

        let btnsNext = Array.from(document.querySelectorAll('.js-slider-control-next'));

        for (const btnNext of btnsNext) {
            if (btnNext.dataset.slider === item.id) {
                item.btnNext = btnNext;
                break;
            }
        }

        let btnsPrev = Array.from(document.querySelectorAll('.js-slider-control-prev'));
        for (const btnPrev of btnsPrev) {
            if (btnPrev.dataset.slider === item.id) {
                item.btnPrev = btnPrev;
                break;
            }
        }

        let progress = Array.from(document.querySelectorAll('.js-slider-progress'));
        for (const prog of progress) {
            if (prog.dataset.slider === item.id) {
                item.prog = prog;
                break;
            }
        }
        if (item.id.indexOf('information-slider') !== -1) {
            item.settings = {
                spaceBetween: 16,
                slidesPerView: item.perView,

                pagination: {
                    el: item.prog,
                    type: 'progressbar',
                },

                navigation: {
                    prevEl: item.btnPrev,
                    nextEl: item.btnNext
                },
                breakpoints: {
                    0: {
                        spaceBetween: 0,
                        slidesPerView: 1
                    },
                    640: {
                        spaceBetween: 16,
                        slidesPerView: 2
                    },
                    960: {
                        spaceBetween: 16,
                        slidesPerView: item.perView
                    }
                },
                on: {
                    resize: function () {
                        this.update();
                    }
                }
            };

            item.slider = new Swiper(item.element, {...settings, ...item.settings});
        } else if (item.id === "photos-slider") {
            let thumbsEl = document.querySelector(`${item.thumbs}[data-slider="${item.id}"]`)

            let thumbsSlider = new Swiper(thumbsEl, {
                slidesPerView: 6,
                spaceBetween: 26,
                grabCursor: true,
                breakpoints: {
                    0: {
                        spaceBetween: 16,
                        slidesPerView: 3
                    },
                    640: {
                        spaceBetween: 18,
                        slidesPerView: 4
                    }
                },

                on: {
                    resize: function () {
                        this.update();
                    }
                }
            });

            item.settings = {
                slidesPerView: 1,

                pagination: {
                    el: item.prog,
                    type: 'progressbar',
                },

                navigation: {
                    prevEl: item.btnPrev,
                    nextEl: item.btnNext
                },

                thumbs: {
                    swiper: thumbsSlider
                },

                on: {
                    resize: function () {
                        this.update();
                    }
                }
            };

            item.slider = new Swiper(item.element, {...settings, ...item.settings});
        }
    }
};

const _add = (items, element) => {
    let id = element.dataset.slider;
    let perView = +element.dataset.perView || 3;
    let tl = null;
    let thumbs = element.dataset.thumbs || false;

    if (!id) {
        id = idName + idNum;
        idNum++;
    }

    items.set(id, {id, element, tl, thumbs, perView});
};

const _handleMutate = () => {
    const check = (items, element) => {
        for (const item of items.values()) {
            if (item.element === element) return;
        }
        _add(items, element);
    };

    const backCheck = (items, item, elements) => {
        for (const element of elements) {
            if (element === item.element) return;
        }
        items.delete(item.id);
    };

    const elements = Array.from(document.querySelectorAll('.js-slider'));
    for (const element of elements) {
        check(items, element);
    }
    for (const item of items.values()) {
        backCheck(items, item, elements)
    }
};


const init = () => {
    _handleMutate();
    _handleChange();

    dispatcher.subscribe((e) => {

        if (e.type === 'dom:ready') {
            _handleMutate();
            _handleChange();
        }

        if (
            e.type === 'popup:toggle' &&
            e.id === 'popup-photos'
        ) {
            items.get('photos-slider').slider.slideTo(e.sliderTo, 0);
        }
    })
};


export default {init}
