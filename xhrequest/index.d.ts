declare global {
    namespace Arcaela {
        namespace HTTP {
            /**
             * @description All HTTP Methods
             */
            type Methods = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
            /**
             * @description All valid Cache-Control
             */
            type CacheControl = RequestCache | "must-revalidate" | "no-transform" | "public" | "private" | "proxy-revalidate" | `max-age=${number}` | `s-maxage=${number}`;
            /**
             * @description All common HTTP headers
             */
            type Headers = {
                "Accept-Ranges": any;
                "Access-Control-Allow-Credentials": boolean | string;
                "Access-Control-Allow-Headers": string | [];
                "Access-Control-Allow-Methods": Methods | `${Methods},${string}`;
                "Access-Control-Allow-Origin": any;
                "Access-Control-Expose-Headers": string | [];
                "Access-Control-Max-Age": number;
                "Age": number;
                "Allow": Methods | `${Methods},${string}`;
                "Alternate-Protocol": any;
                "Cache-Control": CacheControl;
                "Client-Date": any;
                "Client-Peer": any;
                "Client-Response-Num": any;
                "Connection": any;
                "Content-Disposition": any;
                "Content-Encoding": any;
                "Content-Language": any;
                "Content-Length": number;
                "Content-Location": any;
                "Content-MD5": any;
                "Content-Range": any;
                "Content-Security-Policy-Report-Only": any;
                "Content-Security-Policy, X-Content-Security-Policy, X-WebKit-CSP": any;
                "Content-Type": any;
                "Date": any;
                "ETag": any;
                "Expires": Date | number | string;
                "HTTP": any;
                "Keep-Alive": any;
                "Last-Modified": any;
                "Link": any;
                "Location": any;
                "P3P": any;
                "Pragma": "no-cache";
                "Proxy-Authenticate": any;
                "Proxy-Connection": any;
                "Refresh": any;
                "Retry-After": any;
                "Server": any;
                "Set-Cookie": any;
                "Status": any;
                "Strict-Transport-Security": any;
                "Timing-Allow-Origin": any;
                "Trailer": any;
                "Transfer-Encoding": any;
                "Upgrade": any;
                "UserAgent": string;
                "Vary": any;
                "Via": any;
                "Warning": any;
                "WWW-Authenticate": any;
                "X-Aspnet-Version": any;
                "X-Content-Type-Options": any;
                "X-Frame-Options": any;
                "X-Permitted-Cross-Domain-Policies": any;
                "X-Pingback": any;
                "X-Powered-By": any;
                "X-Robots-Tag": any;
                "X-UA-Compatible": any;
                "X-XSS-Protection": any;
            };
        }
        namespace xhrequest {
            /**
             * @description Defaults values for object with key/value
             */
            type BasicValues = object | string | number | boolean | (string | number | boolean)[];
            /**
             * @description Append some value to Object
             * @param {BasicValues} A
             */
            type ObjectWith<A = BasicValues> = Record<string | number, A extends BasicValues ? A : (BasicValues | A)>;
            /**
             * @description Create Object with only specified values.
             */
            type ObjectOnly<B extends any> = Record<string | number, B>;
            /**
             * @description Valid values for input request
             */
            type Inputs = string | URLSearchParams | FormData | ObjectWith;
            /**
             * @description Valid values for Files input request.
             */
            type Binary = File | FileList | Blob | BufferSource | ReadableStream<Uint8Array>;
            /**
             * @description Valid Headers values for haders inputs request.
             */
            type Headers = globalThis.Headers | ObjectOnly<number | string | []> & {
                [K in keyof HTTP.Headers]?: HTTP.Headers[K];
            };
            /**
             * @description Default events for Listeners of request.
             */
            interface EventListener {
                before<R extends RequestInit, O extends Options>(req: R, opt: O): void;
                success<R extends Response>(res: R): R;
                error(err: Error): Promise<any>;
            }
            /**
             * @description Driver manager for intercept request and evaluate response.
             * @description Alias for {@link EventListener.before}
             */
            type Driver = (req: RequestInit, opt: Options) => Promise<Request>;
            /**
             * @description RequestInit is object with request configurations self, this object is passed to {@link Driver}
             */
            type RequestInit = {
                [K in keyof globalThis.RequestInit]?: globalThis.RequestInit[K];
            } & {
                url?: string;
                headers?: Headers;
                /**
                 * @deprecated
                 * This property is deprecated in the class, but in its case you can use {@link RequestInit.inputs "inputs"}.
                 */
                body?: any;
                /**
                 * @description Use this property for send JSON or FormData
                 * Note: No use for Files, use files with File | FileList | Blob ...
                 * @example
                 * inputs: new FormData()
                 * inputs: "username=arcaela&password=******"
                 * inputs: { username:"arcaela" }
                 */
                inputs?: Record<string | number, BasicValues>;
                /**
                 * Files is used to send files or Blobs to Server, use Key/value structure.
                 * @example
                 * files: {
                 *  "profile": document.querySelector("#myPicture"),
                 *  "uploads": document.querySelector("#multi_files").files,
                 *  "mp4": document.querySelector("#multi_files").files[ 0 ],
                 *  "README.md": new Blob(["## Title\n> subtitle"], { type:"text/markdown"})
                 * }
                 *
                 * // or
                 * files: document.querySelector("#myPicture")
                 */
                files?: Record<string | number, string | Blob | File[]>;
                method: HTTP.Methods;
            };
            type Options = {
                /**
                 * @description List of listener events for the events in the request.
                 */
                events: {
                    [K in keyof EventListener]: EventListener[K][];
                };
                cache: number;
                /**
                 * @description Name of the active "driver" available to make the request.
                 */
                driver: string;
                /**
                 * @description List with names of the "drivers" available to make requests.
                 */
                drivers: Record<string, (req: RequestInit, opt: Options) => Promise<Response>>;
            };
        }
    }
}
/**
 * @class
 */
