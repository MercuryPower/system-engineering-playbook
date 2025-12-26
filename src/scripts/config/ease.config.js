import BezierEasing from './bezier-easing.lib.js';

let root = document.documentElement;
let styles = getComputedStyle(root);

let ease = styles.getPropertyValue('--ease');
let easeIn = styles.getPropertyValue('--ease-in');
let easeOut = styles.getPropertyValue('--ease-out');
let easeInStrong = styles.getPropertyValue('--ease-in-strong');
let easeOutStrong = styles.getPropertyValue('--ease-out-strong');

function getEasing(st) {
    let vals;
    if (!st) {
       return {
           bezier: null,
           css: null       } 
    }
    vals = /\(([^)]+)\)/.exec(st)[1].split(', ').map(function(ent) {
        return parseFloat(ent);
    });

    if (vals.length !== 4) {
        vals = /\(([^)]+)\)/.exec(st)[1].split(',').map(function(ent) {
            return parseFloat(ent);
        });
    }
    if (vals.length !== 4) {
        console.error('error in parsing: "' + st + '" cubic bezier needs to have 4 values split by ", " with spaces.');
    }

    return {
        bezier: BezierEasing(vals[0], vals[1], vals[2], vals[3]),
        css: 'cubic-bezier(' + vals[0] + ', ' + vals[1] + ', ' + vals[2] + ', ' + vals[3] + ')'
    }
}

ease = getEasing(ease);
easeIn = getEasing(easeIn);
easeOut = getEasing(easeOut);
easeInStrong = getEasing(easeInStrong);
easeOutStrong = getEasing(easeOutStrong);
// console.dir(easeOutStrong);

let bezier = {
    ease: ease.bezier || BezierEasing(1, 0, 0.3, 1),
    easeOut: easeOut.bezier || BezierEasing(0.165, 0.84, 0.44, 1),
    easeIn: easeIn.bezier || BezierEasing(0.755, 0.05, 0.855, 0.06),
    easeOutStrong: easeOutStrong.bezier || BezierEasing(0.165, 0.84, 0.44, 1),
    easeInStrong: easeInStrong.bezier || BezierEasing(0.755, 0.05, 0.855, 0.06),
    default: BezierEasing(0.25, 0.1, 0.25, 1),
    easeInOut2: BezierEasing(0.455, 0.03, 0.515, 0.955),
    easePower2: BezierEasing(0.77, 0, 0.175, 1),
    easePower3: BezierEasing(0.645, 0.045, 0.355, 1),
    easePower4: BezierEasing(0.86, 0, 0.07, 1),
    easeSine: BezierEasing(0.445, 0.05, 0.55, 0.95),
    easeInPower2: BezierEasing(0.55, 0.055, 0.675, 0.19),
    easeInPower3: BezierEasing(0.55, 0.085, 0.68, 0.53),
    easeOutPower2: BezierEasing(0.25, 0.46, 0.45, 0.94),
    easeOutPower3: BezierEasing(0.215, 0.610, 0.355, 1)
}

let css = {
    ease: ease.css || 'cubic-bezier(1, 0, 0.3, 1)',
    easeOut:  easeOut.css || 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    easeIn: easeIn.css || 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    easeOutStrong:  easeOutStrong.css || 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    easeInStrong: easeInStrong.css || 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    default: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeInOut2: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
    easePower2: 'cubic-bezier(0.77, 0, 0.175, 1)',
    easePower3: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    easePower4: 'cubic-bezier(0.86, 0, 0.07, 1)',
    easeSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    easeInPower2: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeInPower3: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutPower2: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeOutPower3: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
}

if (!window._vars) {
    window._vars = {}
}

window._vars.ease = {
    bezier: bezier,
    css: css
}

export {
    bezier,
    css
}
