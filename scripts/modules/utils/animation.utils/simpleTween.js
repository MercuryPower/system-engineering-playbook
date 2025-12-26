import { mix } from '../math.utils.js';
import { mixArrays, subArrays } from '../array.utils.js';
import { mixObjects, subObjects } from '../object.utils.js';

let tweenId = 0;
let tweens = {};

let simpleTween = function({ from, to, duration, ease, delay }, onUpdate) {
    const currentTweenId = tweenId++;
    
    let val;

    if (Array.isArray(from)) {
        from = from.slice();
        val = from.slice();
    } else if (typeof from === 'object') {
        from = Object.assign({}, from);
        val = Object.assign({}, from);
    } else {
        val = from;
    }

    let frame = 0;

    duration *= 60;

    if (!delay) {
        delay = 0;
    }

    delay *= 60;
    duration += delay;

    tweens[currentTweenId] = {
        id: currentTweenId,
        killed: false,
        kill: () => {
            if (!tweens[currentTweenId]) return;
            tweens[currentTweenId].killed = true;
        }
    }

    let loop = function () {
        let easeProgress;

        if (tweens[currentTweenId].killed) {
            delete tweens[currentTweenId];
            return;
        }

        frame++;

        let progress = Math.max(0, (frame - delay)) / duration;
        if (progress > 1) {
            progress = 1;
        }

        if (ease) {
            easeProgress = ease(progress);
        } else {
            easeProgress = progress;
        }

        let newVal;
        let delta;

        if (Array.isArray(from) &&
            Array.isArray(to)) {
            
            newVal = mixArrays(from, to, easeProgress);
            delta = subArrays(newVal, val);
        } else if (typeof from === 'object' &&
            typeof to === 'object') {
            
            newVal = mixObjects(from, to, easeProgress);
            delta = subObjects(newVal, val);
        } else if (typeof from === 'number' &&
            typeof to === 'number') {
            
            newVal = mix(from, to, easeProgress);
            delta = newVal - val;
        } else {
            console.error(`unexpected value types for inputs: ${typeof from}, ${typeof to}`);
            return;
        }

        if (Array.isArray(newVal)) {
            val = newVal.slice();
        } else if (typeof newVal === 'object') {
            val = Object.assign({}, newVal);
        } else {
            val = newVal;
        }

        onUpdate({
            value: val,
            delta: delta,
        });

        if (progress === 1) {
            delete tweens[currentTweenId];
            return;
        }

        requestAnimationFrame(loop);
    };

    loop();

    return tweens[currentTweenId];
}

export default simpleTween;