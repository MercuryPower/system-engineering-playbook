import dispatcher from '../../dispatcher.js';
import { attach, detach } from '../../utils/decorator.utils.js';
import { transition } from '../../utils/animation.utils.js';

const name = 'drag'; // указать дефолтное имя декоратора

const defaultOptions = {
    name: name,
};

class Decorator {
    constructor(parent, options) {
        this._parent = parent;
        this._options = Object.assign({}, defaultOptions, options);

        this._start = {};
        this._delta = {};
        this._vertical = undefined;
        this._edge = false;
        this._dragStarted = false;
        this._moveStarted = false;

        this.ontouchstart = this.ontouchstart.bind(this);
        this.ontouchmove = this.ontouchmove.bind(this);
        this.ontouchend = this.ontouchend.bind(this);
    }

    ontouchstart(e) {
        let touches;

        if (e.touches) {
            touches = e.touches[0];
            this._start = {
                x: touches.pageX,
                y: touches.pageY,
                time: +new Date(),
            };

            this._touch = true;
        } else {
            this._start = {
                x: e.clientX,
                y: e.clientY,
                time: +new Date(),
            };

            this._touch = false;
        }

        if (this._parent._direction === 'horizontal') {
            this._size = this._parent.clientWidth;
        } else {
            this._size = this._parent.clientHeight;
        }

        this._index = this._parent._index;

        this._delta = {};
        this._zSet = false;
        this._vertical = undefined;
        this._nextIndex = undefined;
        this._dragStarted = true;
        this._moveStarted = true;
        this._moveDirection = 0;
    }

    ontouchmove(e) {
        let touches;
        let move = 0;
        let touchMoveEvent;
        let dirDelta;
        let tmpNextIndex;
        let way, sizeShift;

        if (!this._dragStarted) return;

        if (e.touches) {
            if (e.touches.length > 1 || (e.scale && e.scale !== 1)) return;
            touches = event.touches[0];

            this._delta = {
                x: touches.pageX - this._start.x,
                y: touches.pageY - this._start.y,
            };

            this._touch = true;
        } else {
            this._delta = {
                x: e.clientX - this._start.x,
                y: e.clientY - this._start.y,
            };

            this._touch = false;
        }

        if (this._vertical === undefined) {
            this._vertical = Math.abs(this._delta.x) < Math.abs(this._delta.y);
        }

        if (this._parent._direction === 'horizontal') {
            dirDelta = this._delta.x;
            if (this._vertical) {
                return;
            };
        } else {
            dirDelta = this._delta.y;
            if (!this._vertical) {
                return;
            }
        }
        
        if (this._touch) {
          e.preventDefault();
          e.stopPropagation();  
      }
        
        if (!this._moveStarted) {
            dispatcher.dispatch({
                type: 'slider:progressbar-stop',
                id: this._parent._id,
            });

            this._moveStarted = true;
        }

        if (dirDelta < 0) {
            tmpNextIndex = this._parent._index + 1;
            if (tmpNextIndex > this._parent._total - 1) tmpNextIndex = 0;
        } else {
            tmpNextIndex = this._parent._index - 1;
            if (tmpNextIndex < 0) tmpNextIndex = this._parent._total - 1;
        }

        // direction change
        if (this._nextIndex !== undefined && tmpNextIndex !== this._nextIndex) {
            this._parent._slides[this._nextIndex].element.style.zIndex =
                this._parent._z - 2;

            this._parent._slides[this._nextIndex].element.classList.remove(
                'moving'
            );

            this._parent._slides[this._parent._index].element.classList.remove(
                'lower-moving'
            );

            this._zSet = false;
        }

        this._nextIndex = tmpNextIndex;

        if (!this._zSet) {
            this._zSet = true;

            this._parent._slides[this._parent._index].element.classList.add(
                'lower-moving'
            );

            this._parent._slides[this._nextIndex].element.classList.add(
                'moving'
            );

            this._parent._slides[this._nextIndex].element.style.zIndex =
                this._parent._z + 1;
        }

        way = this._parent.detectDirection(this._nextIndex);

        if (way === 'prev') {
            this._sizeShift = -this._size;
        }

        if (way === 'next') {
            this._sizeShift = +this._size;
        }

        move = dirDelta / 3;

        if (move > this._size / 3) {
            move = this._size / 3;
        }

        if (move < -this._size / 3) {
            move = -this._size / 3;
        }

        this._moveDirection = Math.sign(move);

        if (this._parent._notContinuous) {
            if (dirDelta > 0 && this._parent._index <= 0) {
                this._edge = true;
            } else if (
                dirDelta < 0 &&
                this._parent._index >= this._parent._total - 1
            ) {
                this._edge = true;
            } else {
                this._edge = false;
            }
        } else {
            this._edge = false;
        }

        if (this._edge) {
            move = move / 4;
        }

        touchMoveEvent = new CustomEvent('touchshift', {
            detail: move,
        });

        this._parent.dispatchEvent(touchMoveEvent);

        transition(this._parent._slides[this._nextIndex].element, 0, {
            transform: 'translateX(' + (move + this._sizeShift) + 'px)',
        });

        transition(this._parent._slides[this._parent._index].element, 0, {
            transform: 'translateX(' + move / 2 + 'px)',
        });
    }

