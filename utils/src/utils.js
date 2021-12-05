"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.blank = exports.WhatsApp = exports.unsetcookie = exports.setcookie = exports.clone = exports.sleep = exports.rand = exports.empty = exports.paths = exports.unset = exports.merge = exports.set = exports.get = exports.has = exports.promify = exports.isFunction = exports.isObject = void 0;
/**
 *
 * @param {*} fn
 * @returns {boolean}
 */
function isObject(fn) {
    return fn && typeof fn === 'object' && !(fn instanceof Array);
}
exports.isObject = isObject;
/**
 *
 * @param {*} fn
 * @returns {boolean}
 */
function isFunction(fn) {
    return typeof fn === 'function';
}
exports.isFunction = isFunction;
/**
 * @description Create a Promify for unexpected values or functions.
 * @example
 * async function readFile(){
 *  const promise = promify();
 *  fs.readFile(a,b,(err)=>{
 *      if(err) promise.reject(err);
 *      else promise.resolve("¡Good Luck!");
 *  });
 *  return promise;
 * }
 * @returns {Promise<> & { resolve(), reject() }}
 */
function promify() {
    let status = {
        reject(v) { },
        resolve(v) { },
    };
    const promise = new Promise((resolve, reject) => status = { resolve, reject });
    promise.reject = status.reject;
    promise.resolve = status.resolve;
    return promise;
}
exports.promify = promify;
;
/**
 *
 * @param {object} object
 * @param {string} key
 * @returns {boolean}
 */
function has(object, path) {
    try {
        return path.split(".").reduce((exists, key) => key in exists && exists[key], object);
    }
    catch (err) {
        return false;
    }
}
exports.has = has;
/**
 *
 * @param {object} object
 * @param {string} key
 * @returns {*}
 */
function get(object, path = '', defaultValue) {
    try {
        return path.split('.').reduce((obj, key) => {
            return obj[key];
        }, object);
    }
    catch (err) {
        return defaultValue;
    }
}
exports.get = get;
/**
 *
 * @param {object} object
 * @param {string} path
 * @param {*} value
 * @returns {@var value}
 */
function set(object, path = '', value) {
    let target = object;
    let keys = path.split(".");
    while (keys.length) {
        let key = keys.shift();
        target = target[key] = !keys.length ? value : (key in target
            ? (target[key] && typeof target[key] === 'object' ? target[key] : (keys.length ? {} : value)) : {});
    }
    return object;
}
exports.set = set;
/**
 *
 * @param {object} target
 * @param  {object[]} items
 * @returns {object}
 */
function merge(target, ...items) {
    target = isObject(target) ? target : {};
    for (let item of items) {
        if (typeof item !== 'object')
            continue;
        for (let key in item) {
            let value = item[key];
            if (!(target[key] instanceof Array) && target[key] instanceof Object && value instanceof Object)
                target[key] = merge(target[key], value);
            else
                target[key] = value;
        }
    }
    return target;
}
exports.merge = merge;
/**
 *
 * @param {object} object
 * @param {string} path
 * @returns
 */
function unset(object, path = '') {
    let target, keys = path.split('.'), key = keys.shift();
    if (keys.length === 0)
        delete object[key];
    else if (key in object) {
        target = object[key];
        while (keys.length) {
            key = keys.shift();
            if (target && typeof target === 'object' && key in target) {
                if (!keys.length) {
                    delete target[key];
                    break;
                }
                else
                    target = target[key];
            }
            else
                break;
        }
    }
    return object;
}
exports.unset = unset;
;
/**
 * @example
 * paths({ user:"arcaela", "age": 25, job:{ home:"dream", school:"student", } })
 * // ['user','age','job.home', 'job.school']
 * @param {{}} object
 * @returns {string[]}
 */
function paths(object) {
    const c = (model, prefix = '', arr = []) => {
        for (let key in model) {
            let value = model[key];
            key = prefix ? prefix + '.' + key : key;
            if (value && typeof value === 'object')
                c(value, key, arr);
            else
                arr.push(key);
        }
        return arr;
    };
    return c(object);
}
exports.paths = paths;
;
/**
 * @description Return true if value is not empty.
 * @param {*} value
 * @returns {boolean}
 */
