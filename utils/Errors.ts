declare global {
    namespace Arcaela {
        namespace Throwable {
            type Types = "empty"
                | "filled"
                | "type/array"
                | "type/object"
                | "type/string"
                | "type/number"
                | "type/function"
                | "type/unknowm"
                | "string/too-short"
                | "string/too-long"
                | "string/only-number"
                | "string/only-string"
            type ErrorObject = {
                [K in Types]?: string
            };
        }
    }
}


const errors : Arcaela.Throwable.ErrorObject = {
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


export class Log<C extends Arcaela.Throwable.Types, M extends string> extends Error {
    private code : string | number = null;
    constructor(code: C, message?: M) {
        super(message || errors[ code ] || code);
        this.code = code;
        console.log( this );
    }
};

export class Warning<C extends Arcaela.Throwable.Types, M extends string> extends Error {
    private code : string | number = null;
    constructor(code: C, message?: M) {
        super(message || errors[ code ] || code);
        this.code = code;
        console.warn( this );
    }
};

export class Fatal<C extends Arcaela.Throwable.Types, M extends string> extends Error {
    private code : string | number = null;
    constructor(code: C, message?: M) {
        super(message || errors[ code ] || code);
        this.code = code;
        throw this;
    }
};