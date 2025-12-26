import dispatcher from '../dispatcher';
import TweenMax from 'gsap/TweenMax'
let isCookie = false;

const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));

    isCookie = matches ? Boolean(decodeURIComponent(matches[1])) : undefined;

    return isCookie;
};

const setCookie = (key, value) => {
    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    let stringDate = date.toUTCString();
    document.cookie = key + '=' + value + '; path=/; expires=' + stringDate;
};

const handleTerms = function () {

    let disclaimer = document.querySelector(".j-dislaimer");
    let disclaimerBtn = document.querySelector(".j-dislaimer-ok");

    if (!disclaimer || !disclaimerBtn) return;

    if (!getCookie("visited")) {
        disclaimer.classList.remove('is-hidden');
    }

    disclaimerBtn.addEventListener('click', function (e) {
        e.preventDefault();

        TweenMax.to(disclaimer, .3, {
            opacity: 0,
            x: 25,
            onComplete: function () {
                disclaimer.classList.add('is-hidden');
            }
        });
        setCookie('visited', 'true');
    })
};

const init = function () {
    handleTerms();
};

export default {init}