function empty(value) {
    return [undefined, null, false, 0].some(e => e === value) ||
        (['object', 'string'].some(e => e === typeof value) && !Object.keys(value).length) ||
        (Array.isArray(value) && !value.length);
}
exports.empty = empty;
;
/**
 * @description Get random number.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function rand(min = -Infinity, max = Infinity) {
    return Math.floor((Math.random() * (max - min + 1) + min));
}
exports.rand = rand;
;
/**
 * @param {number} time
 * @param {any} [response]
 * @returns {Promise<response>}
 */
function sleep(time = 100, response) {
    return new Promise((r) => setTimeout(() => r(response), Number(time)));
}
exports.sleep = sleep;
;
/*****************  Development  *******************/
/**
 *
 * @param {{}|[]} object
 * @returns {{}|[]}
 */
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.clone = clone;
const cookie = {
    toSeconds: function (time = 3, e = 0) {
        time = empty(time) ? 0 : time;
        let now = new Date().getTime();
        time = !isNaN(Number(time)) ? (new Date().getTime() + time) : (typeof time === 'string' ? new Date(time).getTime() : new Date("2035").getTime());
        return e = (time - now), e > 0 ? e : 0;
    },
    set: function (name, value, time = Infinity, path, domain, https = false) {
        return document.cookie =
            encodeURIComponent(name) +
                "=" + encodeURIComponent(value) +
                ("; max-age=" + this.toSeconds(time)) +
                (path ? "; path=" + path : "") +
                (domain ? "; domain=" + domain : "") +
                (https ? "; secure" : ""), value;
    },
    get: function (name) {
        return this.all[name] || undefined;
    },
    remove: function (name, ...server) {
        return this.set(name, undefined, false, ...server), !this.all[name];
    },
    has: function (key) {
        return Object.keys(this.all).some(e => e === key);
    },
    get all() {
        var cookies = [];
        return document.cookie.split(';').forEach(cookie => {
            cookies[decodeURIComponent(cookie.substr(0, cookie.indexOf('='))).trim()] =
                decodeURIComponent(cookie.substr(cookie.indexOf('=') + 1));
        }), cookies;
    }
};
function setcookie(name, ...props) {
    return props.length ? cookie.set(name, ...props) : cookie.get(name);
}
exports.setcookie = setcookie;
;
/**
 *
 * @param {string} name
 * @returns {null}
 */
function unsetcookie(name) {
    return cookie.remove(name);
}
exports.unsetcookie = unsetcookie;
;
/**
 *
 * @param {number} phone
 * @param {string} text
 * @returns {string}
 */
function WhatsApp(phone, text) {
    return (([
        `https://wa.me/${phone}?phone=${phone}&text=${encodeURI(text)}`,
        `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURI(text)}`
    ][window.innerWidth <= 500 ? 0 : 1]));
}
exports.WhatsApp = WhatsApp;
;
/**
 *
 * @param {*} arr
 * @returns {boolean}
 */
function blank(arr) {
    return (null ||
        arr === null ||
        arr === undefined ||
        (Array.isArray(arr) && !arr.length) ||
        (typeof arr === 'string' && arr.trim().length == 0) ||
        (arr && typeof arr === 'object' && !Object.keys(arr).length));
}
exports.blank = blank;
;
/**
 *
 * @param {string} key
 * @param  {...any} next
 * @returns {*}
 */
function cache(key, ...next) {
    let BD = window.localStorage;
    if (!next.length) {
        let data = JSON.parse(BD.getItem(key) || '{"expire":0}');
        return (new Date()).getTime() < data.expire ? data.data : undefined;
    }
    else if (next.length >= 1) {
        return BD.setItem(key, JSON.stringify({
            key,
            data: next[0],
            expire: ((new Date).getTime() + ((typeof parseInt(next[1]) === 'number' ? next[1] : 180) * 1000)),
        })), next[0];
    }
}
exports.cache = cache;
;
