"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fatal = exports.Warning = exports.Log = void 0;
const errors = {
    empty: "The received argument or property is empty or undefined.",
    filled: "The received argument or property must be empty or undefined.",
    "type/array": "Only one type of Array value can be received.",
    "type/object": "Only one type of Object value can be received.",
    "type/string": "Only one type of String value can be received.",
    "type/number": "Only one type of Number value can be received.",
    "type/function": "Only one type of Function value can be received.",
    "type/unknowm": "The argument does not meet the required value type.",
    "string/too-short": "The text string is too short or empty.",
    "string/too-long": "The text string exceeds the allowed character limit.",
    "string/only-number": "Only one literal type of number can be specified.",
    "string/only-string": "Only one literal type of string can be specified.",
};
class Log extends Error {
    constructor(code, message) {
        super(message || errors[code] || code);
        this.code = null;
        this.code = code;
        console.log(this);
    }
}
exports.Log = Log;
;
class Warning extends Error {
    constructor(code, message) {
        super(message || errors[code] || code);
        this.code = null;
        this.code = code;
        console.warn(this);
    }
}
exports.Warning = Warning;
;
class Fatal extends Error {
    constructor(code, message) {
        super(message || errors[code] || code);
        this.code = null;
        this.code = code;
        throw this;
    }
}
exports.Fatal = Fatal;
;
