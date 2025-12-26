import dispatcher from "../dispatcher";
import TweenMax from 'gsap/TweenMax'

let lastActive = {
    status: false,
    element: null
};

let KeyboardHandler = function (component) {
    this.component = component;

    this.onKeyDown = function (e) {
        let keyCode = e.keyCode || e.which;
        let component = this.component;
        let cnt = 0;

        if (keyCode === 40 || keyCode === 34) { // down
            e.preventDefault();

            component._index++;
            if (component._index >= component._options.length) {
                component._index = 0;
            }

            while (component._options[component._index].disabled
            && cnt <= component._options.length) {
                cnt++;

                component._index++;
                if (component._index >= component._options.length) {
                    component._index = 0;
                }
            }

            component.setValue(component._items[component._index].value, true);
        } else if (keyCode === 38 || keyCode === 33) { // up
            e.preventDefault();

            component._index--;
            if (component._index < 0) {
                component._index = component._options.length - 1;
            }

            while (component._options[component._index].disabled
            && cnt <= component._options.length) {
                cnt++;

                component._index--;
                if (component._index < 0) {
                    component._index = component._options.length - 1;
                }
            }

            component.setValue(component._items[component._index].value, true);
        } else if (keyCode === 27) { // esc
            e.preventDefault();
            component.close();
        } else if (keyCode === 13) { // enter
            e.preventDefault();
            e.stopPropagation();
            component.close();
        }
    }.bind(this);

    this.set = function () {
        document.addEventListener('keydown', this.onKeyDown);
    }.bind(this);
    this.remove = function () {
        document.removeEventListener('keydown', this.onKeyDown);
    }.bind(this);
}

let _setValue = function (value, noEvent) {
    let item;
    let event;

    this._items.forEach(function (i) {
        if (i.value === value) {
            item = i;
        }
    });

    this._value = item.value;
    this._valueElement.innerHTML = item.text;
    this._selectElement.value = item.value;

    if (this._activeItem) {
        this._activeItem.element.classList.remove('active');
    }

    this._activeItem = item;
    this._activeItem.element.classList.add('active');

    if (!noEvent) {
        this._previousValue = value;

        event = new Event('change');
        this.dispatchEvent(event);
    }
}

let _getData = function () {
    return {
        value: this._activeItem.value,
        default: this._defaultValue
    }
};

let _setRestricts = function () {
    let self = this;
    Array.prototype.forEach.call(this._options, function (op, index) {
        if (op.disabled) {
            self._items[index].disabled = true;
            self._items[index].element.classList.add('disabled');
        } else {
            self._items[index].disabled = false;
            self._items[index].element.classList.remove('disabled');
        }
    })
}

let _open = function () {
    let event = new Event('open');
    let self = this;

    if (this._expanded) return;

    this._expanded = true;
    this.classList.add('active');

    if (lastActive.status) {
        lastActive.element.close();
    }

    TweenMax.killTweensOf(this._selectWrapper);
    TweenMax.to(this._selectWrapper, this._openSpeed, {
        height: this._inner.clientHeight,
        ease: Power1.easeInOut,
        onComplete: function () {
            self._inner.style.height = 'auto';
        }
    });

    lastActive.status = true;
    lastActive.element = this;

    this.keyboardHandler.set();

    this.dispatchEvent(event);
}

let _close = function () {
    let event = new Event('close');
    if (!this._expanded) return;

    this._expanded = false;
    this.classList.remove('active');

    TweenMax.killTweensOf(this._selectWrapper);
    TweenMax.to(this._selectWrapper, this._closeSpeed, {
        height: 0,
        ease: Power1.easeInOut
    });

    lastActive.status = false;
    lastActive.element = null;

    this.keyboardHandler.remove();

    this.dispatchEvent(event);

    if (this._previousValue !== this._value) { // was set by moving keyboard
        this.setValue(this._value);
    }
}

let _reset = function () {
    let value = this._options[0].value;
    this._valueElement.innerHTML = this._text;
    this.setValue(value);
}

let _handleDispatcher = function (e) {
    if (e.type === 'form:reset') {
        this.reset();
    }
};

let _filterOption = function () {
    let activeItem = this._activeItem;
    let filterName = activeItem.id.toLowerCase();
    let child = this._child;
    let start = false;

    Array.prototype.forEach.call(child._options, function (op, index) {
        if (child._items[index].id.toLowerCase() !== filterName) {
            op.disabled = true;
        } else {
            op.disabled = false;

            if (!start) {
                child.setValue(child._items[index].value);
            }

            start = true;
        }
    });

    child.setRestricts();
};

