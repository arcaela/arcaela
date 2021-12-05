/**
 *
 * @param {*} fn
 * @returns {boolean}
 */
export declare function isObject(fn: any): boolean;
/**
 *
 * @param {*} fn
 * @returns {boolean}
 */
export declare function isFunction(fn: any): boolean;
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
export declare function promify(): Promise<unknown> & {
    reject?: any;
    resolve?: any;
};
/**
 *
 * @param {object} object
 * @param {string} key
 * @returns {boolean}
 */
export declare function has(object: any, path: any): any;
/**
 *
 * @param {object} object
 * @param {string} key
 * @returns {*}
 */
export declare function get(object: any, path: string, defaultValue: any): any;
/**
 *
 * @param {object} object
 * @param {string} path
 * @param {*} value
 * @returns {@var value}
 */
export declare function set(object: any, path: string, value: any): any;
/**
 *
 * @param {object} target
 * @param  {object[]} items
 * @returns {object}
 */
export declare function merge(target: any, ...items: any[]): any;
/**
 *
 * @param {object} object
 * @param {string} path
 * @returns
 */
export declare function unset(object: any, path?: string): any;
/**
 * @example
 * paths({ user:"arcaela", "age": 25, job:{ home:"dream", school:"student", } })
 * // ['user','age','job.home', 'job.school']
 * @param {{}} object
 * @returns {string[]}
 */
export declare function paths(object: any): any[];
/**
 * @description Return true if value is not empty.
 * @param {*} value
 * @returns {boolean}
 */
export declare function empty(value: any): boolean;
/**
 * @description Get random number.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export declare function rand(min?: number, max?: number): number;
/**
 * @param {number} time
 * @param {any} [response]
 * @returns {Promise<response>}
 */
export declare function sleep(time: number, response: any): Promise<unknown>;
/*****************  Development  *******************/
/**
 *
 * @param {{}|[]} object
 * @returns {{}|[]}
 */
export declare function clone(object: any): any;
export declare function setcookie(name: any, ...props: [string, number, ...any]): any;
/**
 *
 * @param {string} name
 * @returns {null}
 */
export declare function unsetcookie(name: any): boolean;
/**
 *
 * @param {number} phone
 * @param {string} text
 * @returns {string}
 */
export declare function WhatsApp(phone: any, text: any): string;
/**
 *
 * @param {*} arr
 * @returns {boolean}
 */
export declare function blank(arr: any): boolean;
/**
 *
 * @param {string} key
 * @param  {...any} next
 * @returns {*}
 */
export declare function cache(key: any, ...next: any[]): any;
