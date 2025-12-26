import dispatcher from '../dispatcher';
import resizeStore from '../resize/resize.store';
import scrollStore from '../scroll/scroll.store';
import bpStore from '../resize/breakpoint.store';
import utils from 'utils';
import SplitText from 'SplitText';
import TweenMax from "gsap/TweenMax";

let height,
    width,
    scrollTop;
let items = new Map();
let idName = 'scroll-show-id-';
let idNum = 1;
let scrollHeight;
let start;

const show = (item, delay) => {
    item.active = true;

    TweenMax.set(item.element, { className:"+=is-show", delay: delay});
};

const _handleScroll = () => {
    if (!start) return;
    scrollTop = scrollStore.getData().top;
    for (const item of items.values()) {
        if (item.vh) {
            if (scrollTop >= item.topEl - height && item.active === false) compare(item)
        } else {
            if (scrollTop >= item.topEl - height/1.1 && item.active === false) compare(item)
        }
    }
};

const compare = (item) => {
    switch (true) {
        case (item.delayD && bpStore.getData().name === 'desktop'):
            show(item, item.delayD);
            break;
        case (item.delayT && bpStore.getData().name === 'tablet'):
            show(item, item.delayT);
            break;
        case (item.delayM && bpStore.getData().name === 'mobile'):
            show(item, item.delayM);
            break;
        case (!item.delayT && item.delayM && bpStore.getData().name === 'tablet'):
            show(item, item.delayM);
            break;
        case (item.delayD && !item.delayT && !item.delayM && bpStore.getData().name === 'tablet'):
            show(item, item.delayD);
            break;
        case (item.delayD && !item.delayM && bpStore.getData().name === 'mobile'):
            show(item, item.delayD);
            break;
        default:
            show(item, 0);
    }
};

const _handleResize = () => {
    height = resizeStore.getData().height;
    width = resizeStore.getData().width;

    scrollHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );

    for (const item of items.values()) {
        item.topEl = utils.offset(item.element).top;

        if (item.split && !item.active) {
            item.split.revert();
            item.split = new SplitText(item.element, {
                type:"lines, words",
                // charsClass: "scroll-char",
                wordsClass: "scroll-word",
                linesClass: "scroll-line"
            });
            let lines = item.split.lines;
            let delay = 0;
            for (const line of lines) {
                let words = Array.from(line.querySelectorAll('.scroll-word'));
                for (const word of words) {
                    word.style.transition = `transform 1.2s cubic-bezier(.4,0,0,1) ${delay}s`;
                }
                delay += 0.15;
            }
        } else if (item.split && item.active) {
            item.split.revert();
        }
    }
    _handleScroll();
};

const _add = (items, element) => {
    let id = element.dataset.scrollshow;
    let active = false;
    let delayD = element.dataset.delayd;
    let delayT = element.dataset.delayt;
    let delayM = element.dataset.delaym;
    let vh = element.dataset.vh;
    let text = element.dataset.text;
    let split;
    if (element.dataset.text) {

        split = new SplitText(element, {
            type:"lines, words",
            // charsClass: "scroll-char",
            wordsClass: "scroll-word",
            linesClass: "scroll-line"
        })
    }

    if (!id) {
        id = idName + idNum;
        idNum++;
    }

    items.set(id, { id, element, active, delayD, delayT, delayM, vh, split, text });
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

    const elements = Array.from(document.querySelectorAll('.js-scroll-block'));
    for (const element of elements) {
        check(items, element);
    }
    for (const item of items.values()) {
        backCheck(items, item, elements)
    }
};

const init = () => {
    _handleMutate();
    _handleResize();

    resizeStore.subscribe(_handleResize);
    scrollStore.subscribe(_handleScroll);

    dispatcher.subscribe((e) => {
        if (e.type === 'dom:ready') {
            start = true;
            _handleMutate();
            _handleResize();
        }
        if (e.type === 'show-init') {
            start = true;
            _handleScroll();
        }
    });

    dispatcher.dispatch({
        type: 'show-init'
    });
};

export default { init }