declare class xhrequest {
    private request;
    private options;
    /**
     * @constructor
     * @description Initiate xhrequest
     */
    constructor(url?: string, request?: Arcaela.xhrequest.RequestInit);
    _domain: string;
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * XHR.domain("https://api.example.com/"); // Set domain
     */
    static domain(domain: string | URL): void;
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * XHR.domain("https://api.example.com/"); // Set domain
     */
    domain(domain: string | URL): this;
    /**
     * @description Use this method to define the url that will be used in the request,
     * if the url does not include a specified server or protocol,
     * the url or "end point" will be concatenated with the domain that has been specified.
     * @example
     * var req = new XHR();
     *
     * //Send to https://api.example.com/user/8264
     * req.url("/user/8264")
     *
     * //Send to https://pay.site.com/checkout/12
     * req.url("https://pay.site.com/checkout/12")
     */
    url(url: string | URL): this;
    /**
     * @description This method specifies the "method" header for the request.
     * @example
     * var req = new XHR();
     * req.method("PUT"); // POST GET PUT DELETE OPTIONS HEAD CONNECT TRACE PATCH
     */
    method(method: Arcaela.HTTP.Methods): this;
    /**
     * @description We are going to configure the headers that are sent in the request, either with common or custom headers.
     * @example
     * req.headers( new Headers() ) // define Content-Type
     * req.headers( "Content-Type", "application/json" ) // define Content-Type
     * req.headers({
     *  "Content-Type":"application/json",
     *  "Allow-Methods":"POST,GET"
     * }) // define multiple Headers
     */
    header(headers: Arcaela.xhrequest.Headers, overwrite?: boolean): this;
    header<K extends keyof Arcaela.HTTP.Headers, V extends Arcaela.HTTP.Headers[K]>(key: K, v: V): this;
    /**
     * @description Append Key/Value from JSON, INPUT or Key/Value
     * @example
     * // Set input request with "INPUT name attr" and value.
     * req.input( document.getElementById("username") )
     *
     * // Set input request with "myCustomKey" and value.
     * req.input("myCustomKey", document.getElementById("username") )
     *
     * // Set input request as { username:"arcaela" }
     * req.input({"username":"arcaela"})
     *
     * // Set input request as { username:"arcaela" }
     * req.input("username", "arcaela")
     */
    input(input: HTMLInputElement): this;
    input(key: string, input: HTMLInputElement): this;
    input(form: FormData, overwrite?: boolean): this;
    input(queryString: string | URLSearchParams, overwrite?: boolean): this;
    input(key: string | number, value: Arcaela.xhrequest.BasicValues): this;
    input(inputs: Arcaela.xhrequest.ObjectWith): this;
    /**
     * @description Use this method if you want to append files to the request.
     * @example
     * req.file( document.querySelector("[name=my-picture]") ) // Add File to request with "my-picture" key.
     * req.file( "picture", document.querySelector("[name=my-picture]").files ) // Add File[] to request with "my-picture" key.
     *
     * req.file("README.md", new Blob([`## Title\n> Second line & subtitle`], {type:"text/markdown"}) )
     *
     * req.request.files['README.md'].type
     * // output: "text/markdown"
     */
    file(input: HTMLInputElement): this;
    file(key: string, input: HTMLInputElement): this;
    file(filename: string, blob: Blob | File | FileList | File[] | ArrayBuffer | ReadableStream<Uint8Array>): this;
    /**
     * @description Add or Merge Request Properties
     * @example
     * req.merge("mode", "cors")
     * req.merge("redirect", "follow")
     *
     * req.merge(new Headers)
     * req.merge("headers", new Headers)
     *
     * req.merge(new FormData || new URLSearchParams)
     * req.merge("inputs", new FormData)
     *
     * req.merge(new URL)
     * req.merge("url", new URL || "/endpoint" || "http://example.com/endpoint")
     */
    merge<R extends {
        [K in keyof RequestInit]?: RequestInit[K];
    }>(request: R): this;
    merge<K extends keyof RequestInit, V extends RequestInit[K]>(key: K, value: V): this;
    /**
     * @description The "on" method add EventListener for this Class Lifecycle
     * @description All listener return unlistener for remove function of queue.
     * @example
     * //If you are interested in intercepting the requests before they are sent you can use:
     * let unlisten = XHR.on("before", (req, opt) => {
     *     // This line modify req object & add "custom-header" with "custom-value"
     *     req.headers['custom-header] = "custom-value"
     * })
     *
     * //If you are interested in intercepting the response you can use:
     * XHR.on("success", (response) => {
     *  return response.json();
     * })
     *
     * //If you are interested in intercepting the errors you can use:
     * XHR.on("error", err=> new MyCustomError(err.message))
     *
     */
    on<E extends keyof Arcaela.xhrequest.EventListener, C extends Arcaela.xhrequest.EventListener[E]>(ev: E, callback: C): () => void;
    /**
     * @description Use the "Driver" method statically to define a global "Driver" and not have to define it in each instance of the requests,
     * you just have to define it as "active" indicating the name and the second argument in TRUE.
     * @example
     * XHR.driver("axios", (req, options)=>{
     *  // Create Axios instance
     *  let Instance = axios.create({});
     *
     *  // Defining AbortController and Token with axios
     *  // You can use AborController if you want.
     *  let { cancel: abort, token } = CancelToken.source();
     *
     *  // Creating Request
     *  Instance.get(req.url, {
     *      ...req,
     *      cancelToken: token,
     *  });
     *
     *  //Adding Listeners
     *  Instance.interceptors.request.use( options.events.before, options.events.error );
     *  Instance.interceptors.response.use( options.events.success, options.events.error );
     * });
     * @description If you return a function, it will be assumed that the request cannot be canceled,
     * in case of returning an array, it will be considered to call the first argument when canceling the request.
     * @example
     * return [ abort, Instance ];
     * @param {string} name
     * @param {EventListener['before']} executor
     */
    driver<N extends string, C extends Arcaela.xhrequest.EventListener['before']>(name: N, executor: C): this;
    driver<N extends string, C extends boolean>(name: N, active: C): this;
    /**
     * @description Use the "Driver" method statically to define a global "Driver" and not have to define it in each instance of the requests,
     * you just have to define it as "active" indicating the name and the second argument in TRUE.
     * @example
     * XHR.driver("axios", (req, options)=>{
     *  // Create Axios instance
     *  let Instance = axios.create({});
     *
     *  // Defining AbortController and Token with axios
     *  // You can use AborController if you want.
     *  let { cancel: abort, token } = CancelToken.source();
     *
     *  // Creating Request
     *  Instance.get(req.url, {
     *      ...req,
     *      cancelToken: token,
     *  });
     *
     *  //Adding Listeners
     *  Instance.interceptors.request.use( options.events.before, options.events.error );
     *  Instance.interceptors.response.use( options.events.success, options.events.error );
     *
     * });
     * @description If you return a function, it will be assumed that the request cannot be canceled,
     * in case of returning an array, it will be considered to call the first argument when canceling the request.
     * @example
     * return [ abort, Instance ];
     * @param {string} name
     * @param {Arcaela.xhrequest.EventListener['before']} executor
     */
    static driver<N extends string, C extends Arcaela.xhrequest.EventListener['before']>(name: N, executor: C): void;
    /**
     * @description [DEFAULT] A negative value indicates that the cache should not be used, even if the request is very recent.
     * @example
     * // Never use cache for this request.
     * xhr.cache(-1);
     *
     * @description If a zero is specified as an argument, then the cache will be the priority, regardless of the lifetime.
     * @example
     * // If there is a cache, it is returned,
     * // otherwise the query is made, it is stored and then it will be read from the cache.
     * xhr.cache(0);
     *
     * @description
     * The "cache" method is used to store the request / response in the browser's cache and return that cache if the response time is still valid.
     * @example
     * // Store response with 1 second time age.
     * xhr.cache(1);
     *
     * @param {number|boolean} seconds - Time age of caches.
     * @param {boolean} update - Force response from server and store.
     * @returns {this}
     */
    cache(seconds?: number): this;
    /**
     * @description Use this method to call driver, but before call driver "BeforeEvents" are dispatched, and after success response
     * "SuccessEvents" will be dispatched or catch errors with "ErrorEvents".
     * @param {function} then - Interxeptor for response after {@link Arcaela.xhrequest.EventListener Success events}
     * @param {function} [handler] - Catch for errors after {@link Arcaela.xhrequest.EventListener Errors Events}
     * @returns {Promise}
     */
    then(then?: (res: Response) => Promise<any>, handler?: (err: Error) => Promise<any>): Promise<any>;
}
export default xhrequest;
