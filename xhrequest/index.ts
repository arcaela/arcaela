import { Fatal } from '@arcaelas/utils'
declare global {
    namespace Arcaela {
        namespace HTTP {
            /**
             * @description All HTTP Methods
             */
            type Methods = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH"
            /**
             * @description All valid Cache-Control
             */
            type CacheControl = RequestCache | "must-revalidate" | "no-transform" | "public" | "private" | "proxy-revalidate" | `max-age=${number}` | `s-maxage=${number}`
            /**
             * @description All common HTTP headers
             */
            type Headers = {
                "Accept-Ranges": any
                "Access-Control-Allow-Credentials": boolean | string
                "Access-Control-Allow-Headers": string | []
                "Access-Control-Allow-Methods": Methods | `${Methods},${string}`
                "Access-Control-Allow-Origin": any
                "Access-Control-Expose-Headers": string | []
                "Access-Control-Max-Age": number
                "Age": number
                "Allow": Methods | `${Methods},${string}`
                "Alternate-Protocol": any
                "Cache-Control": CacheControl
                "Client-Date": any
                "Client-Peer": any
                "Client-Response-Num": any
                "Connection": any
                "Content-Disposition": any
                "Content-Encoding": any
                "Content-Language": any
                "Content-Length": number
                "Content-Location": any
                "Content-MD5": any
                "Content-Range": any
                "Content-Security-Policy-Report-Only": any
                "Content-Security-Policy, X-Content-Security-Policy, X-WebKit-CSP": any
                "Content-Type": "text/plain" | "application/json" | "multipart/form-data" | "application/x-www-form-urlencoded" | "application/xml" | "text/html" | "image/gif" | "image/jpeg"
                "Date": any
                "ETag": any
                "Expires": number | string
                "HTTP": any
                "Keep-Alive": any
                "Last-Modified": any
                "Link": any
                "Location": any
                "P3P": any
                "Pragma": "no-cache"
                "Proxy-Authenticate": any
                "Proxy-Connection": any
                "Refresh": any
                "Retry-After": any
                "Server": any
                "Set-Cookie": any
                "Status": any
                "Strict-Transport-Security": any
                "Timing-Allow-Origin": any
                "Trailer": any
                "Transfer-Encoding": any
                "Upgrade": any
                "UserAgent": string
                "Vary": any
                "Via": any
                "Warning": any
                "WWW-Authenticate": any
                "X-Aspnet-Version": any
                "X-Content-Type-Options": any
                "X-Frame-Options": any
                "X-Permitted-Cross-Domain-Policies": any
                "X-Pingback": any
                "X-Powered-By": any
                "X-Robots-Tag": any
                "X-UA-Compatible": any
                "X-XSS-Protection": any
                [k: string]: boolean | number | string | []
            }
        }
        export namespace XHRequest {
            /**
             * @description Defaults values for object with key/value
             */
            type BasicValues = object | string | number | boolean | (string | number | boolean)[]
            /**
             * @description These are the fields that will be sent in the request.
             */
            type Data = string | URLSearchParams | FormData | Record<string | number, BasicValues | globalThis.File | globalThis.FileList>
            /**
             * @description Request is object with request configurations self, this object is passed to {@link Driver}
             */
            type RequestInit = { [K in keyof globalThis.RequestInit]?: globalThis.RequestInit[K] } & {
                /**
                 * @description URL target.
                 */
                url: string
                /**
                 * @description Request Method GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH.
                 */
                method: HTTP.Methods | `REMOVE${string}`
                /**
                 * @description Headers Key/Values for this request.
                 */
                headers?: {
                    [K in keyof HTTP.Headers]?: HTTP.Headers[K]
                }
                /**
                 * @deprecated
                 * @description This property is deprecated in the class, but in its case you can use {@link RequestInit.data}.
                 */
                readonly body?: any
                /**
                 * @description Use this property for send JSON or FormData
                 * @example
                 * data: new FormData()
                 * data: new URLSearchParams()
                 * data: "username=arcaelas&password=secret"
                 * data: { username:"arcaelas", password:'secret' }
                 */
                data?: Data
            }
            type Request = globalThis.Request & {
                /**
                 * @description Current target URL.
                 */
                url: string
                /**
                 * @description All headers in this request.
                 */
                headers: globalThis.Headers
                /**
                 * @deprecated
                 * @description This property is deprecated in the class, but in its case you can use {@link RequestInit.data}.
                 */
                readonly body?: any
                /**
                 * @description Use this property for send JSON or FormData
                 */
                data: Record<string|number, any>
            }
            /**
             * @description Options, includes all the appended properties that you want to pass to the instance without affecting the body of the request.
             */
            type Options = {
                /**
                 * @description List of proxies for the request & response.
                 */
                proxies: {
                    [K in keyof Proxies]?: Proxies[K]
                }
                /**
                 * @description Name of the active "driver" available to make the request.
                 */
                driver: string
                /**
                 * @description List with names of the "drivers" available to make requests.
                 */
                drivers: Record<string, (req: globalThis.Request, opt: Options) => Promise<Response>>
                /**
                 * @description Prop for options
                 */
                [k: string]: any
            }
            /**
             * @description Proxies are used to intercept requests and responses from the created instance.
             */
            interface Proxies {
                request: ((req: globalThis.Request, next: (s?: any) => void, options: Arcaela.XHRequest.Options) => void)[]
                response: ((res: Response, next: (s?: any) => void, req: globalThis.Request, options: Arcaela.XHRequest.Options) => void)[]
            }
            /**
             * @description Driver manager for intercept request and evaluate response.
             */
            type Driver = Options['drivers']['active'];
        }
    }
}

