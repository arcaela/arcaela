/**
 * @description Same as PHP setcookie
 */
 export function setcookie(...name: any[]): string;

 /**
  * @description Same as PHP unsetcookie
  */
 export function unsetcookie(name: string): null;
 
 /**
  * @description Create WhatsApp Link
  * @example
  * WhatsApp("573125469870", "¡Hi, I there using TypeScript!")
  */
 export function WhatsApp($phone: number, $text: string): string;
 
/**
 * @description Create quick promise
 * @example
 * function readDocument( src: string ) : PromiseLike<Buffer> {
 *  const response = promify();
 *  fs.readFile(src, "utf8", (err: Error | null, data : Buffer)=>{
 *      if( err ) response.reject( err );
 *      else response.resolve( data );
 *  })
 *  return response;
 * };
 */
export function promify(): Promise<any> & {
    resolve();
    reject();
};


/**
 * @description Use this function is you want save temp data in user browser.
 * 
 * @example
 * cache("session-key") //Read Session Key of Storage
 * cache("session-key", "U2kgcHVlZGVzIGxlZXIgZXN0byBlbiBlc3Bh8W9sIGVudG9uY2VzIHB1ZWRlcyB1bmlydGUgYWwgcHJveWVjdG8u") //Set Session
 * cache("session-key", token, 2000 ) //Set Session with 2 seconds expires.
 * 
 * @description This method can store large amounts of data and it is read synchronously, but it cannot store data of type Blob.
 * @example
 * cache("user-info", { username:"arcaelas" }) // Set as Plain JSON
 * cache("user-info") // Return JSON Object<{ username:"arcaelas" }>
 * 
 */
export function cache(key: string, ...next: any[]): any;

/**
 * @description Check if path is include in Object
 */
export function has(object: object, path: any): boolean;

/**
 * @description Combine many objects recursive
 */
export function merge(target: object, ...items: object[]): object;

/**
 * @description Get all valid paths of object.
 */
export function paths(object: {}): string[];

export function set(object: object, path: string, value: any): any;
export function unset(object: object, path?: string): any;
export function empty(value: any): boolean;
export function rand(min?: number, max?: number): number;
export function sleep(time?: number, response?: any): Promise<any>;
export function clone(object: {} | []): {} | [];
export function isObject(fn: any): boolean;
export function isFunction(fn: any): boolean;
export function get(object: object, path: string, defaultValue: any): any;
export function blank(arr: any): boolean;