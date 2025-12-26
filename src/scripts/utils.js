const offset = (elem) => {
    const getOffsetSum = (elem) => {
        let top = 0, left = 0;
        while(elem) {
            top = top + parseInt(elem.offsetTop);
            left = left + parseInt(elem.offsetLeft);
            elem = elem.offsetParent;
        }
        return {top: top, left: left};
    };

    const getOffsetRect = (elem) => {
        let box = elem.getBoundingClientRect();

        const body = document.body;
        const docElem = document.documentElement;

        let scrollTop = window.pageYOffset  || docElem.scrollTop || body.scrollTop;
        let scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        let clientTop = docElem.clientTop   || body.clientTop || 0;
        let clientLeft = docElem.clientLeft || body.clientLeft || 0;

        let top  = box.top  + scrollTop  - clientTop;
        let left = box.left + scrollLeft - clientLeft;

        return {
            top:  Math.round(top),
            left: Math.round(left)
        };
    };

    if (elem.getBoundingClientRect) {
        return getOffsetRect(elem);
    } else {
        return getOffsetSum(elem);
    }
};
const http = (url) => {
    const core = {
        ajax: function(method, url, args, type) {
            const promise = new Promise((resolve, reject) => {
                const client = new XMLHttpRequest();
                let query,
                    json,
                    argcount,
                    key,
                    entries;

                client.onload = function() {
                    if (this.status >= 200 && this.status < 300 || this.status === 404) {
                        resolve(this.response);
                    } else {
                        console.warn('xhr status error');
                        reject(this.statusText);
                    }
                };
                client.onerror = function() {
                    if (this.status === 404) {
                        resolve(this.response);
                    } else {
                        console.warn('xhr error');
                        reject(this.statusText);
                    }
                };

                if (!args) {
                    client.open(method, url);
                    client.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    client.send();
                } else {
                    if (!type || type === 'urlencoded') {
                        query = '';
                        argcount = 0;
                        for (key in args) {
                            if (args.hasOwnProperty(key)) {
                                if (argcount++) {
                                    query += '&';
                                }
                                query += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                            }
                        }
                    } else if (type === 'json') {
                        json = {};
                        args.forEach(function(value, key){
                            json[key] = value;
                        });
                        json = JSON.stringify(json);

                        // entries = args.entries();
                        // json = {};
                        // for (var entry of entries) {
                        //     json[entry[0]] = entry[1];
                        // }
                        // json = JSON.stringify(json);
                    }
                    if ((method === 'GET' || method === 'DELETE')) {
                        client.open(method, url + '?' + query);
                        client.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                        client.send();
                    } else {
                        client.open(method, url);
                        client.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                        if (type === 'json') {
                            client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                            client.send(json);
                        } else if (type === 'urlencoded') {
                            client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                            client.send(query);
                        } else {
                            client.send(args);
                        }
                    }
                }
            });
            return promise;
        }
    };

    return {
        'get': (args, type) => {
            return core.ajax('GET', url, args, type);
        },
        'post': (args, type) => {
            return core.ajax('POST', url, args, type);
        },
        'put': (args, type) => {
            return core.ajax('PUT', url, args, type);
        },
        'delete': (args, type) => {
            return core.ajax('DELETE', url, args, type);
        }
    }
};
const queryParse = (str) => {
    if (typeof str !== 'string') return {};
    str = str.trim().replace(/^(\?|#|&)/, '');
    if (!str) return {};
    return str.split('&').reduce((ret, param) => {
        let parts = param.replace(/\+/g, ' ').split('=');
        let key = parts[0];
        let val = parts[1];
        key = decodeURIComponent(key);
        val = val === undefined ? null : decodeURIComponent(val);
        if (!ret.hasOwnProperty(key)) {
            ret[key] = val;
        } else if (Array.isArray(ret[key])) {
            ret[key].push(val);
        } else {
            ret[key] = [ret[key], val];
        }
        return ret;
    }, {});
};
const debounce = function(delay, fn) {
    let timerId;
    return function () {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
};
const delay = function(f, ms) {
    return () => {
        setTimeout(() => {
            f.apply(this, arguments);
        }, ms);
    };
};

const throttle = (func, ms) => {
    let isThrottled = false;

    return function(...args) {
        if (isThrottled) return;
        isThrottled = true;

        func.apply(args);

        setTimeout(() => {
            isThrottled = false;
            func.apply(args);
        }, ms);
    }
};

export default { offset, http, queryParse, debounce, delay, throttle }