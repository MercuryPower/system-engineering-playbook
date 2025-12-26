import dispatcher from '../dispatcher';
import formStore from './form.store.js';

let _removeElementError = function (id) {
    let form = document.querySelector(`form[data-id=${id}]`);
    let showErrors = [...form.querySelectorAll('.errors')];

    if (showErrors.length > 0) {

        showErrors.forEach((element) => {
            let parent = element.parentElement;

            parent.removeChild(element);
        })
    }
};

let _init = function () {
    dispatcher.subscribe((e) => {
        if (e.type === 'form:reset') {
            _removeElementError(e.id)
        }
    })
}

_init()

export default {};
