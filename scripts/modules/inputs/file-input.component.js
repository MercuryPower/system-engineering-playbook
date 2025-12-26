import dispatcher from '../dispatcher';

let _indexRemove = 0;

let _getData = function () {
    return {
        value: this.value,
    }
}

let _handleDrop = function (e) {
    let files = [];
    e.preventDefault();

    if (!e.dataTransfer) return;

    if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            if (e.dataTransfer.items[i].kind === 'file') {
                files.push(e.dataTransfer.items[i].getAsFile());
            }
        }
    } else {
        files = e.dataTransfer.files;
    }

    this._input.files = e.dataTransfer.files;

    if (e.dataTransfer.items) {
        e.dataTransfer.items.clear();
    } else {
        e.dataTransfer.clear();
    }

    this.classList.remove('drag');
    this._input.focus();
}

let _handleOver = function (e) {
    e.preventDefault();

    if (!this.classList.contains('drag')) {
        this.classList.add('drag');
    }
}

let _handleOut = function () {
    this.classList.remove('drag');
}

let _createFile = function (item, index) {
    let fileWr = document.createElement('div');
    let fileIco = document.createElement('div');
    let fileName = document.createElement('p');
    let fileDelete = document.createElement('div');

    fileWr.setAttribute('class', 'file-data');
    fileIco.setAttribute('class', 'ico');
    fileDelete.setAttribute('class', 'remove ico-close s');

    fileIco.style.background = `url("data:image/svg+xml,%3Csvg width='12' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M.5 2A1.5 1.5 0 012 .5h5.788L11.5 4.35V14a1.5 1.5 0 01-1.5 1.5H2A1.5 1.5 0 01.5 14V2z' stroke='%234E8925' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;
    fileName.innerHTML = item.name;

    fileWr.appendChild(fileIco);
    fileWr.appendChild(fileName);
    fileWr.appendChild(fileDelete);

    fileDelete.addEventListener('click', this.remove);

    fileWr._index = +index;
    return fileWr;
};

let _handleChange = function () {
    let files = this._input.files;

    files = Object.values(this._input.files);



    if (files && files.length) {
        this.classList.add('not-empty');

        if (this._input.multiple) {

            for (let key in files) {
                let file = this.createFile(files[key], this._index);
                this._text.appendChild(file);

                this._input._filesToUpload.push({
                    id: this._index++,
                    elDOM: file,
                    file: files[key]
                })
            }
        } else {
            this._text.innerHTML = '';

            let file = this.createFile(files[0], 0);
            this._text.appendChild(file);

            this._input._filesToUpload.push({
                id: this._index++,
                elDOM: file,
                file: files[0]
            })
        }
    } else {
        this.classList.remove('not-empty');
        this._text.innerHTML = '';
        this._input._filesToUpload = [];
    }
}

let _remove = function (e) {
    let event = new Event('change');
    e.stopPropagation();
    e.preventDefault();

    _indexRemove = e.target.parentElement._index;

    this._input._filesToUpload.filter(({file, id, elDOM}, index) => {

        if(id === _indexRemove) {
            this._input._filesToUpload.splice(index, 1);

            elDOM.parentElement.removeChild(elDOM);
        }

    })

    if (!this._input.multiple) {
        this._input.type = '';
        this._input.type = 'file';
        this._input.dispatchEvent(event);
    }
}

let _resetInput = function () {
    let event = new Event('change');

    this._input.type = '';
    this._input.type = 'file';
    this._input.dispatchEvent(event);
}

class ElementClass extends HTMLLabelElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this._index = 0;

        this.getData = _getData.bind(this);
        this.handleDrop = _handleDrop.bind(this);
        this.handleOver = _handleOver.bind(this);
        this.handleOut = _handleOut.bind(this);
        this.handleChange = _handleChange.bind(this);
        this.createFile = _createFile.bind(this);

        this.remove = _remove.bind(this);
        this.resetInput = _resetInput.bind(this);
        this.handleDispatcher = this.handleDispatcher.bind(this);
    }

    connectedCallback() {
        this._text = this.getElementsByClassName('files-data')[0];
        this._input = this.getElementsByTagName('input')[0];
        this._remove = this.getElementsByClassName('remove')[0];

        this._input._filesToUpload = [];

        if (this._input.multiple) {
            this.classList.add('multiple');
        }

        this._input.addEventListener('change', this.handleChange);

        this.addEventListener('drop', this.handleDrop);
        this.addEventListener('dragover', this.handleOver);
        this.addEventListener('mouseleave', this.handleOut);

        if (this._remove) {
            this._remove.addEventListener('click', this.remove);
        }

        dispatcher.subscribe(this.handleDispatcher);
    }

    disconnectedCallback() {
        this._input.removeEventListener('change', this.handleChange);
        this.removeEventListener('drop', this.handleDrop);
        this.removeEventListener('dragover', this.handleOver);
        this.removeEventListener('mouseleave', this.handleOut);

        if (this._remove) {
            this._remove.addEventListener('click', this.remove);
        }

        dispatcher.unsubscribe(this.handleDispatcher);
    }

    handleDispatcher(e) {
        if(e.type === 'form:reset') {
            this.resetInput();
        }
    }
}

customElements.define('file-input', ElementClass, {extends: 'label'});

export default ElementClass;
