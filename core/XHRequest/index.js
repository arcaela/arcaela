"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Errors_1 = require("../vendor/Errors");
/**
 * @class
 */
var XHRequest = /** @class */ (function () {
    /**
     * @constructor
     * @description Initiate XHRequest
     */
    function XHRequest(url, request) {
        this.request = {
            method: "GET"
        };
        this.options = {
            driver: 'fetch',
            drivers: {},
            events: {
                before: [],
                success: [],
                error: []
            }
        };
        this._domain = window.location.origin;
        this.request.url = url;
        this.merge(request);
    }
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * XHR.domain("https://api.example.com/"); // Set domain
     */
    XHRequest.domain = function (domain) {
        XHRequest.prototype._domain = domain instanceof URL ? domain.toString() : ((typeof domain === 'string' && domain.match(/^[a-z0-9]+\:\/\//)) ? domain : window.location.origin);
    };
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * XHR.domain("https://api.example.com/"); // Set domain
     */
    XHRequest.prototype.domain = function (domain) {
        this._domain = domain instanceof URL ? domain.toString() : ((typeof domain === 'string' && domain.match(/^[a-z0-9]+\:\/\//)) ? domain : window.location.origin);
        return this;
    };
    XHRequest.prototype.url = function (url) {
        this.request.url = url instanceof URL ? url.toString() : ((typeof url === "string" && !url.match(/^(\/\/)?[a-zA-Z0-9]+\:/)) ? this._domain.concat(url) : url);
        return this;
    };
    XHRequest.prototype.method = function (method) {
        this.request.method = method;
        return this;
    };
    XHRequest.prototype.header = function () {
        var _this = this;
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        var key = props[0], _a = props[1], value = _a === void 0 ? false : _a;
        if (typeof key === "object") {
            if (value === true)
                this.request.headers = {};
            if (key instanceof Headers)
                key.forEach(function (v, k, h) { return _this.request.headers[k] = h.get(k); });
            else
                Object.assign(this.request.headers, key);
        }
        else if (key === "string")
            this.request.headers[key] = value;
        return this;
    };
    XHRequest.prototype.input = function () {
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        var key = props[0], _a = props[1], value = _a === void 0 ? false : _a;
        if (key instanceof HTMLInputElement) {
            if (key.type === 'file')
                return this.file(key);
            this.request.inputs[key.name] = key.type === "checkbox" ? key.checked : key.value;
        }
        else if (typeof key === 'string' && value instanceof HTMLInputElement) {
            if (value.type === 'file')
                return this.file(key, value);
            this.request.inputs[key] = value.type === "checkbox" ? value.checked : value.value;
        }
        else if (key instanceof FormData) {
            var object_1 = {};
            key.forEach(function (v, k) { return object_1[k] = k in object_1 ? [].concat(object_1[k], v) : v; });
            if (value === true)
                this.request.inputs = object_1;
            else
                Object.assign(this.request.inputs, object_1);
        }
        else if (key instanceof URLSearchParams || (props.length === 1 && typeof key === "string")) {
            var object_2 = {};
            (new URLSearchParams(key)).forEach(function (v, k) { return object_2[k] = v; });
            if (value === true)
                this.request.inputs = object_2;
            else
                Object.assign(this.request.inputs, object_2);
        }
        else if (['string', 'number'].includes(typeof key) && typeof value === 'object') {
            this.request.inputs[key] = value;
        }
        else if (typeof key === 'object') {
            var object = {};
            for (var K in key) {
                var V = key[K];
                if ((V instanceof Blob) || (V instanceof File) || (V instanceof FileList) || (V instanceof ArrayBuffer))
                    this.file(K, V);
                else if (V instanceof HTMLInputElement)
                    this.input(K, V);
                else
                    object[K] = V;
            }
            if (value === true)
                this.request.inputs = object;
            else
                Object.assign(this.request.inputs, object);
        }
        return this;
    };
    XHRequest.prototype.file = function () {
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        var key = props[0], blob = props[1];
        var isFile = function (e) { return (blob instanceof Blob || blob instanceof File || blob instanceof ReadableStream || blob instanceof ArrayBuffer); };
        if (key instanceof HTMLInputElement) {
            if (key.type !== 'file')
                return this.input(key);
            var files = [];
            for (var i = 0; i < key.files.length; i++)
                files.push(key.files.item(i));
            this.request.files[key.name] = key.multiple ? files : files.shift();
        }
        else if (typeof key === "string") {
            if (blob instanceof HTMLInputElement) {
                if (blob.type !== "file")
                    return this.input(key, blob);
                var files = [];
                for (var i = 0; i < blob.files.length; i++)
                    files.push(blob.files.item(i));
                this.request.files[key] = blob.multiple ? files : files.shift();
            }
            else if (blob instanceof Array)
                this.request.files[key] = blob.filter(isFile);
            else if (isFile(blob))
                this.request.files[key] = blob;
        }
        return this;
    };
    XHRequest.prototype.merge = function () {
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        var key = props[0], value = props[1], rest = props.slice(2);
        var object = {};
        if (typeof key === 'string')
            object[key] = value;
        else if (key instanceof URL)
            object['url'] = key, rest = [value].concat(rest);
        else if (key instanceof Headers)
            object['headers'] = key, rest = [value].concat(rest);
        else if (key instanceof FormData || key instanceof URLSearchParams)
            object['inputs'] = key, rest = [value].concat(rest);
        else if (key && typeof key === 'object') {
            Object.assign(object, key);
            rest = [value].concat(rest);
        }
        for (var key_1 in object) {
            var value_1 = object[key_1];
            switch (key_1) {
                case "headers":
                    this.header.apply(this, __spreadArray([value_1], rest, false));
                    break;
                case "body":
                case "inputs":
                    this.input.apply(this, __spreadArray([value_1], rest, false));
                    break;
                default:
                    this.request[key_1] = value_1;
                    break;
            }
        }
        return this;
    };
    XHRequest.prototype.on = function () {
        var _this = this;
        var _a;
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        var event = props[0], callback = props[1];
        ((_a = this.options.events)[event] || (_a[event] = [])).push(callback);
        return function () { return _this.options.events[event].splice(_this.options.events[event].findIndex(function (e) { return e === callback; }), 1); };
    };
    XHRequest.prototype.driver = function () {
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        var name = props[0], driver = props[1];
        if (typeof name !== 'string')
            new Errors_1.Fatal("type/string");
        else if (typeof driver === 'function')
            this.options.drivers[name] = driver;
        else if (typeof driver === 'boolean') {
            if (!driver)
                new Errors_1.Fatal("You cannot disable a handler, in its case you can select another handler using its name and the TRUE argument.");
            else if (!(name in this.options.drivers))
                new Errors_1.Fatal("It seems that the driver is not stored, in this case you must define the driver using the \"driver\" method (static or public) to define the driver.");
            else
                this.options.driver = name;
        }
        return this;
    };
    XHRequest.driver = function () {
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        var name = props[0], driver = props[1];
        if (typeof name !== 'string')
            new Errors_1.Fatal("type/string");
        else if (typeof driver === 'function')
            XHRequest.prototype.options.drivers[name] = driver;
        else if (typeof driver === 'boolean') {
            if (!driver)
                new Errors_1.Fatal("You cannot disable a handler, in its case you can select another handler using its name and the TRUE argument.");
            else if (!(name in XHRequest.prototype.options.drivers))
                new Errors_1.Fatal("It seems that the driver is not stored, in this case you must define the driver using the \"driver\" method (static or public) to define the driver.");
            else
                XHRequest.prototype.options.driver = name;
        }
    };
    return XHRequest;
}());
module.exports = XHRequest;