/**
 * @class
 */
class XHRequest {
    private request: Arcaela.XHRequest.RequestInit = {
        data:{},
        method: "GET",
        headers: {},
        url: window.location.href,
    }
    private options: Arcaela.XHRequest.Options = {
        driver: 'fetch',
        drivers: {
            fetch: require("./fetch-driver"),
        },
        proxies: {
            request: [],
            response: [],
        }
    }
    /**
     * @constructor
     * @description Initiate XHRequest
     */
    constructor(url: string | URL | Arcaela.XHRequest.RequestInit, request: Arcaela.XHRequest.RequestInit) {
        if (typeof url === 'string' || url instanceof URL) this.url(url).merge(request);
        else if (typeof url === 'object') this.merge(request);
    }
    _domain: string = window.location.origin
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * XHRequest.domain("https://api.example.com/"); // Set domain for all requests.
     */
    static domain(domain: string | URL): void {
        XHRequest.prototype._domain = domain instanceof URL ? domain.toString() : ((
            typeof domain === 'string' && domain.match(/^[a-z0-9]+\:\/\//)
        ) ? domain : window.location.origin);
    }
    /**
     * @description Use this prop to specified domain end point for request.
     * @example
     * instance.domain("https://api.example.com/"); // Set domain
     */
    public domain(domain: string | URL): this {
        this._domain = domain instanceof URL ? domain.toString() : ((
            typeof domain === 'string' && domain.match(/^[a-z0-9]+\:\/\//)
        ) ? domain : window.location.origin);
        return this;
    }
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
    public url(url: string | URL): this;
    public url(url: string | URL) {
        this.request.url = url instanceof URL ? url.toString() : (
            (typeof url === "string" && !url.match(/^(\/\/)?[a-zA-Z0-9]+\:/)) ? this._domain.concat(url) : url
        );
        return this;
    }
    /**
     * @description This method specifies the "method" header for the request.
     * @example
     * var req = new XHR();
     * req.method("PUT"); // POST GET PUT DELETE OPTIONS HEAD CONNECT TRACE PATCH
     */
    public method(method: Arcaela.HTTP.Methods): this {
        this.request.method = method;
        return this;
    }
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
    public header(headers: Arcaela.HTTP.Headers, overwrite?: boolean): this
    public header<K extends keyof Arcaela.HTTP.Headers, V extends Arcaela.HTTP.Headers[K]>(key: K, v: V): this;
    public header(...props: any[]) {
        let [key, value = false] = props;
        if (typeof key === "object") {
            if (value === true) this.request.headers = {};
            if (key instanceof Headers) key.forEach((v, k, h) => this.request.headers && (this.request.headers[k]=String(h.get(k))));
            else Object.assign(this.request.headers, key);
        } else if (this.request.headers && key === "string")
            this.request.headers[key] = value;
        return this;
    }
    /**
     * @description Append Key/Value from JSON, INPUT or Key/Value
     * @example
     * // Set input request with "INPUT name attr" and value.
     * req.input( document.getElementById("username") )
     * 
     * // Set input request with "myCustomKey" and value.
     * req.input("myCustomKey", document.getElementById("username") )
     * 
     * // Set input request as { username:"arcaelas" }
     * req.input({"username":"arcaelas"})
     * 
     * // Set input request as { username:"arcaelas" }
     * req.input("username", "arcaelas")
     */
    public input(input: HTMLInputElement): this;
    public input(key: string, input: HTMLInputElement): this;
    public input(form: FormData, overwrite?: boolean): this;
    public input(queryString: string | URLSearchParams, overwrite?: boolean): this;
    public input(key: string | number, value: Arcaela.XHRequest.BasicValues): this;
    public input(inputs: Arcaela.XHRequest.Data): this;
    public input(...props: any[]) {
        let [key, value = false] = props;
        this.request.data ||= {};
        if (key instanceof HTMLInputElement) {
            if (key.type === 'file') return this.file(key);
            this.request.data[key.name] = key.type === "checkbox" ? key.checked : key.value;
        } else if (typeof key === 'string' && value instanceof HTMLInputElement) {
            if (value.type === 'file') return this.file(key, value);
            this.request.data[key] = value.type === "checkbox" ? value.checked : value.value;
        } else if (key instanceof FormData) {
            let object = {};
            key.forEach((v, k) => object[k] = k in object ? [].concat(object[k], v) : v);
            if (value === true) this.request.data = object;
            else Object.assign(this.request.data, object);
        } else if (key instanceof URLSearchParams || (props.length === 1 && typeof key === "string")) {
            let object = {};
            (new URLSearchParams(key)).forEach((v, k) => object[k] = v);
            if (value === true) this.request.data = object;
            else Object.assign(this.request.data, object);
        } else if (['string', 'number'].find(e => e === typeof key) && typeof value === 'object') {
            this.request.data[key] = value;
        } else if (typeof key === 'object') {
            let object = {};
            for (let K in key) {
                let V = key[K];
                if ((V instanceof Blob) || (V instanceof File) || (V instanceof FileList) || (V instanceof ArrayBuffer))
                    this.file(K, V);
                else if (V instanceof HTMLInputElement)
                    this.input(K, V);
                else object[K] = V;
            }
            if (value === true) this.request.data = object;
            else Object.assign(this.request.data, object);
        }
        return this;
    }
    /**
     * @description Use this method if you want to append files to the request.
     * @example
     * req.file( document.querySelector("[name=my-picture]") ) // Add File to request with "my-picture" key.
     * req.file( "picture", document.querySelector("[name=my-picture]").files ) // Add File[] to request with "my-picture" key.
     * 
     * req.file("README.md", new Blob([`## Title\n> Second line & subtitle`], {type:"text/markdown"}) )
     * 
     * req.request.data['README.md'].type
     * // output: "text/markdown"
     */
    public file(input: HTMLInputElement): this;
    public file(key: string, input: HTMLInputElement): this;
    public file(filename: string, blob: Blob | File | FileList | File[] | ArrayBuffer | ReadableStream<Uint8Array>): this;
    public file(...props: any[]) {
        let [key, blob] = props;
        let isFile = e => (blob instanceof Blob || blob instanceof File || blob instanceof ReadableStream || blob instanceof ArrayBuffer);
        if (key instanceof HTMLInputElement) {
            if (key.type !== 'file') return this.input(key);
            let files = [];
            for (let i = 0; key.files && i < key.files.length; i++) files.push(key.files.item(i));
            this.request.data[key.name] = key.multiple ? files : files.shift();
        } else if (typeof key === "string") {
            if (blob instanceof HTMLInputElement) {
                if (blob.type !== "file") return this.input(key, blob);
                let files = [];
                for (let i = 0; i < blob.files.length; i++) files.push(blob.files.item(i));
                this.request.data[key] = blob.multiple ? files : files.shift();
            }
            else if (blob instanceof Array) this.request.data[key] = blob.filter(isFile);
            else if (isFile(blob)) this.request.data[key] = blob;
        }
        return this;
    }
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
     * req.merge("data", new FormData)
     * 
     * req.merge(new URL)
     * req.merge("url", new URL || "/endpoint" || "http://example.com/endpoint")
     */
    public merge<R extends Arcaela.XHRequest.RequestInit>(request: R): this;
    public merge<K extends keyof Arcaela.XHRequest.RequestInit, V extends Arcaela.XHRequest.RequestInit[K]>(key: K, value: V): this;
    public merge(...props: any[]) {
        let [key, value, ...rest] = props;
        let object: Record<string, any> = {};
        if (typeof key === 'string') object[key] = value;
        else if (key instanceof URL) object['url'] = key, rest = [value].concat(rest);
        else if (key instanceof Headers) object['headers'] = key, rest = [value].concat(rest);
        else if (key instanceof FormData || key instanceof URLSearchParams) object['data'] = key, rest = [value].concat(rest);
        else if (key && typeof key === 'object') {
            Object.assign(object, key);
            rest = [value].concat(rest);
        }
        for (let key in object) {
            let value = object[key];
            if(["headers"].includes( key ))
                this.header(value, ...rest);
            else if(["body", "data"].includes( key ))
                this.input(value, ...rest);
            else this.request[key] = value;
        }
        return this;
    }
    /**
     * @description The "proxy" method add EventListener for this Class Lifecycle
     * @description All listener return unlistener for remove function of queue.
     * @example
     * //If you are interested in intercepting the requests before they are sent you can use:
     * let unlisten = XHRequest.proxy("request", (req, next, options) => {
     *     // This line modify req object & add "custom-header" with "custom-value"
     *     req.headers.set('custom-header','custom-value');
     *     next(); // Continue life Cycle
     * })
     * 
     * //If you are interested in intercepting the response you can use:
     * XHRequest.proxy("response", (response, next, request, options) => {
     *   if(response.status===500) next( new Error("We are experiencing internal server failures.") );
     *   else next();
     * })
     * 
     */
    public proxy<E extends keyof Arcaela.XHRequest.Proxies, C extends Arcaela.XHRequest.Proxies[E][0]>(ev: E, callback: C): () => void
    public proxy(...props: any[]) {
        let [ event , callback ] = props;
        (this.options.proxies[event] ||= []).push(callback);
        return () => this.options.proxies[event].splice(this.options.proxies[event].findIndex(e => e === callback), 1);
    }
    /**
     * @description Use the "Driver" method statically to define a global "Driver" and not have to define it in each instance of the requests,
     * you just have to define it as "active" indicating the name and the second argument in TRUE.
     * @example 
     * XHRequest.driver("axios", (req, options)=>{
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
    // public driver<N extends string, C extends Arcaela.XHRequest.EventListener['before']>(name: N, executor: C) : this;
    // public driver<N extends string, C extends boolean>(name: N, active: C) : this;
    // public driver(...props: any[]){
    //     let [ name, driver ] = props;
    //     if(typeof name!=='string') new Fatal("type/string");
    //     else if(typeof driver==='function') this.options.drivers[ name ] = driver;
    //     else if(typeof driver==='boolean'){
    //         if(!driver) new Fatal("You cannot disable a handler, in its case you can select another handler using its name and the TRUE argument.");
    //         else if(!(name in this.options.drivers))
    //             new Fatal("It seems that the driver is not stored, in this case you must define the driver using the \"driver\" method (static or public) to define the driver.");
    //         else this.options.driver = name;
    //     }
    //     return this;
    // }
    /**
     * @description Use the "Driver" method statically to define a global "Driver" and not have to define it in each instance of the requests,
     * you just have to define it as "active" indicating the name and the second argument in TRUE.
     * @example 
     * XHRequest.driver("axios", (req, options)=>{
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
     * @param {Arcaela.XHRequest.EventListener['before']} executor 
     */
    // static driver<N extends string, C extends Arcaela.XHRequest.EventListener['before']>(name: N, executor: C) : void;
    // static driver(...props: any[]){
    //     let [ name, driver = true ] = props;
    //     if(typeof name!=='string') new Fatal("type/string");
    //     else if(typeof driver==='function') XHRequest.prototype.options.drivers[ name ] = driver;
    //     else if(typeof driver==='boolean'){
    //         if(!driver) new Fatal("You cannot disable a handler, in its case you can select another handler using its name and the TRUE argument.");
    //         else if(!(name in XHRequest.prototype.options.drivers))
    //             new Fatal("It seems that the driver is not stored, in this case you must define the driver using the \"driver\" method (static or public) to define the driver.");
    //         else XHRequest.prototype.options.driver = name;
    //     }
    // }
    /**
     * @description Use this method to call driver, but before call driver "BeforeEvents" are dispatched, and after success response
     * "SuccessEvents" will be dispatched or catch errors with "ErrorEvents".
     * @param {function} then - Interxeptor for response after {@link Arcaela.XHRequest.EventListener Success events}
     * @param {function} [handler] - Catch for errors after {@link Arcaela.XHRequest.EventListener Errors Events}
     * @returns {Promise}
     */
    public async then(then?: (res: Response) => Promise<any>, handler?: (err: Error) => Promise<any>) {

        const driver = typeof this.options.driver === 'function' ? this.options.driver : this.options.drivers[this.options.driver];
        if(typeof driver!=='function') new Fatal("type/function");

        this.request.headers['Content-Type'] ||= "application/json";
        let _request = {
            headers: new Headers( this.request.headers ),
        };
        
        
        for(let key in this.request){
            if(key==='data') {
                switch( String(_request.headers.get("content-type")).toLocaleLowerCase() ){
                                        
                }

            } else if(key!=='headers') _request[ key ] = this.request[ key ];
        }


        const request = new Request(this.request.url, this.request);
        const state : { value:any, set():void } = { value:"nextTick", set(v="nextTick"){ this.value = v; } };
        for (let _proxy of this.options.proxies.request){
            await _proxy(request, state.set, this.options);
            if(state.value==='nextTick') continue;
            else if(state.value instanceof Error) throw state.value;
            else if(state.value instanceof Promise) return state.value;
            else if(typeof state.value ==='string') return state.value;
        }

        driver( request, this.options)

    }

}





export default XHRequest;