document.addEventListener('click', function (event) {
    let target = event.target;

    if (!lastActive.status) return;

    if (target.classList.contains('select-component')
        || target.closest('.select-button')
        || target.closest('.select-select')
        || target.closest('.select-inner')
        || target.closest('.select-item')) {
    } else {
        lastActive.status = false;
        lastActive.element.close();
    }

});

class ElementClass extends HTMLElement {
    constructor(self) {
        self = super(self);
        self.init.call(self);
    }

    init() {
        this._expanded = false;
        this._activeItem = null

        this.filterOption = _filterOption.bind(this);

        this.open = _open.bind(this);
        this.close = _close.bind(this);
        this.reset = _reset.bind(this);
        this.getData = _getData.bind(this);
        this.setValue = _setValue.bind(this);
        this.setRestricts = _setRestricts.bind(this);
        this.keyboardHandler = new KeyboardHandler(this);
        this.handleDispatcher = _handleDispatcher.bind(this);
    }

    connectedCallback() {
        let self = this;

        this._selectElement = this.getElementsByTagName('select')[0];
        this._selectWrapper = this.getElementsByClassName('select-select')[0];
        this._inner = this.getElementsByClassName('select-inner')[0];
        if (!this._inner) {
            this._inner = this._selectWrapper;
        }
        this._buttonElement = this.getElementsByClassName('select-button')[0];
        this._valueElement = this.getElementsByClassName('select-value')[0];
        this._options = this._selectElement.getElementsByTagName('option');

        this._parent = this.getAttribute('data-parent');
        this._child = this.getAttribute('data-child');

        if (!this._child) {
            this._child = false;
        }

        if (this._parent) {
            this._child = document.querySelector(`select-component[data-child=${this._parent}]`)
        }

        this._openSpeed = 0.3;
        this._closeSpeed = 0.4;

        if (!this._inner) {
            this._openSpeed = 0;
            this._closeSpeed = 0;
        }


        this._value = this._options[this._selectElement.selectedIndex].value;


        this._defaultValue = this._options[0].value;
        this._previousValue = this._value;
        this._text = this._options[this._selectElement.selectedIndex].text;
        this._index = this._selectElement.selectedIndex;


        this._valueElement.innerHTML = this._text;
        this._buttonElement.setAttribute('aria-haspopup', 'true');

        this._items = [];

        Array.prototype.forEach.call(this._options, function (op, index) {
            let el = document.createElement('div');
            let span = document.createElement('span');
            let obj, value, text, id;

            el.className = 'select-item';

            value = op.value;
            text = op.text;
            id = op.getAttribute('data-id');
            span.innerHTML = text;
            el.appendChild(span);

            obj = {
                value: value,
                text: text,
                index: index,
                element: el,
                id: id
            };

            self._items.push(obj);
            self._inner.appendChild(el);

            el.addEventListener('click', function (e) {
                self.setValue(obj.value);
                self.close();

                if (self._parent) {
                    self.filterOption();
                }
            });
        });

        this.setValue(this._items[this._selectElement.selectedIndex].value);
        if (this._parent) {
            setTimeout(() => {
                this.filterOption();
            }, 0)
        }
        this.setRestricts();

        this._buttonElement.addEventListener('keydown', function (e) {
            let keyCode = e.keyCode || e.which;
            let cnt = 0;

            if (keyCode == '13' || !self._expanded && keyCode == '32') {
                e.preventDefault();
                e.stopPropagation();

                if (self._expanded) {
                    self.close();
                } else {
                    self.open();
                }
            }

            if (!self._expanded && (keyCode === 40 || keyCode === 34)) { // down
                e.preventDefault();
                self._index++;

                if (self._index >= self._options.length) {
                    self._index = 0;
                }

                cnt = 0;
                while (self._options[self._index].disabled
                && cnt <= self._options.length) {
                    cnt++;

                    self._index++;
                    if (self._index >= self._options.length) {
                        self._index = 0;
                    }
                }

                self.setValue(self._items[self._index].value, true);
            } else if (!self._expanded && (keyCode === 38 || keyCode === 33)) { // up
                e.preventDefault();

                self._index--;
                if (self._index < 0) {
                    self._index = self._options.length - 1;
                }

                cnt = 0;
                while (self._options[self._index].disabled
                && cnt <= self._options.length) {
                    cnt++;

                    self._index--;
                    if (self._index < 0) {
                        self._index = self._options.length - 1;
                    }
                }

                self.setValue(self._items[self._index].value, true);
            }

            if (self._parent) {
                self.filterOption();
            }
        });
        this._buttonElement.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (self._expanded) {
                self.close();
            } else {
                self.open();
            }
        });

        dispatcher.subscribe(this.handleDispatcher);
    }

    disconnectedCallback() {

        dispatcher.unsubscribe(this.handleDispatcher);
    }
}

customElements.define('select-component', ElementClass);

export default ElementClass;