    ontouchend(e) {
        let dirDelta;
        let duration, check, check2;
        let returnSpeed = 250;
        let touchEndEvent;

        check2 = true;

        if (this._parent._direction === 'horizontal') {
            dirDelta = this._delta.x;
            if (this._vertical) check2 = false;
        } else {
            dirDelta = this._delta.y;
            if (!this._vertical) check2 = false;
        }

        if (this._edge) check2 = false;

        duration = +new Date() - this._start.time;
        check =
            (parseInt(duration) < 250 && Math.abs(dirDelta) > 20) ||
            Math.abs(dirDelta) > this._size / 3.5;

        check = check && check2;

        if (this._nextIndex === undefined) return;

        if (check) {
            dispatcher.dispatch({
                type: 'slider:to',
                id: this._parent._id,
                index: this._nextIndex,
                userData: {
                    direction: this._moveDirection >= 0 ? 'prev' : 'next'
                }
            });
        } else {
            transition(
                this._parent._slides[this._nextIndex].element,
                returnSpeed / 1000,
                {
                    transform: 'translateX(' + this._sizeShift + 'px)',
                }
            );

            transition(
                this._parent._slides[this._parent._index].element,
                returnSpeed / 1000,
                {
                    transform: 'translateX(' + 0 + 'px)',
                }
            );

            this._parent._slides[this._nextIndex].element.classList.remove(
                'moving'
            );

            this._parent._slides[this._parent._index].element.classList.remove(
                'lower-moving'
            );

            this._zSet = false;
        }

        this._moveDirection = 0;
        this._dragStarted = false;
        this._moveStarted = false;
    }

    init() {
        if (this._options.touch) {
            this._parent.addEventListener('touchstart', this.ontouchstart, {
                passive: false,
            });

            this._parent.addEventListener('touchmove', this.ontouchmove, {
                passive: false,
            });

            this._parent.addEventListener('touchend', this.ontouchend, {
                passive: false,
            });
        }

        if (this._options.draggable) {
            this._parent.addEventListener('mousedown', this.ontouchstart, {
                passive: true,
            });

            this._parent.addEventListener('mousemove', this.ontouchmove, {
                passive: true,
            });

            this._parent.addEventListener('mouseup', this.ontouchend, {
                passive: true,
            });

            this._parent.addEventListener('mouseleave', this.ontouchend, {
                passive: true,
            });
        }
    }

    destroy() {
        if (this._options.touch) {
            this._parent.removeEventListener('touchstart', this.ontouchstart);
            this._parent.removeEventListener('touchmove', this.ontouchmove);
            this._parent.removeEventListener('touchend', this.ontouchend);
        }

        if (this._options.draggable) {
            this._parent.removeEventListener('mousedown', this.ontouchstart);
            this._parent.removeEventListener('mousemove', this.ontouchmove);
            this._parent.removeEventListener('mouseup', this.ontouchend);
            this._parent.removeEventListener('mouseleave', this.ontouchend);
        }
    }
}

export default {
    attach: (parent, options) => {
        return attach(
            Decorator,
            parent,
            Object.assign({}, defaultOptions, options)
        );
    },
    detach: (parent, options) => {
        return detach(parent, Object.assign({}, defaultOptions, options));
    },
};