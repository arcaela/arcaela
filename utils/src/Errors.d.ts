declare global {
    namespace Arcaela {
        namespace Throwable {
            type Types = "empty" | "filled" | "type/array" | "type/object" | "type/string" | "type/number" | "type/function" | "type/unknowm" | "string/too-short" | "string/too-long" | "string/only-number" | "string/only-string" | `${string}`;
            type ErrorObject = {
                [K in Types]?: string;
            };
        }
    }
}
export declare class Log<C extends Arcaela.Throwable.Types, M extends string> extends Error {
    private code;
    constructor(code: C, message?: M);
}
export declare class Warning<C extends Arcaela.Throwable.Types, M extends string> extends Error {
    private code;
    constructor(code: C, message?: M);
}
export declare class Fatal<C extends Arcaela.Throwable.Types, M extends string> extends Error {
    private code;
    constructor(code: C, message?: M);
}
