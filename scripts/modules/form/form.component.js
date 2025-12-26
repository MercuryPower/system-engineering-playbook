import dispatcher from '../dispatcher';
import formStore from './form.store.js';
import http from '../utils/HTTP';

let idName = 'form-';
let idNum = 0;

let _handleStore = function () {
    let storeData = formStore.getData().items[this._id];

    if (!storeData) return;
    if (storeData.status === this._status) return;

    this._status = storeData.status;
    this.classList.remove('waiting');
    this.classList.remove('sending');
    this.classList.remove('submitted');
    this.classList.add(this._status);
};

let _handleDispatcher = function (e) {
    if (e.type === 'popup:close-all') {
        let isTrigger = true;
        _removeElementError(this, isTrigger);
    }
};

let _removeElementError = function (form, trigger) {
    let showErrors = [...form.querySelectorAll('.errors')];

    if (showErrors.length > 0) {

        if (trigger) {
            dispatcher.dispatch({
                type: 'form:reset',
                id: form._id
            });
        }

        showErrors.forEach((element) => {
            let parent = element.parentElement;

            parent.removeChild(element);
        })
    }
};

let _checkForAppendElement = function (parentElement, element, errors) {
    let div = document.createElement('div');
    div.classList.add('errors');

    errors.forEach((err) => {
        let p = document.createElement('p');
        console.log(err);
        p.classList.add('item');
        p.innerHTML = err;

        div.appendChild(p)
    });

    parentElement.appendChild(div);
};

let _appendElementError = function (form, errors) {
    for (let key in errors) {
        let elementError = form.querySelector(`[name=${key}]`) || false;
        let nodeName = elementError.nodeName ? elementError.nodeName : false;


        if (nodeName === 'INPUT') {
            let formLine = elementError.parentElement.parentElement;

            if (elementError.type === 'file') {
                formLine = elementError.parentElement.parentElement;
            }

            _checkForAppendElement(formLine, elementError, errors[key]);

        } else if (nodeName === 'SELECT') {

            let formLine = elementError.parentElement.parentElement.parentElement;
            _checkForAppendElement(formLine, elementError, errors[key]);

        } else if (nodeName === 'TEXTAREA') {

            let formLine = elementError.parentElement.parentElement;
            _checkForAppendElement(formLine, elementError, errors[key]);

        }

    }
};

let _handleError = function (self, errors) {
    let form = self;

    _removeElementError(form);
    _appendElementError(form, errors)
};

let _handleSubmit = function (e) {
    let data;
    let action = this.action;
    let invalidInput;
    let self = this;

    if (!FormData) return;

    e.preventDefault();

    this.validate();

    if (this._status !== 'waiting') {
        return;
    }

    dispatcher.dispatch({
        type: 'form:validate',
        id: this._id
    });

    if (!this._valid) {
        invalidInput = this.querySelector('label[is="input-wrapper"].error');
        if (invalidInput) {
            invalidInput = invalidInput.querySelector('input, textarea');
            invalidInput.focus();
        }
        return;
    }

    let inputs = this.querySelectorAll('input, textarea');

    data = new FormData();
    data.append('ajax', true);

    inputs.forEach((input) => {
        if (input.type === 'file') {
            input._filesToUpload.forEach(( { file } ) => {
                data.append(input.name, file)
            })
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked) {
                data.append(input.name, input.value)
            }
        } else {
            data.append(input.name, input.value)
        }
    })

    dispatcher.dispatch({
        type: 'form:send',
        id: this._id
    });

    http(action)[this._method](data).then(function (response) {
        let json = JSON.parse(response);

        dispatcher.dispatch({
            type: 'form:submit',
            id: self._id,
            response: json
        });

        if (json.hasOwnProperty('status') && json.status === 'success') {
            self.classList.add('hidden');

            dispatcher.dispatch({
                type: 'form:response',
                response: json,
                form: self,
                id: self._id
            });

        } else if (!json.hasOwnProperty('status') || json.status === 'error' || json.status === 'success-reset') {
            let errors = json.response;

            _handleError(self, errors);

            dispatcher.dispatch({
                type: 'form:error',
                id: self._id
            });
        }
    }, function (reject) {
        console.warn('Error ' + reject);
    });
};

let _validate = function () {
    this._valid = true;
};

let _invalidate = function () {
    this._valid = false;
};

class ElementClass extends HTMLFormElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this._status = null;
        this._valid = true;

        this.handleSubmit = _handleSubmit.bind(this);
        this.handleStore = _handleStore.bind(this);
        this.validate = _validate.bind(this);
        this.invalidate = _invalidate.bind(this);
        this.handleDispatcher = _handleDispatcher.bind(this);
        this.removeElementError = _removeElementError.bind(this);
    }

    connectedCallback() {
        this._id = this.getAttribute('data-id');
        this._method = this.getAttribute('method');

        if (!this._method) {
            this._method = 'post';
        }

        if (!this._id) {
            idNum++;
            this._id = idName + idNum;
            this.setAttribute('data-id', this._id);
        }

        dispatcher.dispatch({
            type: 'form:add',
            id: this._id
        });

        this.handleStore();

        this.addEventListener('submit', this.handleSubmit);
        formStore.subscribe(this.handleStore);
        dispatcher.subscribe(this.handleDispatcher);
    }

    disconnectedCallback() {
        dispatcher.dispatch({
            type: 'form:remove',
            id: this._id
        });

        this.removeEventListener('submit', this.handleSubmit);
        formStore.unsubscribe(this.handleStore);
        dispatcher.unsubscribe(this.handleDispatcher);
    }
}

customElements.define('form-component', ElementClass, {extends: 'form'});

export default ElementClass;
